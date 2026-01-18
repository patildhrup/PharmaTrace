import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';

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

const Verify: React.FC = () => {
	const { batchId } = useParams<{ batchId: string }>();
	const { contract, isConnected, connectWallet, account, provider } = useWeb3();
	
	const [isLoading, setIsLoading] = useState(true);
	const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
	const [history, setHistory] = useState<UpdateInfo[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (batchId) {
			fetchProductData();
		} else {
			setError('No batch ID provided in URL');
			setIsLoading(false);
		}
	}, [batchId, contract, isConnected]);

	const fetchProductData = async () => {
		if (!batchId) {
			setError('No batch ID provided');
			setIsLoading(false);
			return;
		}

		if (!isConnected || !contract) {
			try {
				await connectWallet();
				// Wait a bit for connection to establish
				setTimeout(() => fetchProductData(), 1000);
				return;
			} catch (err: any) {
				setError(err.message || 'Please connect your MetaMask wallet to view product information');
				setIsLoading(false);
				return;
			}
		}

		setIsLoading(true);
		setError(null);
		setProductInfo(null);
		setHistory([]);

		try {
			const productId = ethers.id(batchId);
			
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
			setIsLoading(false);
		} catch (err: any) {
			console.error('Error fetching product info:', err);
			setError(err.message || 'Product not found. Please check the batch number.');
			setIsLoading(false);
		}
	};

	const formatDate = (timestamp: bigint) => {
		return new Date(Number(timestamp) * 1000).toLocaleString();
	};

	return (
		<div className="min-h-screen flex items-center justify-center px-4 py-12 transition-colors duration-300" style={{
			backgroundColor: 'var(--bg-primary)',
			color: 'var(--text-primary)'
		}}>
			<div className="w-full max-w-4xl">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold mb-2">
						<span className="text-brand-green">Product</span> Verification
					</h1>
					<p className="text-white/70">Batch Number: <span className="text-brand-green font-semibold">{batchId || 'N/A'}</span></p>
				</div>

				{!isConnected && (
					<div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500 rounded-xl">
						<p className="text-yellow-500 mb-2">⚠️ Please connect your MetaMask wallet to view product information</p>
						<button 
							type="button" 
							onClick={connectWallet} 
							className="bg-brand-green text-black px-4 py-2 rounded-lg font-semibold hover:brightness-110"
						>
							Connect Wallet
						</button>
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

				{isLoading && (
					<div className="bg-[#111] border border-[rgba(34,197,94,0.2)] rounded-xl p-8 text-center">
						<div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
						<p className="text-white/70">Fetching product information from blockchain...</p>
					</div>
				)}

				{!isLoading && productInfo && (
					<div className="space-y-6">
						{/* Product Information Card */}
						<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.3)] rounded-xl p-6">
							<h3 className="text-xl font-bold text-brand-green mb-4">Product Information</h3>
							<div className="grid md:grid-cols-2 gap-4">
								<div>
									<p className="text-white/70 text-sm">Product Name</p>
									<p className="text-white font-semibold">{productInfo.name}</p>
								</div>
								<div>
									<p className="text-white/70 text-sm">Batch Number</p>
									<p className="text-white font-semibold">{batchId}</p>
								</div>
								<div>
									<p className="text-white/70 text-sm">Current Stage</p>
									<p className="text-white font-semibold">{STAGE_NAMES[productInfo.stage] || 'Unknown'}</p>
								</div>
								<div>
									<p className="text-white/70 text-sm">Total Updates</p>
									<p className="text-white font-semibold">{productInfo.updatesCount}</p>
								</div>
								<div className="md:col-span-2">
									<p className="text-white/70 text-sm">Current Holder</p>
									<p className="text-white font-semibold text-xs break-all">{productInfo.holder}</p>
								</div>
							</div>
						</div>

						{/* Timeline View */}
						{history.length > 0 && (
							<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.3)] rounded-xl p-6">
								<h3 className="text-xl font-bold text-brand-green mb-6">Supply Chain Timeline</h3>
								<div className="relative">
									{/* Timeline line */}
									<div className="absolute left-4 top-0 bottom-0 w-0.5 bg-brand-green/30"></div>
									
									<div className="space-y-6">
										{history.map((update, index) => {
											let noteData;
											try {
												noteData = JSON.parse(update.note);
											} catch {
												noteData = { raw: update.note };
											}
											
											return (
												<div key={index} className="relative pl-12">
													{/* Timeline dot */}
													<div className="absolute left-0 top-2 w-8 h-8 bg-brand-green rounded-full flex items-center justify-center border-4 border-[#0d0d0d]">
														<span className="text-xs">{(history.length - index)}</span>
													</div>
													
													{/* Timeline content */}
													<div className="bg-[#0d0d0d] border border-[rgba(34,197,94,0.2)] rounded-lg p-4">
														<div className="flex justify-between items-start mb-3">
															<div>
																<p className="text-brand-green font-semibold text-lg">
																	{ROLE_NAMES[update.role] || 'Unknown'}
																</p>
																<p className="text-white/70 text-sm">{formatDate(update.timestamp)}</p>
															</div>
															<div className="text-right">
																<p className="text-white/50 text-xs break-all">
																	{update.updater.substring(0, 6)}...{update.updater.substring(update.updater.length - 4)}
																</p>
															</div>
														</div>
														
														{/* Note details */}
														<div className="mt-3 p-3 bg-[#111] rounded-lg">
															{typeof noteData === 'object' && noteData !== null && !noteData.raw ? (
																<div className="space-y-2 text-sm">
																	{Object.entries(noteData).map(([key, value]) => (
																		<div key={key} className="flex">
																			<span className="text-white/50 min-w-[120px]">{key}:</span>
																			<span className="text-white/80">{String(value)}</span>
																		</div>
																	))}
																</div>
															) : (
																<p className="text-white/80 text-sm">{update.note}</p>
															)}
														</div>
													</div>
												</div>
											);
										})}
									</div>
								</div>
							</div>
						)}

						{history.length === 0 && !isLoading && (
							<div className="bg-[#111] border border-[rgba(34,197,94,0.2)] rounded-xl p-8 text-center">
								<p className="text-white/70">No history found for this product.</p>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default Verify;
