import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';

interface ConsumerFormData {
	batchNumber: string;
}

interface ProductInfo {
	name: string;
	holder: string;
	stage: number;
	updatesCount: number;
}

interface UpdateInfo {
	updater: string;
	role: number;
	timestamp: bigint;
	note: string;
}

const STAGE_NAMES = ['Created', 'Manufactured', 'WithDistributor', 'InTransport', 'WithWholesaler', 'WithRetailer', 'Sold'];
const ROLE_NAMES = ['None', 'Supplier', 'Manufacturer', 'Distributor', 'Transporter', 'Wholesaler', 'Retailer'];

const ConsumerForm: React.FC = () => {
	const { contract, isConnected, connectWallet, account, provider } = useWeb3();
	const [formData, setFormData] = useState<ConsumerFormData>({
		batchNumber: ''
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
	const [history, setHistory] = useState<UpdateInfo[]>([]);
	const [error, setError] = useState<string | null>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setProductInfo(null);
		setHistory([]);

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
			
			// Get product info
			const [name, holder, stage, updatesCount] = await contract.getProduct(productId);
			setProductInfo({
				name,
				holder,
				stage: Number(stage),
				updatesCount: Number(updatesCount)
			});

			// Get history
			const historyLength = await contract.getHistoryLength(productId);
			const historyArray: UpdateInfo[] = [];
			
			for (let i = 0; i < Number(historyLength); i++) {
				const [updater, role, timestamp, note] = await contract.getUpdate(productId, i);
				historyArray.push({
					updater,
					role: Number(role),
					timestamp,
					note
				});
			}
			
			setHistory(historyArray.reverse()); // Reverse to show newest first
			
			// Add to recent tasks
			const newTask = {
				type: 'consumer_scan' as const,
				title: `Product Verified: ${name}`,
				description: `Batch: ${formData.batchNumber} | Stage: ${STAGE_NAMES[Number(stage)]}`,
				status: 'completed' as const,
				user: 'Consumer',
				details: 'Viewed complete chain of custody'
			};
			const existing = JSON.parse(localStorage.getItem('pharmaTasks') || '[]');
			localStorage.setItem('pharmaTasks', JSON.stringify([
				{ ...newTask, id: Date.now().toString(), timestamp: new Date().toISOString() },
				...existing
			]));

			setIsSubmitting(false);
		} catch (err: any) {
			console.error('Error fetching product info:', err);
			setError(err.message || 'Product not found. Please check the batch number.');
			setIsSubmitting(false);
		}
	};

	const formatDate = (timestamp: bigint) => {
		return new Date(Number(timestamp) * 1000).toLocaleString();
	};

	return (
		<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.2)] rounded-2xl p-8 animation-fadeInUp">
			<div className="flex items-center mb-6">
				<div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4"><span>🧑\u200d⚕️</span></div>
				<div>
					<h2 className="text-xl font-semibold">Verify Product & View Supply Chain</h2>
					<p className="text-white/70 text-sm">Enter batch number to view complete product history</p>
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

			<form onSubmit={handleSubmit} className="space-y-6 mb-8">
				<div>
					<label className="block text-sm mb-2">Batch Number *</label>
					<input 
						name="batchNumber" 
						value={formData.batchNumber} 
						onChange={handleChange} 
						required 
						className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green text-white" 
						placeholder="Enter product batch number"
					/>
				</div>
				<button type="submit" disabled={isSubmitting} className="w-full bg-brand-green text-black rounded-md py-3 font-semibold hover:brightness-110 disabled:opacity-50">
					{isSubmitting ? 'Fetching Product Info...' : 'Verify & View Supply Chain'}
				</button>
			</form>

			{productInfo && (
				<div className="mt-8 space-y-6">
					<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.3)] rounded-xl p-6">
						<h3 className="text-xl font-bold text-brand-green mb-4">Product Information</h3>
						<div className="grid md:grid-cols-2 gap-4">
							<div>
								<p className="text-white/70 text-sm">Product Name</p>
								<p className="text-white font-semibold">{productInfo.name}</p>
							</div>
							<div>
								<p className="text-white/70 text-sm">Current Stage</p>
								<p className="text-white font-semibold">{STAGE_NAMES[productInfo.stage] || 'Unknown'}</p>
							</div>
							<div>
								<p className="text-white/70 text-sm">Current Holder</p>
								<p className="text-white font-semibold text-xs break-all">{productInfo.holder}</p>
							</div>
							<div>
								<p className="text-white/70 text-sm">Total Updates</p>
								<p className="text-white font-semibold">{productInfo.updatesCount}</p>
							</div>
						</div>
					</div>

					{history.length > 0 && (
						<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.3)] rounded-xl p-6">
							<h3 className="text-xl font-bold text-brand-green mb-4">Supply Chain History</h3>
							<div className="space-y-4">
								{history.map((update, index) => {
									let noteData;
									try {
										noteData = JSON.parse(update.note);
									} catch {
										noteData = { raw: update.note };
									}
									return (
										<div key={index} className="border-l-4 border-brand-green pl-4 py-2">
											<div className="flex justify-between items-start mb-2">
												<div>
													<p className="text-brand-green font-semibold">{ROLE_NAMES[update.role] || 'Unknown'}</p>
													<p className="text-white/70 text-sm">{formatDate(update.timestamp)}</p>
												</div>
												<p className="text-white/50 text-xs break-all">{update.updater.substring(0, 10)}...</p>
											</div>
											<div className="mt-2 p-3 bg-[#0d0d0d] rounded-lg">
												{typeof noteData === 'object' && noteData !== null ? (
													<div className="space-y-1 text-sm">
														{Object.entries(noteData).map(([key, value]) => (
															<p key={key} className="text-white/80">
																<span className="text-white/50">{key}:</span> {String(value)}
															</p>
														))}
													</div>
												) : (
													<p className="text-white/80 text-sm">{update.note}</p>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default ConsumerForm;


