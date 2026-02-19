import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import { getProductByBatch, checkBatchExists, syncProduct, checkApiHealth } from '../services/api';
// import type { Product } from '../services/api';
import BatchStatusTracker from '../components/BatchStatusTracker';

interface ProductInfo {
	name: string;
	holder: string;
	stage: number;
	updatesCount: number;
	// Medicine details
	drugName?: string;
	manufacturingDate?: string;
	expiryDate?: string;
	quantity?: string;
	unit?: string;
	ingredients?: string;
	manufacturerName?: string;
	licenseNumber?: string;
	qualityGrade?: string;
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
	const { batchId: rawBatchId } = useParams<{ batchId: string }>();
	// Decode URL-encoded batch ID
	const batchId = rawBatchId ? decodeURIComponent(rawBatchId) : null;

	// Debug logging
	useEffect(() => {
		if (rawBatchId) {
			console.log('Raw batch ID from URL:', rawBatchId);
			console.log('Decoded batch ID:', batchId);
		}
	}, [rawBatchId, batchId]);
	const { contract, isConnected, connectWallet, account, provider } = useWeb3();

	const [isLoading, setIsLoading] = useState(true);
	const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
	const [history, setHistory] = useState<UpdateInfo[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [dataSource, setDataSource] = useState<'database' | 'blockchain' | null>(null);
	const [apiAvailable, setApiAvailable] = useState<boolean>(false);

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

		setIsLoading(true);
		setError(null);
		setProductInfo(null);
		setHistory([]);
		setDataSource(null);

		try {
			// Validate batch ID
			if (!batchId || batchId.trim() === '') {
				throw new Error('Invalid batch number. Please provide a valid batch number.');
			}

			console.log('Fetching product data for batch:', batchId);

			// Check if API is available
			const apiHealth = await checkApiHealth();
			setApiAvailable(apiHealth);

			// Try to get from database first
			if (apiHealth) {
				try {
					const dbProduct = await getProductByBatch(batchId);
					console.log('Product found in database:', dbProduct);

					setProductInfo({
						name: dbProduct.name,
						holder: dbProduct.currentHolder,
						stage: dbProduct.stage,
						updatesCount: dbProduct.updatesCount,
						// Medicine details from database
						drugName: dbProduct.drugName,
						manufacturingDate: dbProduct.manufacturingDate,
						expiryDate: dbProduct.expiryDate,
						quantity: dbProduct.quantity,
						unit: dbProduct.unit,
						ingredients: dbProduct.ingredients,
						manufacturerName: dbProduct.manufacturerName,
						licenseNumber: dbProduct.licenseNumber,
						qualityGrade: dbProduct.qualityGrade
					});

					// Convert history from database format
					const historyArray: UpdateInfo[] = dbProduct.history.map((update: any) => ({
						updater: update.updater,
						role: update.role,
						timestamp: BigInt(update.timestamp),
						note: update.note
					}));

					setHistory(historyArray.reverse());
					setDataSource('database');
					setIsLoading(false);
					return;
				} catch (dbErr: any) {
					console.log('Product not found in database, trying blockchain...', dbErr);
					// Continue to blockchain lookup
				}
			}

			// Fallback to blockchain
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

			const productId = ethers.id(batchId);
			console.log('Looking up product on blockchain with batchId:', batchId);
			console.log('Product ID (bytes32):', productId);

			// Get product info from blockchain
			let name: string, holder: string, stage: number, updatesCount: number;
			try {
				[name, holder, stage, updatesCount] = await contract.getProduct(productId);
			} catch (contractErr: any) {
				console.error('Contract error:', contractErr);

				// Enhanced error for debugging
				const debugInfo = `\n(ID: ${productId.substring(0, 10)}...)`;

				// Check if it's a "Product not found" error
				if (contractErr.message && (contractErr.message.includes('Product not found') || contractErr.message.includes('not found'))) {
					throw new Error(`Product with batch number "${batchId}" not found on the blockchain. ${debugInfo} Please verify the batch number is correct.`);
				}
				// Check for decode errors (product doesn't exist)
				if (contractErr.code === 'BAD_DATA' || contractErr.message?.includes('could not decode') || contractErr.message?.includes('value="0x"')) {
					throw new Error(`Product with batch number "${batchId}" not found. ${debugInfo} The batch may not have been registered on the blockchain yet or you are on the wrong network.`);
				}
				// Check for revert errors
				if (contractErr.reason || contractErr.error?.message) {
					const reason = contractErr.reason || contractErr.error?.message || '';
					if (reason.includes('not found') || reason.includes('Product')) {
						throw new Error(`Product with batch number "${batchId}" not found on the blockchain. ${debugInfo}`);
					}
				}
				throw contractErr;
			}

			// Extract medicine details from history notes
			let medicineDetails: any = {};
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

				// Try to extract medicine details from manufacturer's note
				if (Number(role) === 2) { // Manufacturer role
					try {
						const noteData = JSON.parse(note);
						medicineDetails = {
							drugName: noteData.drugName || name,
							manufacturingDate: noteData.manufacturingDate,
							expiryDate: noteData.expiryDate,
							quantity: noteData.quantity,
							unit: noteData.unit,
							ingredients: noteData.ingredients,
							manufacturerName: noteData.manufacturerName,
							licenseNumber: noteData.licenseNumber,
							qualityGrade: noteData.qualityGrade
						};
					} catch (e) {
						// Note is not JSON, use defaults
					}
				}
			}

			setProductInfo({
				name,
				holder,
				stage: Number(stage),
				updatesCount: Number(updatesCount),
				...medicineDetails
			});

			setHistory(historyArray.reverse());
			setDataSource('blockchain');

			// Sync to database if API is available
			if (apiAvailable) {
				try {
					await syncProduct({
						batchNumber: batchId,
						productId: productId,
						name,
						currentHolder: holder,
						stage: Number(stage),
						history: historyArray.map(h => ({
							updater: h.updater,
							role: h.role,
							timestamp: Number(h.timestamp),
							note: h.note
						})),
						exists: true,
						...medicineDetails
					});
					console.log('Product synced to database');
				} catch (syncErr) {
					console.error('Failed to sync to database:', syncErr);
					// Don't fail the request if sync fails
				}
			}

			setIsLoading(false);
		} catch (err: any) {
			console.error('Error fetching product info:', err);
			// Provide more helpful error messages
			let errorMessage = 'Product not found. Please check the batch number.';
			if (err.message) {
				errorMessage = err.message;
			} else if (err.reason) {
				errorMessage = err.reason;
			}
			setError(errorMessage);
			setIsLoading(false);
		}
	};

	const formatDate = (timestamp: bigint) => {
		return new Date(Number(timestamp) * 1000).toLocaleString();
	};

	// Get recent batch numbers from localStorage tasks
	const getRecentBatchNumbers = (): string[] => {
		try {
			const savedTasks = localStorage.getItem('pharmaTasks');
			if (!savedTasks) return [];

			const tasks = JSON.parse(savedTasks);
			const batchNumbers = new Set<string>();

			tasks.forEach((task: any) => {
				// Extract batch number from description
				const match = task.description?.match(/[Bb]atch:\s*([A-Z0-9_\-]+)/);
				if (match && match[1]) {
					batchNumbers.add(match[1]);
				}
				// Also check details field
				const match2 = task.details?.match(/[Bb]atch:\s*([A-Z0-9_\-]+)/);
				if (match2 && match2[1]) {
					batchNumbers.add(match2[1]);
				}
			});

			return Array.from(batchNumbers).slice(0, 10); // Return up to 10 recent batch numbers
		} catch (err) {
			console.error('Error getting recent batch numbers:', err);
			return [];
		}
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

				{dataSource && (
					<div className="mb-6 p-4 bg-blue-500/20 border border-blue-500 rounded-xl">
						<p className="text-blue-500 text-sm">
							📊 Data source: <span className="font-semibold">{dataSource === 'database' ? 'Database (MongoDB)' : 'Blockchain'}</span>
							{dataSource === 'blockchain' && apiAvailable && <span className="ml-2 text-xs">(Syncing to database...)</span>}
						</p>
					</div>
				)}

				{error && (
					<div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl">
						<p className="text-red-500 font-semibold mb-2">{error}</p>
						<div className="mt-4 p-4 bg-[#0d0d0d] rounded-lg border border-red-500/20">
							<p className="text-white/80 text-sm mb-3 font-semibold">💡 Troubleshooting Tips:</p>
							<ul className="text-white/70 text-sm space-y-2 list-disc list-inside">
								<li>Make sure you're using the <strong>exact batch number</strong> that was used when creating/manufacturing the product</li>
								<li>Batch numbers are case-sensitive (e.g., "PCM-2024-001" not "pcm-2024-001")</li>
								<li>The product must be created by a Supplier first, then manufactured by a Manufacturer</li>
								<li>Check your Recent Activities to find the correct batch number</li>
								<li>Ensure you're connected to the correct blockchain network</li>
							</ul>
							{getRecentBatchNumbers().length > 0 && (
								<div className="mt-4 pt-4 border-t border-white/10">
									<p className="text-white/80 text-sm mb-2 font-semibold">📋 Recent Batch Numbers from Activities:</p>
									<div className="flex flex-wrap gap-2">
										{getRecentBatchNumbers().map((batch, idx) => (
											<button
												key={idx}
												onClick={() => window.location.href = `/verify/${encodeURIComponent(batch)}`}
												className="px-3 py-1 bg-brand-green/20 border border-brand-green/30 text-brand-green rounded-lg text-xs hover:bg-brand-green/30 transition-colors"
											>
												{batch}
											</button>
										))}
									</div>
								</div>
							)}
						</div>
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
						{/* Current Location Card - Prominent Display */}
						<div className="bg-gradient-to-br from-brand-green/20 to-brand-blue/20 border-2 border-brand-green rounded-xl p-6">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center space-x-3">
									<div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center">
										<span className="text-2xl">📍</span>
									</div>
									<div>
										<h3 className="text-2xl font-bold text-brand-green">Current Location</h3>
										<p className="text-white/70 text-sm">Where this batch is currently located</p>
									</div>
								</div>
							</div>
							<div className="grid md:grid-cols-2 gap-6 mt-4">
								<div className="bg-[#0d0d0d] rounded-lg p-4 border border-brand-green/30">
									<p className="text-white/70 text-sm mb-2">Current Stage</p>
									<p className="text-3xl font-bold text-brand-green">{STAGE_NAMES[productInfo.stage] || 'Unknown'}</p>
									<p className="text-white/50 text-xs mt-2">
										{productInfo.stage === 0 && 'Product has been created'}
										{productInfo.stage === 1 && 'Product has been manufactured'}
										{productInfo.stage === 2 && 'Product is with distributor'}
										{productInfo.stage === 3 && 'Product is in transport'}
										{productInfo.stage === 4 && 'Product is with wholesaler'}
										{productInfo.stage === 5 && 'Product is with retailer'}
										{productInfo.stage === 6 && 'Product has been sold'}
									</p>
								</div>
								<div className="bg-[#0d0d0d] rounded-lg p-4 border border-brand-green/30">
									<p className="text-white/70 text-sm mb-2">Current Participant</p>
									<p className="text-xl font-bold text-brand-green">
										{productInfo.stage === 0 && 'Supplier'}
										{productInfo.stage === 1 && 'Manufacturer'}
										{productInfo.stage === 2 && 'Distributor'}
										{productInfo.stage === 3 && 'Transporter'}
										{productInfo.stage === 4 && 'Wholesaler'}
										{productInfo.stage === 5 && 'Retailer'}
										{productInfo.stage === 6 && 'Consumer'}
										{productInfo.stage < 0 || productInfo.stage > 6 ? 'Unknown' : ''}
									</p>
									<div className="mt-2 flex items-center">
										<span className="text-white/50 text-xs mr-2">Address:</span>
										<p className="text-white/50 text-xs break-all font-mono">
											{productInfo.holder}
										</p>
									</div>
								</div>
							</div>
							<div className="mt-4 p-4 bg-brand-green/10 rounded-lg border border-brand-green/20 flex items-center justify-center">
								<span className="flex h-3 w-3 rounded-full bg-brand-green mr-3 animate-pulse"></span>
								<p className="text-brand-green font-semibold">
									📦 This batch is currently at <span className="text-white underline decoration-brand-green decoration-2 underline-offset-4">{STAGE_NAMES[productInfo.stage] || 'Unknown Stage'}</span> stage
								</p>
							</div>
						</div>

						{/* Batch Status Tracker - Real-time Status */}
						<BatchStatusTracker batchNumber={batchId || ''} productId={ethers.id(batchId || '')} />

						{/* Blockchain Proof Card */}
						<div className="bg-[#0d0d0d] border border-blue-500/30 rounded-xl p-4 flex items-center justify-between">
							<div className="flex items-center">
								<div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-4 text-blue-500">
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04kM12 21.355r-.343-.133a11.955 11.955 0 01-8.275-8.275l-.133-.343a11.955 11.955 0 013.04-8.618A11.955 11.955 0 0112 2.944a11.955 11.955 0 018.618 3.04a11.955 11.955 0 013.04 8.618l-.133.343a11.955 11.955 0 01-8.275 8.275l-.343.133z" />
									</svg>
								</div>
								<div>
									<p className="text-white font-semibold">Immutable Blockchain Proof</p>
									<p className="text-white/50 text-xs">Verified via Smart Contract at {contract?.target?.toString().substring(0, 10)}...</p>
								</div>
							</div>
							<div className="text-right">
								<span className="bg-blue-500/20 text-blue-500 text-xs px-2 py-1 rounded-full border border-blue-500/30">Authentic</span>
							</div>
						</div>

						{/* Medicine Details Card */}
						{(productInfo.drugName || productInfo.manufacturingDate || productInfo.expiryDate) && (
							<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.3)] rounded-xl p-6">
								<h3 className="text-xl font-bold text-brand-green mb-4">💊 Medicine Details</h3>
								<div className="grid md:grid-cols-2 gap-4">
									{productInfo.drugName && (
										<div>
											<p className="text-white/70 text-sm">Drug Name</p>
											<p className="text-white font-semibold">{productInfo.drugName}</p>
										</div>
									)}
									{productInfo.manufacturerName && (
										<div>
											<p className="text-white/70 text-sm">Manufacturer</p>
											<p className="text-white font-semibold">{productInfo.manufacturerName}</p>
										</div>
									)}
									{productInfo.manufacturingDate && (
										<div>
											<p className="text-white/70 text-sm">Manufacturing Date</p>
											<p className="text-white font-semibold">{productInfo.manufacturingDate}</p>
										</div>
									)}
									{productInfo.expiryDate && (
										<div>
											<p className="text-white/70 text-sm">Expiry Date</p>
											<p className="text-white font-semibold text-red-400">{productInfo.expiryDate}</p>
										</div>
									)}
									{(productInfo.quantity || productInfo.unit) && (
										<div>
											<p className="text-white/70 text-sm">Quantity</p>
											<p className="text-white font-semibold">{productInfo.quantity} {productInfo.unit}</p>
										</div>
									)}
									{productInfo.qualityGrade && (
										<div>
											<p className="text-white/70 text-sm">Quality Grade</p>
											<p className="text-white font-semibold">{productInfo.qualityGrade}</p>
										</div>
									)}
									{productInfo.licenseNumber && (
										<div>
											<p className="text-white/70 text-sm">License Number</p>
											<p className="text-white font-semibold text-xs">{productInfo.licenseNumber}</p>
										</div>
									)}
									{productInfo.ingredients && (
										<div className="md:col-span-2">
											<p className="text-white/70 text-sm">Active Ingredients</p>
											<p className="text-white font-semibold text-sm">{productInfo.ingredients}</p>
										</div>
									)}
								</div>
							</div>
						)}

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
									<p className="text-white/70 text-sm">Total Updates</p>
									<p className="text-white font-semibold">{productInfo.updatesCount}</p>
								</div>
								<div>
									<p className="text-white/70 text-sm">Current Holder Address</p>
									<p className="text-white font-semibold text-xs break-all">{productInfo.holder}</p>
								</div>
							</div>
						</div>

						{/* Timeline View */}
						{history.length > 0 && (
							<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.3)] rounded-xl p-6">
								<div className="flex items-center justify-between mb-6">
									<h3 className="text-xl font-bold text-brand-green">Full Movement History</h3>
									<span className="text-white/50 text-xs bg-white/5 px-2 py-1 rounded-md border border-white/10">
										{history.length} Event{history.length > 1 ? 's' : ''} Recorded
									</span>
								</div>
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
