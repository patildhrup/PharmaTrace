import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { QRCodeSVG } from 'qrcode.react';

interface Task {
	id: string;
	type: 'raw_material' | 'drug_manufacturing' | 'quality_check' | 'shipment';
	title: string;
	description: string;
	status: 'completed' | 'in_progress' | 'pending';
	timestamp: Date;
	user: string;
	details: string;
}

const RecentTasks: React.FC = () => {
	const { isDarkMode } = useTheme();
	const [tasks, setTasks] = useState<Task[]>([]);
	const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress' | 'pending'>('all');
	const [showQRModal, setShowQRModal] = useState<{ batchNumber: string; taskTitle: string } | null>(null);

	useEffect(() => {
		// Load tasks from localStorage
		const savedTasks = localStorage.getItem('pharmaTasks');
		if (savedTasks) {
			const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
				...task,
				timestamp: new Date(task.timestamp)
			}));
			setTasks(parsedTasks);
		}
	}, []);

	// Function to add new tasks (for future use)
	// const addTask = (newTask: Omit<Task, 'id' | 'timestamp'>) => {
	// 	const task: Task = {
	// 		...newTask,
	// 		id: Date.now().toString(),
	// 		timestamp: new Date()
	// 	};
	// 	const updatedTasks = [task, ...tasks];
	// 	setTasks(updatedTasks);
	// 	localStorage.setItem('pharmaTasks', JSON.stringify(updatedTasks));
	// };

	const getTaskIcon = (type: string) => {
		switch (type) {
			case 'raw_material': return '🏭';
			case 'drug_manufacturing': return '💊';
			case 'quality_check': return '🔍';
			case 'shipment': return '🚚';
			default: return '📋';
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'completed': return 'text-brand-green';
			case 'in_progress': return 'text-brand-orange';
			case 'pending': return 'text-brand-blue';
			default: return 'text-white/70';
		}
	};

	const getStatusBg = (status: string) => {
		switch (status) {
			case 'completed': return 'bg-brand-green/20 border-brand-green/30';
			case 'in_progress': return 'bg-brand-orange/20 border-brand-orange/30';
			case 'pending': return 'bg-brand-blue/20 border-brand-blue/30';
			default: return 'bg-white/10 border-white/20';
		}
	};

	const filteredTasks = tasks.filter(task => 
		filter === 'all' || task.status === filter
	);

	// Extract batch number from description
	const extractBatchNumber = (description: string): string | null => {
		// Match patterns like "Batch: BATCH_NUMBER", "(Batch: BATCH_NUMBER)", or "Batch: BATCH-NUMBER"
		// Handles formats like: PHARMA_BATCH_2026_001, PCM-2024-001, etc.
		const match = description.match(/[Bb]atch:\s*([A-Z0-9_\-]+)/);
		return match ? match[1] : null;
	};

	// Check if task has a batch number (for manufacturing tasks)
	const hasBatchNumber = (task: Task): boolean => {
		return task.type === 'drug_manufacturing' && extractBatchNumber(task.description) !== null;
	};

	const handleShowQR = (task: Task) => {
		const batchNumber = extractBatchNumber(task.description);
		if (batchNumber) {
			setShowQRModal({ batchNumber, taskTitle: task.title });
		}
	};

	return (
		<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.2)] rounded-2xl p-8 animation-fadeInUp">
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center">
					<div className="w-12 h-12 bg-gradient-to-br from-brand-green/20 to-brand-blue/20 rounded-xl flex items-center justify-center mr-4 animation-pulseGlow">
						<span className="text-2xl">📋</span>
					</div>
					<div>
						<h2 className="text-2xl font-bold text-white">Recent Activities</h2>
						<p className="text-white/70">Track your pharmaceutical supply chain activities</p>
					</div>
				</div>
				
				<div className="flex space-x-2">
					{['all', 'completed', 'in_progress', 'pending'].map((status) => (
						<button
							key={status}
							onClick={() => setFilter(status as any)}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover-scale ${
								filter === status
									? 'bg-brand-green text-black'
									: 'bg-white/10 text-white/70 hover:bg-white/20'
							}`}
						>
							{status.charAt(0).toUpperCase() + status.slice(1)}
						</button>
					))}
				</div>
			</div>

			{filteredTasks.length === 0 ? (
				<div className="text-center py-12">
					<div className="w-20 h-20 bg-gradient-to-br from-brand-green/20 to-brand-blue/20 rounded-full flex items-center justify-center mx-auto mb-4 animation-float">
						<span className="text-4xl">📝</span>
					</div>
					<h3 className="text-xl font-semibold mb-2" style={{color: 'var(--text-primary)'}}>No Activities Yet</h3>
					<p style={{color: 'var(--text-secondary)'}}>Start by adding raw materials or creating drug batches to see activities here.</p>
				</div>
			) : (
				<div className="space-y-4">
					{filteredTasks.map((task) => (
						<div
							key={task.id}
							className={`group border rounded-xl p-6 hover-lift transition-all duration-300 ${getStatusBg(task.status)}`}
							style={{
								background: `linear-gradient(90deg, var(--bg-primary), var(--bg-secondary))`,
								borderColor: 'var(--border-color)'
							}}
						>
							<div className="flex items-start justify-between">
								<div className="flex items-start space-x-4">
									<div className="w-12 h-12 bg-gradient-to-br from-brand-green/20 to-brand-blue/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
										<span className="text-2xl">{getTaskIcon(task.type)}</span>
									</div>
									<div className="flex-1">
										<div className="flex items-center space-x-3 mb-2">
											<h3 className="text-lg font-semibold group-hover:text-brand-green transition-colors duration-300" style={{color: 'var(--text-primary)'}}>
												{task.title}
											</h3>
											<span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)} bg-current/20`}>
												{task.status.replace('_', ' ')}
											</span>
										</div>
										<p className="mb-2" style={{color: 'var(--text-secondary)'}}>{task.description}</p>
										{task.details && (
											<p className="text-brand-green text-sm font-medium">{task.details}</p>
										)}
										<div className="flex items-center space-x-4 mt-3 text-sm" style={{color: 'var(--text-secondary)'}}>
											<span>👤 {task.user}</span>
											<span>🕒 {task.timestamp.toLocaleString()}</span>
										</div>
									</div>
								</div>
								
								<div className="flex items-center space-x-2">
									{hasBatchNumber(task) && (
										<button
											onClick={() => handleShowQR(task)}
											className="text-brand-green hover:text-brand-green-light transition-all duration-300 p-2 rounded-lg hover:bg-brand-green/10 opacity-80 hover:opacity-100"
											title="View QR Code"
										>
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
											</svg>
										</button>
									)}
									<button className="text-brand-green hover:text-brand-green-light transition-colors duration-300 opacity-0 group-hover:opacity-100">
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
										</svg>
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* QR Code Modal */}
			{showQRModal && (
				<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowQRModal(null)}>
					<div 
						className="bg-[#111] border border-[rgba(34,197,94,0.3)] rounded-xl p-8 max-w-md w-full animation-fadeInUp"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-xl font-semibold text-brand-green">QR Code for Verification</h3>
							<button
								onClick={() => setShowQRModal(null)}
								className="text-white/70 hover:text-white transition-colors"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						
						<div className="text-center mb-4">
							<p className="text-white/70 text-sm mb-2">{showQRModal.taskTitle}</p>
							<p className="text-white/50 text-xs">Batch: <span className="text-brand-green font-semibold">{showQRModal.batchNumber}</span></p>
						</div>

						<div className="flex flex-col items-center mb-6">
							<div className="bg-white p-4 rounded-lg mb-4">
								<QRCodeSVG 
									value={`${window.location.origin}/verify/${showQRModal.batchNumber}`}
									size={200}
									level="H"
									includeMargin={true}
								/>
							</div>
							<p className="text-white/50 text-xs break-all max-w-sm text-center">
								{window.location.origin}/verify/{showQRModal.batchNumber}
							</p>
							<p className="text-white/60 text-xs mt-3 text-center">
								Consumers can scan this QR code to verify the product
							</p>
						</div>

						<div className="flex space-x-3">
							<button
								onClick={() => {
									const url = `${window.location.origin}/verify/${showQRModal.batchNumber}`;
									navigator.clipboard.writeText(url);
									// You could add a toast notification here
								}}
								className="flex-1 bg-brand-green/20 border border-brand-green text-brand-green rounded-lg py-2 font-semibold hover:bg-brand-green/30 transition-colors"
							>
								Copy Link
							</button>
							<button
								onClick={() => setShowQRModal(null)}
								className="flex-1 bg-white/10 border border-white/20 text-white rounded-lg py-2 font-semibold hover:bg-white/20 transition-colors"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default RecentTasks;

