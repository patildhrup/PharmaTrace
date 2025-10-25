import React, { useState, useEffect } from 'react';

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
	const [tasks, setTasks] = useState<Task[]>([]);
	const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress' | 'pending'>('all');

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
					<h3 className="text-xl font-semibold text-white mb-2">No Activities Yet</h3>
					<p className="text-white/70">Start by adding raw materials or creating drug batches to see activities here.</p>
				</div>
			) : (
				<div className="space-y-4">
					{filteredTasks.map((task) => (
						<div
							key={task.id}
							className={`group bg-gradient-to-r from-[#0d0d0d] to-[#111] border rounded-xl p-6 hover-lift transition-all duration-300 ${getStatusBg(task.status)}`}
						>
							<div className="flex items-start justify-between">
								<div className="flex items-start space-x-4">
									<div className="w-12 h-12 bg-gradient-to-br from-brand-green/20 to-brand-blue/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
										<span className="text-2xl">{getTaskIcon(task.type)}</span>
									</div>
									<div className="flex-1">
										<div className="flex items-center space-x-3 mb-2">
											<h3 className="text-lg font-semibold text-white group-hover:text-brand-green transition-colors duration-300">
												{task.title}
											</h3>
											<span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)} bg-current/20`}>
												{task.status.replace('_', ' ')}
											</span>
										</div>
										<p className="text-white/70 mb-2">{task.description}</p>
										{task.details && (
											<p className="text-brand-green text-sm font-medium">{task.details}</p>
										)}
										<div className="flex items-center space-x-4 mt-3 text-sm text-white/50">
											<span>👤 {task.user}</span>
											<span>🕒 {task.timestamp.toLocaleString()}</span>
										</div>
									</div>
								</div>
								
								<div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
									<button className="text-brand-green hover:text-brand-green-light transition-colors duration-300">
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
		</div>
	);
};

export default RecentTasks;

