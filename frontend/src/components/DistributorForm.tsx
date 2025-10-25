import React, { useState } from 'react';

interface DistributionFormData {
	batchNumber: string;
	destinationCenter: string;
	dispatchDate: string;
	packages: string;
	carrier: string;
}

const DistributorForm: React.FC = () => {
	const [formData, setFormData] = useState<DistributionFormData>({
		batchNumber: '',
		destinationCenter: '',
		dispatchDate: '',
		packages: '',
		carrier: ''
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
			type: 'distribution' as const,
			title: `Distribution Dispatched: ${formData.batchNumber}`,
			description: `To ${formData.destinationCenter} via ${formData.carrier} (${formData.packages} packages)`,
			status: 'completed' as const,
			user: 'Distributor',
			details: `Dispatch Date: ${formData.dispatchDate}`
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
			setFormData({ batchNumber: '', destinationCenter: '', dispatchDate: '', packages: '', carrier: '' });
		}, 2000);
	};

	if (submitted) {
		return (
			<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.3)] rounded-2xl p-8 text-center animation-fadeInUp">
				<h3 className="text-2xl font-bold text-brand-green mb-2">Distribution Recorded ✅</h3>
				<p className="text-white/70">Activity added to recent activities.</p>
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

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm mb-2">Batch Number *</label>
						<input name="batchNumber" value={formData.batchNumber} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green" />
					</div>
					<div>
						<label className="block text-sm mb-2">Destination Center *</label>
						<input name="destinationCenter" value={formData.destinationCenter} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green" />
					</div>
				</div>
				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm mb-2">Dispatch Date *</label>
						<input type="date" name="dispatchDate" value={formData.dispatchDate} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green" />
					</div>
					<div>
						<label className="block text-sm mb-2">Packages *</label>
						<input type="number" name="packages" value={formData.packages} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green" />
					</div>
				</div>
				<div>
					<label className="block text-sm mb-2">Carrier *</label>
					<input name="carrier" value={formData.carrier} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green" />
				</div>
				<button type="submit" disabled={isSubmitting} className="w-full bg-brand-green text-black rounded-md py-3 font-semibold hover:brightness-110 disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Save Distribution'}</button>
			</form>
		</div>
	);
};

export default DistributorForm;


