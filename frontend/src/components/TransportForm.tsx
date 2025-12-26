import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';

interface TransportFormData {
	vehicleId: string;
	batchNumber: string;
	pickupLocation: string;
	dropLocation: string;
	departureTime: string;
}

const TransportForm: React.FC = () => {
	const [formData, setFormData] = useState<TransportFormData>({
		vehicleId: '',
		batchNumber: '',
		pickupLocation: '',
		dropLocation: '',
		departureTime: ''
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const { contract, isConnected, connectWallet, account } = useWeb3();
	const [error, setError] = useState<string | null>(null);
	const [txHash, setTxHash] = useState<string | null>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setTxHash(null);

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
				departureTime: formData.departureTime
			});

			const tx = await contract.pickupForTransport(productId, note);
			setTxHash(tx.hash);
			await tx.wait();

			const newTask = {
				type: 'shipment' as const,
				title: `Shipment Started: ${formData.batchNumber}`,
				description: `Vehicle ${formData.vehicleId} from ${formData.pickupLocation} to ${formData.dropLocation}`,
				status: 'in_progress' as const,
				user: 'Transport',
				details: `Departure: ${formData.departureTime} | TX: ${tx.hash.substring(0, 10)}...`
			};
			const existing = JSON.parse(localStorage.getItem('pharmaTasks') || '[]');
			localStorage.setItem('pharmaTasks', JSON.stringify([
				{ ...newTask, id: Date.now().toString(), timestamp: new Date().toISOString() },
				...existing
			]));

			setIsSubmitting(false);
			setSubmitted(true);
			setTimeout(() => {
				setSubmitted(false);
				setFormData({ vehicleId: '', batchNumber: '', pickupLocation: '', dropLocation: '', departureTime: '' });
				setTxHash(null);
			}, 2000);
		} catch (err: any) {
			console.error('Error picking up for transport:', err);
			setError(err.message || 'Failed to record shipment. Make sure the product exists and you have the Transporter role.');
			setIsSubmitting(false);
		}
	};

	if (submitted) {
		return (
			<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.3)] rounded-2xl p-8 text-center animation-fadeInUp">
				<h3 className="text-2xl font-bold text-brand-green mb-2">Shipment Recorded ✅</h3>
				<p className="text-white/70">Activity added to recent activities.</p>
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
					<h2 className="text-xl font-semibold">Record Shipment</h2>
					<p className="text-white/70 text-sm">Start a shipment for a batch</p>
				</div>
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
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm mb-2">Vehicle ID *</label>
						<input name="vehicleId" value={formData.vehicleId} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green" />
					</div>
					<div>
						<label className="block text-sm mb-2">Batch Number *</label>
						<input name="batchNumber" value={formData.batchNumber} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green" />
					</div>
				</div>
				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm mb-2">Pickup Location *</label>
						<input name="pickupLocation" value={formData.pickupLocation} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green" />
					</div>
					<div>
						<label className="block text-sm mb-2">Drop Location *</label>
						<input name="dropLocation" value={formData.dropLocation} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green" />
					</div>
				</div>
				<div>
					<label className="block text-sm mb-2">Departure Time *</label>
					<input type="datetime-local" name="departureTime" value={formData.departureTime} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green" />
				</div>
				<button type="submit" disabled={isSubmitting} className="w-full bg-brand-green text-black rounded-md py-3 font-semibold hover:brightness-110 disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Save Shipment'}</button>
			</form>
		</div>
	);
};

export default TransportForm;


