import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import { syncProduct, createNotification } from '../services/api';
import { z } from 'zod';

const supplierSchema = z.object({
	materialName: z.string().min(1, 'Material Name is required'),
	supplierName: z.string().min(1, 'Supplier Name is required'),
	batchNumber: z.string().min(1, 'Batch Number is required'),
	supplyDate: z.string().min(1, 'Supply Date is required'),
	quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
		message: 'Quantity must be a positive number',
	}),
	unit: z.string().min(1, 'Unit is required'),
	source: z.string().min(1, 'Source Location is required'),
	qualityCertificate: z.string().min(1, 'Quality Certificate is required'),
	storageConditions: z.string().min(1, 'Storage Conditions are required'),
	expiryDate: z.string().min(1, 'Expiry Date is required'),
	contactPerson: z.string().min(1, 'Contact Person is required'),
	phoneNumber: z.string().min(1, 'Phone Number is required'),
}).refine((data) => {
	const supplyDate = new Date(data.supplyDate);
	const expiryDate = new Date(data.expiryDate);
	return expiryDate > supplyDate;
}, {
	message: 'Expiry Date must be after Supply Date',
	path: ['expiryDate'],
});

interface RawMaterialFormData {
	materialName: string;
	supplierName: string;
	batchNumber: string;
	supplyDate: string;
	quantity: string;
	unit: string;
	source: string;
	qualityCertificate: string;
	storageConditions: string;
	expiryDate: string;
	contactPerson: string;
	phoneNumber: string;
}

const SupplierForm: React.FC = () => {
	const { contract, isConnected, connectWallet, account } = useWeb3();
	const [formData, setFormData] = useState<RawMaterialFormData>({
		materialName: '',
		supplierName: '',
		batchNumber: '',
		supplyDate: '',
		quantity: '',
		unit: 'kg',
		source: '',
		qualityCertificate: '',
		storageConditions: '',
		expiryDate: '',
		contactPerson: '',
		phoneNumber: ''
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const [txHash, setTxHash] = useState<string | null>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

		const result = supplierSchema.safeParse(formData);
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
				materialName: formData.materialName,
				supplierName: formData.supplierName,
				source: formData.source,
				supplyDate: formData.supplyDate,
				quantity: formData.quantity,
				unit: formData.unit,
				qualityCertificate: formData.qualityCertificate,
				storageConditions: formData.storageConditions,
				contactPerson: formData.contactPerson,
				phoneNumber: formData.phoneNumber
			});

			let tx;
			try {
				// CORRECTED: changed addRawMaterial to createProduct
				tx = await contract.createProduct(productId, formData.materialName, note);
				setTxHash(tx.hash);
				await tx.wait();
			} catch (blockchainErr: any) {
				console.error('Blockchain transaction failed:', blockchainErr);
				setError(`Blockchain Error: ${blockchainErr.message || 'Transaction failed'}. Attempting to sync data to database anyway...`);
			}

			try {
				let name = formData.materialName;
				let holder = account || '';
				let stage = 1;
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
					userAddress: account || '',
					currentHolder: holder,
					stage: stage,
					history: historyArray,
					exists: true,
					quantity: formData.quantity,
					unit: formData.unit,
					expiryDate: formData.expiryDate,
					txHash: tx?.hash || 'OFF-CHAIN-SYNC',
					supplierName: formData.supplierName,
					supplyDate: formData.supplyDate,
					source: formData.source,
					qualityCertificate: formData.qualityCertificate,
					storageConditions: formData.storageConditions,
					contactPerson: formData.contactPerson,
					phoneNumber: formData.phoneNumber
				} as any);

				try {
					// 1. Notify Transporter (Pickup Request)
					await createNotification({
						recipientRole: 'transport',
						senderRole: 'supplier',
						senderAddress: account || 'Unknown',
						// CORRECTED: Use formData.source for pickup location
						message: `New Raw Material batch #${formData.batchNumber} is ready for pickup at ${formData.source}`,
						type: 'pickup_request',
						batchNumber: formData.batchNumber,
						sourceLocation: formData.source
					});

					// 2. Notify Sender (Supplier - Record of execution)
					await createNotification({
						recipientRole: 'supplier',
						senderRole: 'supplier',
						senderAddress: account || 'Unknown',
						message: `Raw material batch #${formData.batchNumber} successfully registered.`,
						type: 'info',
						batchNumber: formData.batchNumber
					});

					// 3. Notify Next Participant (Manufacturer - alert of incoming)
					await createNotification({
						recipientRole: 'manufacturer',
						senderRole: 'supplier',
						senderAddress: account || 'Unknown',
						message: `Incoming raw material alert: #${formData.batchNumber} is prepared for your production line.`,
						type: 'info',
						batchNumber: formData.batchNumber
					});
				} catch (notifErr) {
					console.error('Failed to send notifications:', notifErr);
				}
			} catch (syncErr) {
				console.error('Failed to sync to database:', syncErr);
				if (!error) setError('Blockchain succeeded but database sync failed. Please check backend connection.');
			}

			const newTask = {
				type: 'raw_material' as const,
				title: `Raw Material Added: ${formData.materialName}`,
				description: `Added ${formData.quantity} ${formData.unit} of ${formData.materialName} from ${formData.supplierName}`,
				status: 'completed' as const,
				user: 'Supplier',
				// CORRECTED: Use source instead of location
				details: `Batch: ${formData.batchNumber} | Location: ${formData.source} | TX: ${tx?.hash?.substring(0, 10)}...`
			};

			const existingTasks = JSON.parse(localStorage.getItem('pharmaTasks') || '[]');
			const taskWithId = { ...newTask, id: Date.now().toString(), timestamp: new Date().toISOString() };
			localStorage.setItem('pharmaTasks', JSON.stringify([taskWithId, ...existingTasks]));

			setIsSubmitting(false);
			setSubmitted(true);

			setTimeout(() => {
				setSubmitted(false);
				setFormData({
					materialName: '',
					supplierName: '',
					batchNumber: '',
					supplyDate: '',
					quantity: '',
					unit: 'kg',
					source: '',
					qualityCertificate: '',
					storageConditions: '',
					expiryDate: '',
					contactPerson: '',
					phoneNumber: ''
				});
				setTxHash(null);
			}, 3000);
		} catch (err: any) {
			console.error('Error creating product:', err);
			setError(err.message || 'Failed to create product on blockchain.');
			setIsSubmitting(false);
		}
	};

	if (submitted) {
		return (
			<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.3)] rounded-2xl p-8 text-center animation-fadeInUp">
				<h3 className="text-2xl font-bold text-brand-green mb-2">Raw Material Registered ✅</h3>
				<p className="text-white/70">Material batch added and notification sent to transporter.</p>
				{txHash && (
					<p className="text-brand-blue text-sm mt-2 break-all">TX: {txHash}</p>
				)}
			</div>
		);
	}

	return (
		<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.2)] rounded-2xl p-8 animation-fadeInUp">
			<div className="flex items-center mb-6">
				<div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4"><span>🏭</span></div>
				<div>
					<h2 className="text-xl font-semibold">Raw Material Entry</h2>
					<p className="text-white/70 text-sm">Register new raw material batch</p>
				</div>
			</div>

			{error && (
				<div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl">
					<p className="text-red-500">{error}</p>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm mb-2 font-medium">Material Name *</label>
						<input type="text" name="materialName" value={formData.materialName} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.materialName ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green transition-colors`} placeholder="e.g., Active Pharmaceutical Ingredient" />
						{fieldErrors.materialName && <p className="text-red-500 text-xs mt-1">{fieldErrors.materialName}</p>}
					</div>
					<div>
						<label className="block text-sm mb-2 font-medium">Supplier Name *</label>
						<input type="text" name="supplierName" value={formData.supplierName} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.supplierName ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green transition-colors`} placeholder="PharmaCorp Industries" />
						{fieldErrors.supplierName && <p className="text-red-500 text-xs mt-1">{fieldErrors.supplierName}</p>}
					</div>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm mb-2 font-medium">Source Location *</label>
						<input type="text" name="source" value={formData.source} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.source ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green transition-colors`} placeholder="Warehouse/Facility Location" />
						{fieldErrors.source && <p className="text-red-500 text-xs mt-1">{fieldErrors.source}</p>}
					</div>
					<div>
						<label className="block text-sm mb-2 font-medium">Batch Number *</label>
						<input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.batchNumber ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green transition-colors`} placeholder="RM-2024-001" />
						{fieldErrors.batchNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.batchNumber}</p>}
					</div>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
					<div>
						<label className="block text-sm mb-2 font-medium">Quantity *</label>
						<input type="text" name="quantity" value={formData.quantity} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.quantity ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green transition-colors`} placeholder="1000" />
						{fieldErrors.quantity && <p className="text-red-500 text-xs mt-1">{fieldErrors.quantity}</p>}
					</div>
					<div>
						<label className="block text-sm mb-2 font-medium">Unit *</label>
						<select name="unit" value={formData.unit} onChange={handleChange} className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green">
							<option value="kg">kg</option>
							<option value="liters">liters</option>
							<option value="units">units</option>
						</select>
					</div>
					<div>
						<label className="block text-sm mb-2 font-medium">Supply Date *</label>
						<input type="date" name="supplyDate" value={formData.supplyDate} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.supplyDate ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green transition-colors`} />
						{fieldErrors.supplyDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.supplyDate}</p>}
					</div>
				</div>

				<div>
					<label className="block text-sm mb-2 font-medium">Expiry Date *</label>
					<input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.expiryDate ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green transition-colors`} />
					{fieldErrors.expiryDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.expiryDate}</p>}
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm mb-2 font-medium">Contact Person *</label>
						<input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.contactPerson ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green transition-colors`} placeholder="John Doe" />
						{fieldErrors.contactPerson && <p className="text-red-500 text-xs mt-1">{fieldErrors.contactPerson}</p>}
					</div>
					<div>
						<label className="block text-sm mb-2 font-medium">Phone Number *</label>
						<input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.phoneNumber ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green transition-colors`} placeholder="+91 9876543210" />
						{fieldErrors.phoneNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.phoneNumber}</p>}
					</div>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm mb-2 font-medium">Quality Certificate *</label>
						<input type="text" name="qualityCertificate" value={formData.qualityCertificate} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.qualityCertificate ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green transition-colors`} placeholder="CERT-12345" />
						{fieldErrors.qualityCertificate && <p className="text-red-500 text-xs mt-1">{fieldErrors.qualityCertificate}</p>}
					</div>
					<div>
						<label className="block text-sm mb-2 font-medium">Storage Conditions *</label>
						<input type="text" name="storageConditions" value={formData.storageConditions} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.storageConditions ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green transition-colors`} placeholder="e.g., Cool and dry place" />
						{fieldErrors.storageConditions && <p className="text-red-500 text-xs mt-1">{fieldErrors.storageConditions}</p>}
					</div>
				</div>

				<button type="submit" disabled={isSubmitting} className="w-full bg-brand-green text-black rounded-md py-3 font-semibold hover:brightness-110 disabled:opacity-50 transition-all animation-pulseGlow">
					{isSubmitting ? 'Registering Material...' : 'Register Raw Material'}
				</button>
			</form>
		</div>
	);
};

export default SupplierForm;
