import React, { useState } from 'react';

interface ConsumerFormData {
	qrCode: string;
	productName: string;
	serialNumber: string;
}

const ConsumerForm: React.FC = () => {
	const [formData, setFormData] = useState<ConsumerFormData>({
		qrCode: '',
		productName: '',
		serialNumber: ''
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		await new Promise(r => setTimeout(r, 1000));

		const newTask = {
			type: 'consumer_scan' as const,
			title: `Consumer Scan: ${formData.productName}`,
			description: `QR ${formData.qrCode} | Serial ${formData.serialNumber}`,
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
		setSubmitted(true);
		setTimeout(() => {
			setSubmitted(false);
			setFormData({ qrCode: '', productName: '', serialNumber: '' });
		}, 1800);
	};

	if (submitted) {
		return (
			<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.3)] rounded-2xl p-8 text-center animation-fadeInUp">
				<h3 className="text-2xl font-bold text-brand-green mb-2">Scan Recorded ✅</h3>
				<p className="text-white/70">Chain of custody opened for the consumer.</p>
			</div>
		);
	}

	return (
		<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.2)] rounded-2xl p-8 animation-fadeInUp">
			<div className="flex items-center mb-6">
				<div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4"><span>🧑\u200d⚕️</span></div>
				<div>
					<h2 className="text-xl font-semibold">Verify Product by QR</h2>
					<p className="text-white/70 text-sm">Consumers can check safety and origin</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm mb-2">QR Code *</label>
						<input name="qrCode" value={formData.qrCode} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green" />
					</div>
					<div>
						<label className="block text-sm mb-2">Product Name *</label>
						<input name="productName" value={formData.productName} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green" />
					</div>
				</div>
				<div>
					<label className="block text-sm mb-2">Serial Number *</label>
					<input name="serialNumber" value={formData.serialNumber} onChange={handleChange} required className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 focus:border-brand-green" />
				</div>
				<button type="submit" disabled={isSubmitting} className="w-full bg-brand-green text-black rounded-md py-3 font-semibold hover:brightness-110 disabled:opacity-50">{isSubmitting ? 'Verifying...' : 'Verify & View Chain'}</button>
			</form>
		</div>
	);
};

export default ConsumerForm;


