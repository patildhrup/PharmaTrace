import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useWeb3 } from '../contexts/Web3Context';
import { ethers } from 'ethers';

interface DrugFormData {
	drugName: string;
	batchNumber: string;
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
	const { isDarkMode } = useTheme();
	const { contract, isConnected, connectWallet, account } = useWeb3();
	const [formData, setFormData] = useState<DrugFormData>({
		drugName: '',
		batchNumber: '',
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
	const [error, setError] = useState<string | null>(null);
	const [txHash, setTxHash] = useState<string | null>(null);

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
			// Convert batch number to bytes32 for product ID
			const productId = ethers.id(formData.batchNumber);
			
			// Create note with manufacturing details
			const note = JSON.stringify({
				drugName: formData.drugName,
				manufacturingDate: formData.manufacturingDate,
				expiryDate: formData.expiryDate,
				quantity: formData.quantity,
				unit: formData.unit,
				ingredients: formData.ingredients,
				manufacturerName: formData.manufacturerName,
				licenseNumber: formData.licenseNumber,
				qualityGrade: formData.qualityGrade
			});

			// Call blockchain contract - manufacture function
			const tx = await contract.manufacture(productId, note);
			setTxHash(tx.hash);
			
			// Wait for transaction confirmation
			await tx.wait();
			
			// Add to recent tasks
			const newTask = {
				type: 'drug_manufacturing' as const,
				title: `Drug Manufactured: ${formData.drugName}`,
				description: `Manufactured ${formData.quantity} ${formData.unit} of ${formData.drugName} (Batch: ${formData.batchNumber})`,
				status: 'completed' as const,
				user: 'Manufacturer',
				details: `Quality Grade: ${formData.qualityGrade} | License: ${formData.licenseNumber} | TX: ${tx.hash.substring(0, 10)}...`
			};
			
			// Save to localStorage
			const existingTasks = JSON.parse(localStorage.getItem('pharmaTasks') || '[]');
			const taskWithId = {
				...newTask,
				id: Date.now().toString(),
				timestamp: new Date().toISOString()
			};
			localStorage.setItem('pharmaTasks', JSON.stringify([taskWithId, ...existingTasks]));
			
			setIsSubmitting(false);
			setSubmitted(true);
			
			// Reset form after 3 seconds
			setTimeout(() => {
				setSubmitted(false);
				setFormData({
					drugName: '',
					batchNumber: '',
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
			}, 3000);
		} catch (err: any) {
			console.error('Error manufacturing product:', err);
			setError(err.message || 'Failed to manufacture product on blockchain. Make sure the product exists and you have the Manufacturer role.');
			setIsSubmitting(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	if (submitted) {
		return (
			<div className="bg-[#111] border border-[rgba(34,197,94,0.2)] rounded-xl p-8 text-center animation-fadeInUp">
				<div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4 animation-pulseGlow">
					<span className="text-2xl">✅</span>
				</div>
				<h3 className="text-xl font-semibold text-brand-green mb-2">Drug Successfully Manufactured!</h3>
				<p className="text-white/70">Your drug has been registered in the blockchain network.</p>
				{txHash && (
					<p className="text-brand-blue text-sm mt-2 break-all">TX: {txHash}</p>
				)}
			</div>
		);
	}

	return (
		<div className="border rounded-xl p-8 animation-fadeInUp transition-colors duration-300" style={{
			backgroundColor: 'var(--bg-secondary)',
			borderColor: 'var(--border-color)'
		}}>
			<div className="flex items-center mb-6">
				<div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
					<span className="text-xl">⚗️</span>
				</div>
				<div>
					<h2 className="text-xl font-semibold">Add New Drug</h2>
					<p className="text-white/70 text-sm">Register a new pharmaceutical product</p>
				</div>
			</div>

			{!isConnected && (
				<div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500 rounded-xl">
					<p className="text-yellow-500 mb-2">⚠️ Please connect your MetaMask wallet to continue</p>
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
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium mb-2">Drug Name *</label>
						<input
							type="text"
							name="drugName"
							value={formData.drugName}
							onChange={handleChange}
							required
							className="w-full border rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors" style={{
								backgroundColor: 'var(--bg-primary)',
								borderColor: 'var(--border-color)',
								color: 'var(--text-primary)'
							}}
							placeholder="e.g., Paracetamol 500mg"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-2">Batch Number *</label>
						<input
							type="text"
							name="batchNumber"
							value={formData.batchNumber}
							onChange={handleChange}
							required
							className="w-full border rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors" style={{
								backgroundColor: 'var(--bg-primary)',
								borderColor: 'var(--border-color)',
								color: 'var(--text-primary)'
							}}
							placeholder="e.g., PCM-2024-001"
						/>
					</div>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium mb-2">Manufacturing Date *</label>
						<input
							type="date"
							name="manufacturingDate"
							value={formData.manufacturingDate}
							onChange={handleChange}
							required
							className="w-full border rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors" style={{
								backgroundColor: 'var(--bg-primary)',
								borderColor: 'var(--border-color)',
								color: 'var(--text-primary)'
							}}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-2">Expiry Date *</label>
						<input
							type="date"
							name="expiryDate"
							value={formData.expiryDate}
							onChange={handleChange}
							required
							className="w-full border rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors" style={{
								backgroundColor: 'var(--bg-primary)',
								borderColor: 'var(--border-color)',
								color: 'var(--text-primary)'
							}}
						/>
					</div>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium mb-2">Quantity *</label>
						<input
							type="number"
							name="quantity"
							value={formData.quantity}
							onChange={handleChange}
							required
							className="w-full border rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors" style={{
								backgroundColor: 'var(--bg-primary)',
								borderColor: 'var(--border-color)',
								color: 'var(--text-primary)'
							}}
							placeholder="e.g., 1000"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-2">Unit *</label>
						<select
							name="unit"
							value={formData.unit}
							onChange={handleChange}
							required
							className="w-full border rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors" style={{
								backgroundColor: 'var(--bg-primary)',
								borderColor: 'var(--border-color)',
								color: 'var(--text-primary)'
							}}
						>
							<option value="tablets">Tablets</option>
							<option value="capsules">Capsules</option>
							<option value="ml">Milliliters</option>
							<option value="mg">Milligrams</option>
							<option value="liters">Liters</option>
							<option value="vials">Vials</option>
						</select>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium mb-2">Active Ingredients *</label>
					<textarea
						name="ingredients"
						value={formData.ingredients}
						onChange={handleChange}
						required
						rows={3}
						className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors"
						placeholder="e.g., Paracetamol 500mg, Microcrystalline Cellulose, Povidone"
					/>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium mb-2">Manufacturer Name *</label>
						<input
							type="text"
							name="manufacturerName"
							value={formData.manufacturerName}
							onChange={handleChange}
							required
							className="w-full border rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors" style={{
								backgroundColor: 'var(--bg-primary)',
								borderColor: 'var(--border-color)',
								color: 'var(--text-primary)'
							}}
							placeholder="e.g., PharmaCorp Industries"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-2">License Number *</label>
						<input
							type="text"
							name="licenseNumber"
							value={formData.licenseNumber}
							onChange={handleChange}
							required
							className="w-full border rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors" style={{
								backgroundColor: 'var(--bg-primary)',
								borderColor: 'var(--border-color)',
								color: 'var(--text-primary)'
							}}
							placeholder="e.g., MFG-LIC-2024-001"
						/>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium mb-2">Quality Grade *</label>
					<select
						name="qualityGrade"
						value={formData.qualityGrade}
						onChange={handleChange}
						required
						className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors"
					>
						<option value="A">Grade A - Premium Quality</option>
						<option value="B">Grade B - Standard Quality</option>
						<option value="C">Grade C - Basic Quality</option>
					</select>
				</div>

				<button
					type="submit"
					disabled={isSubmitting}
					className="w-full bg-brand-green text-black rounded-md py-3 font-semibold hover:brightness-110 transition animation-pulseGlow disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isSubmitting ? (
						<div className="flex items-center justify-center">
							<div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
							Adding Drug to Blockchain...
						</div>
					) : (
						'Add Drug to System'
					)}
				</button>
			</form>
		</div>
	);
};

export default ManufacturerForm;

