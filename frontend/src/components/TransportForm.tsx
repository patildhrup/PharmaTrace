import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import { syncProduct } from '../services/api';
import { z } from 'zod';

const transportSchema = z.object({
	vehicleId: z.string().min(1, 'Vehicle ID is required'),
	batchNumber: z.string().min(1, 'Batch Number is required'),
	pickupLocation: z.string().min(1, 'Pickup Location is required'),
	dropLocation: z.string().min(1, 'Drop Location is required'),
	departureTime: z.string().min(1, 'Departure Time is required'),
	fromEntity: z.string().min(1, 'Origin Entity is required'),
	toEntity: z.string().min(1, 'Destination Entity is required'),
});

interface TransportFormData {
	vehicleId: string;
	batchNumber: string;
	pickupLocation: string;
	dropLocation: string;
	departureTime: string;
	fromEntity: string;
	toEntity: string;
}

const TransportForm: React.FC = () => {
	const [formData, setFormData] = useState<TransportFormData>({
		vehicleId: '',
		batchNumber: '',
		pickupLocation: '',
		dropLocation: '',
		departureTime: '',
		fromEntity: 'Supplier',
		toEntity: 'Manufacturer'
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [actionType, setActionType] = useState<'pickup' | 'deliver'>('pickup');
	const { contract, isConnected, connectWallet, account } = useWeb3();
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

	const handlePickup = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setFieldErrors({});
		setTxHash(null);

		// Zod Validation
		const result = transportSchema.safeParse(formData);
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
				vehicleId: formData.vehicleId,
				pickupLocation: formData.pickupLocation,
				dropLocation: formData.dropLocation,
				departureTime: formData.departureTime,
				pickedUpFrom: formData.fromEntity,
				action: 'pickup'
			});

			// Call new transporterPickup function
			let tx;
			try {
				tx = await contract.transporterPickup(
					productId,
					formData.pickupLocation,
					formData.dropLocation,
					note
				);
				setTxHash(tx.hash);
				await tx.wait();
			} catch (blockchainErr: any) {
				console.error('Blockchain transaction failed:', blockchainErr);
				setError(`Blockchain Error: ${blockchainErr.message || 'Transaction failed'}. Attempting to sync data to database anyway...`);
			}

			// Sync to backend database regardless of blockchain confirmation if possible
			try {
				let name = 'Product';
				let holder = account || '';
				let stage = 3; // Transport stage
				let historyArray: any[] = [];

				// Try to get updated info from blockchain if tx succeeded
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
					vehicleId: formData.vehicleId,
					pickupLocation: formData.pickupLocation,
					dropLocation: formData.dropLocation,
					departureTime: formData.departureTime,
					pickedUpFrom: formData.fromEntity,
					txHash: tx?.hash || 'OFF-CHAIN-SYNC'
				});
				console.log('Product sync successful');
			} catch (syncErr) {
				console.error('Failed to sync to database:', syncErr);
				if (!error) setError('Blockchain interaction had issues and database sync failed. Please check backend connection.');
			}

			setIsSubmitting(false);
			setSubmitted(true);
			setTimeout(() => {
				setSubmitted(false);
				setFormData({ vehicleId: '', batchNumber: '', pickupLocation: '', dropLocation: '', departureTime: '', fromEntity: 'Supplier', toEntity: 'Manufacturer' });
				setTxHash(null);
			}, 3000);
		} catch (err: any) {
			console.error('Error picking up for transport:', err);
			setError(err.message || 'Failed to record pickup. Make sure the product exists, is in PENDING status, and you have the Transporter role.');
			setIsSubmitting(false);
		}
	};

	const handleDeliver = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setFieldErrors({});
		setTxHash(null);

		// Zod Validation
		const result = transportSchema.safeParse(formData);
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
				vehicleId: formData.vehicleId,
				deliveryLocation: formData.dropLocation,
				arrivalTime: new Date().toISOString(),
				deliveredTo: formData.toEntity,
				action: 'deliver'
			});

			// Call new transporterDeliver function
			let tx;
			try {
				tx = await contract.transporterDeliver(
					productId,
					formData.dropLocation,
					note
				);
				setTxHash(tx.hash);
				await tx.wait();
			} catch (blockchainErr: any) {
				console.error('Blockchain transaction failed:', blockchainErr);
				setError(`Blockchain Error: ${blockchainErr.message || 'Transaction failed'}. Attempting to sync data to database anyway...`);
			}

			// Sync to backend database regardless of blockchain confirmation if possible
			try {
				let name = 'Product';
				let holder = account || '';
				let stage = 4; // Delivery stage
				let historyArray: any[] = [];

				// Try to get updated info from blockchain if tx succeeded
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
					vehicleId: formData.vehicleId,
					dropLocation: formData.dropLocation,
					deliveredTo: formData.toEntity,
					txHash: tx?.hash || 'OFF-CHAIN-SYNC'
				});
				console.log('Product sync successful');
			} catch (syncErr) {
				console.error('Failed to sync to database:', syncErr);
				if (!error) setError('Blockchain interaction had issues and database sync failed. Please check backend connection.');
			}

			setIsSubmitting(false);
			setSubmitted(true);
			setTimeout(() => {
				setSubmitted(false);
				setFormData({ vehicleId: '', batchNumber: '', pickupLocation: '', dropLocation: '', departureTime: '', fromEntity: 'Supplier', toEntity: 'Manufacturer' });
				setTxHash(null);
			}, 3000);
		} catch (err: any) {
			console.error('Error delivering:', err);
			setError(err.message || 'Failed to record delivery. Make sure the product is in IN_PROGRESS status and you have the Transporter role.');
			setIsSubmitting(false);
		}
	};

	if (submitted) {
		return (
			<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.3)] rounded-2xl p-8 text-center animation-fadeInUp">
				<div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4 animation-pulseGlow">
					<span className="text-2xl">✅</span>
				</div>
				<h3 className="text-2xl font-bold text-brand-green mb-2">
					{actionType === 'pickup' ? 'Pickup Recorded!' : 'Delivery Completed!'}
				</h3>
				<p className="text-white/70">Activity added to blockchain and recent activities.</p>
				{txHash && (
					<p className="text-brand-blue text-sm mt-2 break-all">TX: {txHash}</p>
				)}
			</div>
		);
	}

	return (
		<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.2)] rounded-2xl p-8 animation-fadeInUp">
			<div className="flex items-center mb-6">
				<div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mr-4"><span>🚚</span></div>
				<div>
					<h2 className="text-xl font-semibold">Transport Management</h2>
					<p className="text-white/70 text-sm">Pickup or deliver batches</p>
				</div>
			</div>

			{/* Action Type Selector */}
			<div className="flex space-x-4 mb-6">
				<button
					type="button"
					onClick={() => setActionType('pickup')}
					className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${actionType === 'pickup'
						? 'bg-gradient-to-r from-brand-green to-brand-blue text-black shadow-lg'
						: 'bg-gradient-to-r from-[#111] to-[#0d0d0d] text-white border-2 border-[rgba(34,197,94,0.2)] hover:border-brand-green'
						}`}
				>
					📦 Pickup Batch
				</button>
				<button
					type="button"
					onClick={() => setActionType('deliver')}
					className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${actionType === 'deliver'
						? 'bg-gradient-to-r from-brand-green to-brand-blue text-black shadow-lg'
						: 'bg-gradient-to-r from-[#111] to-[#0d0d0d] text-white border-2 border-[rgba(34,197,94,0.2)] hover:border-brand-green'
						}`}
				>
					🎯 Deliver Batch
				</button>
			</div>

			{!isConnected && (
				<div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500 rounded-xl">
					<p className="text-yellow-500 mb-2">⚠️ Please connect your MetaMask wallet</p>
					<button type="button" onClick={connectWallet} className="bg-brand-green text-black px-4 py-2 rounded-lg font-semibold">Connect Wallet</button>
				</div>
			)}
			{isConnected && account && (
				<div className="mb-6 p-4 bg-brand-green/20 border border-brand-green rounded-xl">
					<p className="text-brand-green text-sm">Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}</p>
				</div>
			)}
			{error && (
				<div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl">
					<p className="text-red-500">{error}</p>
				</div>
			)}

			{actionType === 'pickup' ? (
				<form onSubmit={handlePickup} className="space-y-6">
					<div className="grid md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm mb-2">Vehicle ID *</label>
							<input name="vehicleId" value={formData.vehicleId} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green text-white" placeholder="e.g., TR-001" />
							{fieldErrors.vehicleId && <p className="text-red-500 text-xs mt-1">{fieldErrors.vehicleId}</p>}
						</div>
						<div>
							<label className="block text-sm mb-2">Batch Number *</label>
							<input name="batchNumber" value={formData.batchNumber} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green text-white" placeholder="e.g., PCM-2024-001" />
							{fieldErrors.batchNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.batchNumber}</p>}
						</div>
					</div>
					<div className="grid md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm mb-2">Pickup Location *</label>
							<input name="pickupLocation" value={formData.pickupLocation} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green text-white" placeholder="e.g., Supplier Facility" />
							{fieldErrors.pickupLocation && <p className="text-red-500 text-xs mt-1">{fieldErrors.pickupLocation}</p>}
						</div>
						<div>
							<label className="block text-sm mb-2">Picked Up From (Role) *</label>
							<select name="fromEntity" value={formData.fromEntity} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green text-white">
								<option value="Supplier">Supplier</option>
								<option value="Manufacturer">Manufacturer</option>
								<option value="Distributor">Distributor</option>
								<option value="Retailer">Retailer</option>
							</select>
							{fieldErrors.fromEntity && <p className="text-red-500 text-xs mt-1">{fieldErrors.fromEntity}</p>}
						</div>
					</div>
					<div className="grid md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm mb-2">Drop Location *</label>
							<input name="dropLocation" value={formData.dropLocation} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green text-white" placeholder="e.g., Manufacturing Facility" />
							{fieldErrors.dropLocation && <p className="text-red-500 text-xs mt-1">{fieldErrors.dropLocation}</p>}
						</div>
						<div>
							<label className="block text-sm mb-2">Departure Time *</label>
							<input type="datetime-local" name="departureTime" value={formData.departureTime} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green text-white" />
							{fieldErrors.departureTime && <p className="text-red-500 text-xs mt-1">{fieldErrors.departureTime}</p>}
						</div>
					</div>
					<button type="submit" disabled={isSubmitting} className="w-full bg-brand-green text-black rounded-md py-3 font-semibold hover:brightness-110 disabled:opacity-50 animation-pulseGlow">
						{isSubmitting ? (
							<div className="flex items-center justify-center">
								<div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
								Recording Pickup...
							</div>
						) : (
							'📦 Record Pickup'
						)}
					</button>
				</form>
			) : (
				<form onSubmit={handleDeliver} className="space-y-6">
					<div className="grid md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm mb-2">Vehicle ID *</label>
							<input name="vehicleId" value={formData.vehicleId} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green text-white" placeholder="e.g., TR-001" />
							{fieldErrors.vehicleId && <p className="text-red-500 text-xs mt-1">{fieldErrors.vehicleId}</p>}
						</div>
						<div>
							<label className="block text-sm mb-2">Batch Number *</label>
							<input name="batchNumber" value={formData.batchNumber} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green text-white" placeholder="e.g., PCM-2024-001" />
							{fieldErrors.batchNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.batchNumber}</p>}
						</div>
					</div>
					<div className="grid md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm mb-2">Delivery Location *</label>
							<input name="dropLocation" value={formData.dropLocation} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green text-white" placeholder="e.g., Manufacturing Facility" />
							{fieldErrors.dropLocation && <p className="text-red-500 text-xs mt-1">{fieldErrors.dropLocation}</p>}
						</div>
						<div>
							<label className="block text-sm mb-2">Delivering To (Role) *</label>
							<select name="toEntity" value={formData.toEntity} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green text-white">
								<option value="Supplier">Supplier</option>
								<option value="Manufacturer">Manufacturer</option>
								<option value="Distributor">Distributor</option>
								<option value="Retailer">Retailer</option>
							</select>
							{fieldErrors.toEntity && <p className="text-red-500 text-xs mt-1">{fieldErrors.toEntity}</p>}
						</div>
					</div>
					<button type="submit" disabled={isSubmitting} className="w-full bg-brand-green text-black rounded-md py-3 font-semibold hover:brightness-110 disabled:opacity-50 animation-pulseGlow">
						{isSubmitting ? (
							<div className="flex items-center justify-center">
								<div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
								Recording Delivery...
							</div>
						) : (
							'🎯 Record Delivery'
						)}
					</button>
				</form>
			)}
		</div>
	);
};

export default TransportForm;

