import React, { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';
import { syncProduct, createNotification } from '../services/api';
import { z } from 'zod';
import ConfirmDelivery from './ConfirmDelivery';

const retailerSchema = z.object({
	invoiceNumber: z.string().min(1, 'Invoice Number is required'),
	batchNumber: z.string().min(1, 'Batch Number is required'),
	quantitySold: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
		message: 'Quantity must be a positive number',
	}),
	buyerName: z.string().min(1, 'Buyer Name is required'),
	saleDate: z.string().min(1, 'Sale Date is required'),
});

interface RetailerFormData {
	invoiceNumber: string;
	batchNumber: string;
	quantitySold: string;
	buyerName: string;
	saleDate: string;
}

const RetailerForm: React.FC = () => {
	const [formData, setFormData] = useState<RetailerFormData>({
		invoiceNumber: '',
		batchNumber: '',
		quantitySold: '',
		buyerName: '',
		saleDate: ''
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
		setTxHash(null);

		// Zod Validation
		const result = retailerSchema.safeParse(formData);
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
				invoiceNumber: formData.invoiceNumber,
				quantitySold: formData.quantitySold,
				buyerName: formData.buyerName,
				saleDate: formData.saleDate
			});

			// First receive by retailer, then mark as sold
			let tx2;
			try {
				const tx1 = await contract.receiveByRetailer(productId, note);
				await tx1.wait();

				tx2 = await contract.markSold(productId, `Sold to ${formData.buyerName} `);
				setTxHash(tx2.hash);
				await tx2.wait();
			} catch (blockchainErr: any) {
				console.error('Blockchain transaction failed:', blockchainErr);
				setError(`Blockchain Error: ${blockchainErr.message || 'Transaction failed'}. Attempting to sync data to database anyway...`);
			}

			// Sync to backend database regardless of blockchain confirmation if possible
			try {
				let name = 'Product';
				let holder = account || '';
				let stage = 6; // Retail stage
				let historyArray: any[] = [];

				// Try to get updated info from blockchain
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

				await syncProduct({
					batchNumber: formData.batchNumber,
					productId: productId,
					name,
					userAddress: account || '',
					currentHolder: holder,
					stage: stage,
					history: historyArray,
					exists: true,
					invoiceNumber: formData.invoiceNumber,
					buyerName: formData.buyerName,
					saleDate: formData.saleDate,
					quantitySold: formData.quantitySold,
					txHash: tx2?.hash || 'OFF-CHAIN-SYNC'
				});
				console.log('Product sync successful');

				// Notify Transport (if needed) or just log
				// In retailer case, maybe it's the end of the chain, 
				// but let's add a general notification for record
				try {
					// 1. Notify Sender (Retailer - Record of execution)
					await createNotification({
						recipientRole: 'retailer',
						senderRole: 'retailer',
						senderAddress: account || 'Unknown',
						message: `Batch #${formData.batchNumber} sale successfully recorded.`,
						type: 'info',
						batchNumber: formData.batchNumber
					});

					// 2. Notify Next Participant (Consumer - for verification)
					await createNotification({
						recipientRole: 'consumer',
						senderRole: 'retailer',
						senderAddress: account || 'Unknown',
						message: `Your drug batch #${formData.batchNumber} has been delivered and is ready for verification`,
						type: 'info',
						batchNumber: formData.batchNumber
					});
					console.log('Sale notifications created');
				} catch (notifErr) {
					console.error('Failed to create notifications:', notifErr);
				}

				// Record to local Recent Activities
				const newTask = {
					type: 'shipment' as const,
					title: `Retail Sale: #${formData.batchNumber}`,
					description: `Sold ${formData.quantitySold} units to ${formData.buyerName}`,
					status: 'completed' as const,
					user: 'Retailer',
					details: `Batch: ${formData.batchNumber} | Invoice: ${formData.invoiceNumber} | TX: ${tx2?.hash?.substring(0, 10)}...`
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
				setFormData({ invoiceNumber: '', batchNumber: '', quantitySold: '', buyerName: '', saleDate: '' });
				setTxHash(null);
			}, 2000);
		} catch (err: any) {
			console.error('Error recording retail sale:', err);
			setError(err.message || 'Failed to record sale. Make sure the product exists and you have the Retailer role.');
			setIsSubmitting(false);
		}
	};

	if (submitted) {
		return (
			<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.3)] rounded-2xl p-8 text-center animation-fadeInUp">
				<h3 className="text-2xl font-bold text-brand-green mb-2">Sale Recorded ✅</h3>
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
				<div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4"><span>🏥</span></div>
				<div>
					<h2 className="text-xl font-semibold">Record Retail Sale</h2>
					<p className="text-white/70 text-sm">Add consumer sale of a batch</p>
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
						<label className="block text-sm mb-2">Invoice Number *</label>
						<input name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green" />
						{fieldErrors.invoiceNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.invoiceNumber}</p>}
					</div>
					<div>
						<label className="block text-sm mb-2">Batch Number *</label>
						<input name="batchNumber" value={formData.batchNumber} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green" />
						{fieldErrors.batchNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.batchNumber}</p>}
					</div>
				</div>
				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm mb-2">Quantity Sold *</label>
						<input type="number" name="quantitySold" value={formData.quantitySold} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green" />
						{fieldErrors.quantitySold && <p className="text-red-500 text-xs mt-1">{fieldErrors.quantitySold}</p>}
					</div>
					<div>
						<label className="block text-sm mb-2">Buyer Name *</label>
						<input name="buyerName" value={formData.buyerName} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green" />
						{fieldErrors.buyerName && <p className="text-red-500 text-xs mt-1">{fieldErrors.buyerName}</p>}
					</div>
				</div>
				<div>
					<label className="block text-sm mb-2">Sale Date *</label>
					<input type="date" name="saleDate" value={formData.saleDate} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green" />
					{fieldErrors.saleDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.saleDate}</p>}
				</div>
				<button type="submit" disabled={isSubmitting} className="w-full bg-brand-green text-black rounded-md py-3 font-semibold hover:brightness-110 disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Save Retail Sale'}</button>
			</form>

			{/* Deliver confirmation for incoming shipments */}
			<ConfirmDelivery role="retailer" />
		</div>
	);
};

export default RetailerForm;


