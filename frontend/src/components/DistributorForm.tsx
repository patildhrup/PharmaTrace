import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import { syncProduct, createNotification } from '../services/api';
import { z } from 'zod';
import ConfirmDelivery from './ConfirmDelivery';

const distributorSchema = z.object({
	batchNumber: z.string().min(1, 'Batch Number is required'),
	location: z.string().min(1, 'Location is required'),
	destinationCenter: z.string().min(1, 'Destination Center is required'),
	dispatchDate: z.string().min(1, 'Dispatch Date is required'),
	packages: z.string().min(1, 'Packages count is required'),
	carrier: z.string().min(1, 'Carrier Name is required'),
});

interface DistributorFormData {
	batchNumber: string;
	location: string;
	destinationCenter: string;
	dispatchDate: string;
	packages: string;
	carrier: string;
}

const DistributorForm: React.FC = () => {
	const [formData, setFormData] = useState<DistributorFormData>({
		batchNumber: '',
		location: '',
		destinationCenter: '',
		dispatchDate: '',
		packages: '',
		carrier: ''
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const { contract, isConnected, connectWallet, account } = useWeb3();
	const [error, setError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const [txHash, setTxHash] = useState<string | null>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

		const result = distributorSchema.safeParse(formData);
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
				location: formData.location,
				destinationCenter: formData.destinationCenter,
				dispatchDate: formData.dispatchDate,
				packages: formData.packages,
				carrier: formData.carrier,
				action: 'distribute'
			});

			let tx;
			try {
				tx = await contract.receiveByDistributor(productId, note);
				setTxHash(tx.hash);
				await tx.wait();
			} catch (blockchainErr: any) {
				console.error('Blockchain transaction failed:', blockchainErr);
				setError(`Blockchain Error: ${blockchainErr.message || 'Transaction failed'}. Attempting to sync data to database anyway...`);
			}

			try {
				let name = 'Product';
				let holder = account || '';
				let stage = 5; // Distributor stage
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
					name,
					currentHolder: holder,
					stage: stage,
					history: historyArray,
					exists: true,
					location: formData.location,
					destinationCenter: formData.destinationCenter,
					dispatchDate: formData.dispatchDate,
					txHash: tx?.hash || 'OFF-CHAIN-SYNC',
					packages: formData.packages,
					carrier: formData.carrier
				});

				try {
					// 1. Notify Transporter (Pickup Request)
					await createNotification({
						recipientRole: 'transport',
						senderRole: 'distributor',
						senderAddress: account || 'Unknown',
						message: `Distributor has prepared batch #${formData.batchNumber} for shipment from ${formData.location}`,
						type: 'pickup_request',
						batchNumber: formData.batchNumber,
						sourceLocation: formData.location
					});

					// 2. Notify Sender (Distributor - Record of execution)
					await createNotification({
						recipientRole: 'distributor',
						senderRole: 'distributor',
						senderAddress: account || 'Unknown',
						message: `Batch #${formData.batchNumber} distribution recorded. Transit initiated.`,
						type: 'info',
						batchNumber: formData.batchNumber
					});

					// 3. Notify Next Participant (Retailer - alert of incoming)
					await createNotification({
						recipientRole: 'retailer',
						senderRole: 'distributor',
						senderAddress: account || 'Unknown',
						message: `Incoming batch alert: #${formData.batchNumber} is on its way to your center.`,
						type: 'info',
						batchNumber: formData.batchNumber
					});
				} catch (notifErr) {
					console.error('Failed to send notifications:', notifErr);
				}

				// Record to local Recent Activities
				const newTask = {
					type: 'shipment' as const,
					title: `Batch Distributed: #${formData.batchNumber}`,
					description: `Dispatched ${formData.packages} to ${formData.destinationCenter} via ${formData.carrier}`,
					status: 'completed' as const,
					user: 'Distributor',
					details: `Batch: ${formData.batchNumber} | Hub: ${formData.location} | TX: ${tx?.hash?.substring(0, 10)}...`
				};

				const existingTasks = JSON.parse(localStorage.getItem('pharmaTasks') || '[]');
				const taskWithId = { ...newTask, id: Date.now().toString(), timestamp: new Date().toISOString() };
				localStorage.setItem('pharmaTasks', JSON.stringify([taskWithId, ...existingTasks]));

			} catch (syncErr) {
				console.error('Failed to sync to database:', syncErr);
				if (!error) setError('Blockchain interaction had issues and database sync failed. Please check backend connection.');
			}

			setIsSubmitting(false);
			setSubmitted(true);
			setTimeout(() => {
				setSubmitted(false);
				setFormData({ batchNumber: '', location: '', destinationCenter: '', dispatchDate: '', packages: '', carrier: '' });
				setTxHash(null);
			}, 3000);
		} catch (err: any) {
			console.error('Error receiving by distributor:', err);
			setError(err.message || 'Failed to record distribution. Make sure the product exists and you have the Distributor role.');
			setIsSubmitting(false);
		}
	};

	if (submitted) {
		return (
			<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.3)] rounded-2xl p-8 text-center animation-fadeInUp">
				<h3 className="text-2xl font-bold text-brand-green mb-2">Distribution Recorded ✅</h3>
				<p className="text-white/70">Activity added and notification sent to transporter.</p>
				{txHash && <p className="text-brand-blue text-sm mt-2 break-all">TX: {txHash}</p>}
			</div>
		);
	}

	return (
		<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.2)] rounded-2xl p-8 animation-fadeInUp">
			<div className="flex items-center mb-6">
				<div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-4"><span>📦</span></div>
				<div>
					<h2 className="text-xl font-semibold">Record Distribution</h2>
					<p className="text-white/70 text-sm">Dispatch batch to distribution center</p>
				</div>
			</div>

			{error && (
				<div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl"><p className="text-red-500">{error}</p></div>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm mb-2 font-medium">Batch Number *</label>
						<input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.batchNumber ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green`} placeholder="PCM-2024-001" />
						{fieldErrors.batchNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.batchNumber}</p>}
					</div>
					<div>
						<label className="block text-sm mb-2 font-medium">Warehouse Location *</label>
						<input type="text" name="location" value={formData.location} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.location ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green`} placeholder="e.g., Delhi Distribution Hub" />
						{fieldErrors.location && <p className="text-red-500 text-xs mt-1">{fieldErrors.location}</p>}
					</div>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm mb-2 font-medium">Destination Center *</label>
						<input type="text" name="destinationCenter" value={formData.destinationCenter} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.destinationCenter ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green`} placeholder="e.g., Mumbai Regional Hub" />
						{fieldErrors.destinationCenter && <p className="text-red-500 text-xs mt-1">{fieldErrors.destinationCenter}</p>}
					</div>
					<div>
						<label className="block text-sm mb-2 font-medium">Dispatch Date *</label>
						<input type="date" name="dispatchDate" value={formData.dispatchDate} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.dispatchDate ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green`} />
						{fieldErrors.dispatchDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.dispatchDate}</p>}
					</div>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm mb-2 font-medium">Number of Packages *</label>
						<input type="text" name="packages" value={formData.packages} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.packages ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green`} placeholder="100 boxes" />
						{fieldErrors.packages && <p className="text-red-500 text-xs mt-1">{fieldErrors.packages}</p>}
					</div>
					<div>
						<label className="block text-sm mb-2 font-medium">Carrier Name *</label>
						<input type="text" name="carrier" value={formData.carrier} onChange={handleChange} className={`w-full bg-[#0d0d0d] border ${fieldErrors.carrier ? 'border-red-500' : 'border-[rgba(34,197,94,0.25)]'} rounded-md px-3 py-2 text-white focus:outline-none focus:border-brand-green`} placeholder="BlueDart Dynamics" />
						{fieldErrors.carrier && <p className="text-red-500 text-xs mt-1">{fieldErrors.carrier}</p>}
					</div>
				</div>

				<button type="submit" disabled={isSubmitting} className="w-full bg-brand-green text-black rounded-md py-3 font-semibold hover:brightness-110 disabled:opacity-50 animation-pulseGlow transition-all">
					{isSubmitting ? 'Recording Distribution...' : 'Record Distribution'}
				</button>
			</form>

			{/* Deliver confirmation for incoming shipments */}
			<ConfirmDelivery role="distributor" />
		</div>
	);
};

export default DistributorForm;
