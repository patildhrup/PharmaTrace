import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import { syncProduct, createNotification } from '../services/api';
import { z } from 'zod';
import { QRCodeSVG } from 'qrcode.react';
import ConfirmDelivery from './ConfirmDelivery';

const manufacturerSchema = z.object({
	drugName: z.string().min(1, 'Drug Name is required'),
	batchNumber: z.string().min(1, 'Batch Number is required'),
	location: z.string().min(1, 'Location is required'),
	manufacturingDate: z.string().min(1, 'Manufacturing Date is required'),
	expiryDate: z.string().min(1, 'Expiry Date is required'),
	quantity: z.string().min(1, 'Quantity is required'),
	unit: z.string().min(1, 'Unit is required'),
	ingredients: z.string().min(1, 'Ingredients are required'),
	manufacturerName: z.string().min(1, 'Manufacturer Name is required'),
	licenseNumber: z.string().min(1, 'License Number is required'),
	qualityGrade: z.string().min(1, 'Quality Grade is required'),
});

interface ManufacturerFormData {
	drugName: string;
	batchNumber: string;
	location: string;
	manufacturingDate: string;
	expiryDate: string;
	quantity: string;
	unit: string;
	ingredients: string;
	manufacturerName: string;
	licenseNumber: string;
	qualityGrade: string;
}

const ManufacturerForm: React.FC = () => {
	const [formData, setFormData] = useState<ManufacturerFormData>({
		drugName: '',
		batchNumber: '',
		location: '',
		manufacturingDate: '',
		expiryDate: '',
		quantity: '',
		unit: 'tablets',
		ingredients: '',
		manufacturerName: '',
		licenseNumber: '',
		qualityGrade: 'A'
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [submittedBatchNumber, setSubmittedBatchNumber] = useState('');
	const { contract, isConnected, connectWallet, account } = useWeb3();
	const [error, setError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const [txHash, setTxHash] = useState<string | null>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
		if (fieldErrors[name]) {
			setFieldErrors({ ...fieldErrors, [name]: '' });
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setFieldErrors({});

		const result = manufacturerSchema.safeParse(formData);
		if (!result.success) {
			const errors: Record<string, string> = {};
			result.error.issues.forEach((issue) => {
				if (issue.path.length > 0) {
					errors[issue.path[0].toString()] = issue.message;
				}
			});
			setFieldErrors(errors);
			return;
		}

		if (!isConnected || !contract) {
			try {
				await connectWallet();
				return;
			} catch (err: any) {
				setError(err.message || 'Please connect your MetaMask wallet');
				return;
			}
		}

		setIsSubmitting(true);

		try {
			const productId = ethers.id(formData.batchNumber);
			const note = JSON.stringify({
				drugName: formData.drugName,
				manufacturerName: formData.manufacturerName,
				location: formData.location,
				manufacturingDate: formData.manufacturingDate,
				expiryDate: formData.expiryDate,
				ingredients: formData.ingredients,
				licenseNumber: formData.licenseNumber,
				qualityGrade: formData.qualityGrade,
				quantity: formData.quantity,
				unit: formData.unit
			});

			let tx;
			try {
				tx = await contract.manufacture(productId, note);
				setTxHash(tx.hash);
				await tx.wait();
			} catch (blockchainErr: any) {
				console.error('Blockchain transaction failed:', blockchainErr);
				setError(`Blockchain Error: ${blockchainErr.message || 'Transaction failed'}. Attempting to sync data to database anyway...`);
			}

			try {
				let name = formData.drugName;
				let holder = account || '';
				let stage = 2; // Manufacturer stage
				let historyArray: any[] = [];

				if (tx) {
					try {
						const [chainName, chainHolder, chainStage] = await contract.getProduct(productId);
						const historyLength = await contract.getHistoryLength(productId);
						name = chainName;
						holder = chainHolder;
						stage = Number(chainStage);

						for (let i = 0; i < Number(historyLength); i++) {
							const [updater, role, timestamp, note] = await contract.getUpdate(productId, i);
							historyArray.push({ updater, role: Number(role), timestamp: Number(timestamp), note });
						}
					} catch (getInfoErr) {
						console.warn('Could not fetch updated info from blockchain for sync:', getInfoErr);
					}
				}

				await syncProduct({
					batchNumber: formData.batchNumber,
					productId: productId,
					name: name,
					currentHolder: holder,
					stage: stage,
					history: historyArray,
					exists: true,
					drugName: formData.drugName,
					location: formData.location,
					manufacturingDate: formData.manufacturingDate,
					expiryDate: formData.expiryDate,
					quantity: formData.quantity,
					unit: formData.unit,
					ingredients: formData.ingredients,
					manufacturerName: formData.manufacturerName,
					licenseNumber: formData.licenseNumber,
					qualityGrade: formData.qualityGrade,
					txHash: tx?.hash || 'OFF-CHAIN-SYNC'
				});

				try {
					await createNotification({
						recipientRole: 'transport',
						senderRole: 'manufacturer',
						senderAddress: account || 'Unknown',
						message: `New drug batch #${formData.batchNumber} (${formData.drugName}) is ready for pickup at ${formData.location}`,
						type: 'pickup_request',
						batchNumber: formData.batchNumber,
						sourceLocation: formData.location
					});
				} catch (notifErr) {
					console.error('Failed to send notification:', notifErr);
				}
			} catch (syncErr) {
				console.error('Failed to sync to database:', syncErr);
				if (!error) setError('Blockchain interaction had issues and database sync failed. Please check backend connection.');
			}

			const newTask = {
				type: 'drug_manufacturing' as const,
				title: `Drug Manufactured: ${formData.drugName}`,
				description: `Manufactured ${formData.quantity} ${formData.unit} of ${formData.drugName} (Batch: ${formData.batchNumber})`,
				status: 'completed' as const,
				user: 'Manufacturer',
				details: `Location: ${formData.location} | License: ${formData.licenseNumber} | TX: ${tx?.hash?.substring(0, 10)}...`
			};

			const existingTasks = JSON.parse(localStorage.getItem('pharmaTasks') || '[]');
			const taskWithId = { ...newTask, id: Date.now().toString(), timestamp: new Date().toISOString() };
			localStorage.setItem('pharmaTasks', JSON.stringify([taskWithId, ...existingTasks]));

			setIsSubmitting(false);
			setSubmitted(true);
			setSubmittedBatchNumber(formData.batchNumber);

			setTimeout(() => {
				setSubmitted(false);
				setFormData({
					drugName: '',
					batchNumber: '',
					location: '',
					manufacturingDate: '',
					expiryDate: '',
					quantity: '',
					unit: 'tablets',
					ingredients: '',
					manufacturerName: '',
					licenseNumber: '',
					qualityGrade: 'A'
				});
				setTxHash(null);
				setSubmittedBatchNumber('');
			}, 10000);
		} catch (err: any) {
			console.error('Error manufacturing product:', err);
			setError(err.message || 'Failed to manufacture product on blockchain.');
			setIsSubmitting(false);
		}
	};

	if (submitted) {
		return (
			<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.3)] rounded-2xl p-8 text-center animation-fadeInUp">
				<div className="flex flex-col md:flex-row items-center justify-center gap-8">
					<div className="flex-1">
						<h3 className="text-2xl font-bold text-brand-green mb-2">Drug Manufactured ✅</h3>
						<p className="text-white/70">Batch registered and notification sent to transporter.</p>
						{txHash && <p className="text-brand-blue text-sm mt-2 break-all">TX: {txHash}</p>}
					</div>
					<div className="bg-white p-4 rounded-xl">
						<QRCodeSVG value={submittedBatchNumber} size={150} />
						<p className="text-black text-[10px] mt-2 font-bold">{submittedBatchNumber}</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.2)] rounded-2xl p-8 animation-fadeInUp">
			<div className="flex items-center mb-6">
				<div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4"><span>⚗️</span></div>
				<div>
					<h2 className="text-xl font-semibold">Manufacturing Entry</h2>
					<p className="text-white/70 text-sm">Register new drug batch</p>
				</div>
			</div>

			{error && (
				<div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl"><p className="text-red-500">{error}</p></div>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm mb-2 font-medium">Drug Name *</label>
						<input type="text" name="drugName" value={formData.drugName} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.drugName ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green`} placeholder="e.g., Paracetamol 500mg" />
						{fieldErrors.drugName && <p className="text-red-500 text-xs mt-1">{fieldErrors.drugName}</p>}
					</div>
					<div>
						<label className="block text-sm mb-2 font-medium">Manufacturer Name *</label>
						<input type="text" name="manufacturerName" value={formData.manufacturerName} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.manufacturerName ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green`} placeholder="Global Pharma" />
						{fieldErrors.manufacturerName && <p className="text-red-500 text-xs mt-1">{fieldErrors.manufacturerName}</p>}
					</div>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm mb-2 font-medium">Facility Location *</label>
						<input type="text" name="location" value={formData.location} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.location ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green`} placeholder="Hydrabad, Telangana" />
						{fieldErrors.location && <p className="text-red-500 text-xs mt-1">{fieldErrors.location}</p>}
					</div>
					<div>
						<label className="block text-sm mb-2 font-medium">Batch Number *</label>
						<input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.batchNumber ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green`} placeholder="PCM-2024-001" />
						{fieldErrors.batchNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.batchNumber}</p>}
					</div>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
					<div>
						<label className="block text-sm mb-2 font-medium">Quantity *</label>
						<input type="text" name="quantity" value={formData.quantity} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.quantity ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green`} placeholder="5000" />
						{fieldErrors.quantity && <p className="text-red-500 text-xs mt-1">{fieldErrors.quantity}</p>}
					</div>
					<div>
						<label className="block text-sm mb-2 font-medium">Unit *</label>
						<select name="unit" value={formData.unit} onChange={handleChange} className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green">
							<option value="tablets">tablets</option>
							<option value="capsules">capsules</option>
							<option value="vials">vials</option>
							<option value="bottles">bottles</option>
						</select>
					</div>
					<div>
						<label className="block text-sm mb-2 font-medium">Quality Grade *</label>
						<select name="qualityGrade" value={formData.qualityGrade} onChange={handleChange} className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green">
							<option value="A">Grade A</option>
							<option value="B">Grade B</option>
							<option value="C">Grade C</option>
						</select>
					</div>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm mb-2 font-medium">Manufacturing Date *</label>
						<input type="date" name="manufacturingDate" value={formData.manufacturingDate} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.manufacturingDate ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green`} />
						{fieldErrors.manufacturingDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.manufacturingDate}</p>}
					</div>
					<div>
						<label className="block text-sm mb-2 font-medium">Expiry Date *</label>
						<input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.expiryDate ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green`} />
						{fieldErrors.expiryDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.expiryDate}</p>}
					</div>
				</div>

				<div>
					<label className="block text-sm mb-2 font-medium">Ingredients *</label>
					<textarea name="ingredients" value={formData.ingredients} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.ingredients ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green`} rows={3} placeholder="Active Pharmaceutical Ingredients, Excipients..." />
					{fieldErrors.ingredients && <p className="text-red-500 text-xs mt-1">{fieldErrors.ingredients}</p>}
				</div>

				<div>
					<label className="block text-sm mb-2 font-medium">License Number *</label>
					<input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.licenseNumber ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green`} placeholder="MFG-LIC-2024-889" />
					{fieldErrors.licenseNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.licenseNumber}</p>}
				</div>

				<button type="submit" disabled={isSubmitting} className="w-full bg-brand-green text-black rounded-md py-3 font-semibold hover:brightness-110 disabled:opacity-50 animation-pulseGlow transition-all">
					{isSubmitting ? 'Registering Batch...' : 'Register Manufactured Drug'}
				</button>
			</form>

			{/* Deliver confirmation for incoming shipments */}
			<ConfirmDelivery role="manufacturer" />
		</div>
	);
};

export default ManufacturerForm;
