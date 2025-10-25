import React, { useState } from 'react';

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

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		await new Promise(r => setTimeout(r, 1200));

		const newTask = {
			type: 'retail' as const,
			title: `Retail Sale: ${formData.batchNumber}`,
			description: `${formData.quantitySold} units sold to ${formData.buyerName}`,
			status: 'completed' as const,
			user: 'Retailer',
			details: `Invoice ${formData.invoiceNumber} on ${formData.saleDate}`
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
			setFormData({ invoiceNumber: '', batchNumber: '', quantitySold: '', buyerName: '', saleDate: '' });
		}, 2000);
	};

	if (submitted) {
		return (
			<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.3)] rounded-2xl p-8 text-center animation-fadeInUp">
				<h3 className="text-2xl font-bold text-brand-green mb-2">Sale Recorded ✅</h3>
				<p className="text-white/70">Activity added to recent activities.</p>
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

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm mb-2">Invoice Number *</label>
						<input name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green" />
					</div>
					<div>
						<label className="block text-sm mb-2">Batch Number *</label>
						<input name="batchNumber" value={formData.batchNumber} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green" />
					</div>
				</div>
				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm mb-2">Quantity Sold *</label>
						<input type="number" name="quantitySold" value={formData.quantitySold} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green" />
					</div>
					<div>
						<label className="block text-sm mb-2">Buyer Name *</label>
						<input name="buyerName" value={formData.buyerName} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green" />
					</div>
				</div>
				<div>
					<label className="block text-sm mb-2">Sale Date *</label>
					<input type="date" name="saleDate" value={formData.saleDate} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green" />
				</div>
				<button type="submit" disabled={isSubmitting} className="w-full bg-brand-green text-black rounded-md py-3 font-semibold hover:brightness-110 disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Save Retail Sale'}</button>
			</form>
		</div>
	);
};

export default RetailerForm;


