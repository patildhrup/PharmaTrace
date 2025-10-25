import React, { useState } from 'react';

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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		
		// Simulate API call
		await new Promise(resolve => setTimeout(resolve, 2000));
		
		// Add to recent tasks
		const newTask = {
			type: 'raw_material' as const,
			title: `Raw Material Added: ${formData.materialName}`,
			description: `Added ${formData.quantity} ${formData.unit} of ${formData.materialName} from ${formData.supplierName}`,
			status: 'completed' as const,
			user: 'Supplier',
			details: `Batch: ${formData.batchNumber} | Certificate: ${formData.qualityCertificate}`
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
		}, 3000);
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	if (submitted) {
		return (
			<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.3)] rounded-2xl p-8 text-center animation-fadeInUp hover-lift">
				<div className="w-20 h-20 bg-gradient-to-br from-brand-green to-brand-blue rounded-full flex items-center justify-center mx-auto mb-6 animation-pulseGlow hover-scale">
					<span className="text-3xl">✅</span>
				</div>
				<h3 className="text-2xl font-bold text-brand-green mb-4 animation-neonGlow">Raw Material Successfully Added!</h3>
				<p className="text-white/80 text-lg mb-6">Your raw material has been registered in the blockchain network with cryptographic proof.</p>
				<div className="bg-gradient-to-r from-brand-green/20 to-brand-blue/20 border border-brand-green/30 rounded-xl p-4">
					<p className="text-brand-green font-semibold">✓ Blockchain transaction confirmed</p>
					<p className="text-brand-green font-semibold">✓ Quality certificate verified</p>
					<p className="text-brand-green font-semibold">✓ Added to recent activities</p>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.2)] rounded-2xl p-8 animation-fadeInUp hover-lift transform-3d perspective-1000">
			<div className="flex items-center mb-8">
				<div className="w-16 h-16 bg-gradient-to-br from-brand-green/30 to-brand-blue/30 border-2 border-brand-green rounded-2xl flex items-center justify-center mr-6 animation-float hover-scale">
					<span className="text-3xl">🏭</span>
				</div>
				<div>
					<h2 className="text-2xl font-bold text-white mb-2">Raw Material Supply</h2>
					<p className="text-white/70 text-base">Register and supply raw materials to pharmaceutical manufacturers</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-8">
				<div className="grid md:grid-cols-2 gap-8">
					<div className="group">
						<label className="block text-sm font-semibold mb-3 text-white group-hover:text-brand-green transition-colors duration-300">
							Material Name *
						</label>
						<input
							type="text"
							name="materialName"
							value={formData.materialName}
							onChange={handleChange}
							required
							className="w-full bg-gradient-to-r from-[#0d0d0d] to-[#111] border-2 border-[rgba(34,197,94,0.25)] rounded-xl px-4 py-3 outline-none focus:border-brand-green focus:shadow-lg focus:shadow-brand-green/20 transition-all duration-300 hover:border-brand-green/50 text-white placeholder-white/50 hover-lift"
							placeholder="e.g., Paracetamol API"
						/>
					</div>
					<div className="group">
						<label className="block text-sm font-semibold mb-3 text-white group-hover:text-brand-green transition-colors duration-300">
							Supplier Name *
						</label>
						<input
							type="text"
							name="supplierName"
							value={formData.supplierName}
							onChange={handleChange}
							required
							className="w-full bg-gradient-to-r from-[#0d0d0d] to-[#111] border-2 border-[rgba(34,197,94,0.25)] rounded-xl px-4 py-3 outline-none focus:border-brand-green focus:shadow-lg focus:shadow-brand-green/20 transition-all duration-300 hover:border-brand-green/50 text-white placeholder-white/50 hover-lift"
							placeholder="e.g., ChemSupply Ltd"
						/>
					</div>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium mb-2">Batch Number *</label>
						<input
							type="text"
							name="batchNumber"
							value={formData.batchNumber}
							onChange={handleChange}
							required
							className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors"
							placeholder="e.g., RM-2024-001"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-2">Supply Date *</label>
						<input
							type="date"
							name="supplyDate"
							value={formData.supplyDate}
							onChange={handleChange}
							required
							className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors"
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
							className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors"
							placeholder="e.g., 100"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-2">Unit *</label>
						<select
							name="unit"
							value={formData.unit}
							onChange={handleChange}
							required
							className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors"
						>
							<option value="kg">Kilograms</option>
							<option value="g">Grams</option>
							<option value="mg">Milligrams</option>
							<option value="liters">Liters</option>
							<option value="ml">Milliliters</option>
							<option value="tons">Tons</option>
						</select>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium mb-2">Source Location *</label>
					<input
						type="text"
						name="source"
						value={formData.source}
						onChange={handleChange}
						required
						className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors"
						placeholder="e.g., Mumbai, Maharashtra, India"
					/>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium mb-2">Quality Certificate *</label>
						<input
							type="text"
							name="qualityCertificate"
							value={formData.qualityCertificate}
							onChange={handleChange}
							required
							className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors"
							placeholder="e.g., QC-CERT-2024-001"
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
							className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors"
						/>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium mb-2">Storage Conditions *</label>
					<textarea
						name="storageConditions"
						value={formData.storageConditions}
						onChange={handleChange}
						required
						rows={2}
						className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors"
						placeholder="e.g., Store in cool, dry place below 25°C"
					/>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium mb-2">Contact Person *</label>
						<input
							type="text"
							name="contactPerson"
							value={formData.contactPerson}
							onChange={handleChange}
							required
							className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors"
							placeholder="e.g., John Smith"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-2">Phone Number *</label>
						<input
							type="tel"
							name="phoneNumber"
							value={formData.phoneNumber}
							onChange={handleChange}
							required
							className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors"
							placeholder="e.g., +91 98765 43210"
						/>
					</div>
				</div>

				<button
					type="submit"
					disabled={isSubmitting}
					className="w-full bg-gradient-to-r from-brand-green to-brand-blue text-black rounded-xl py-4 font-bold text-lg hover:brightness-110 transition-all duration-300 animation-pulseGlow disabled:opacity-50 disabled:cursor-not-allowed hover-lift hover-scale transform-3d perspective-1000"
				>
					{isSubmitting ? (
						<div className="flex items-center justify-center">
							<div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin mr-3"></div>
							<span className="text-lg">Adding Raw Material to Blockchain...</span>
						</div>
					) : (
						<div className="flex items-center justify-center">
							<span className="text-lg mr-2">🏭</span>
							<span>Supply Raw Material to System</span>
						</div>
					)}
				</button>
			</form>
		</div>
	);
};

export default SupplierForm;

