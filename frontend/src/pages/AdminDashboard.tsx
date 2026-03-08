import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Chatbot from '../components/Chatbot';
import { getGlobalStats, getRecentGlobalActivities } from '../services/api';
import { Activity, Package, Truck, LayoutGrid, Database, BarChart3 } from 'lucide-react';

const AdminDashboard: React.FC = () => {
	const { isDarkMode } = useTheme();
	const navigate = useNavigate();
	const [stats, setStats] = useState<any>(null);
	const [activities, setActivities] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [currentTab, setCurrentTab] = useState<'dashboard' | 'charts' | 'activities'>('dashboard');

	useEffect(() => {
		if (!localStorage.getItem('adminAuth')) {
			navigate('/admin-login');
			return;
		}
		fetchDashboardData();
		const interval = setInterval(fetchDashboardData, 30000); // Auto refresh every 30s
		return () => clearInterval(interval);
	}, [navigate]);

	const fetchDashboardData = async () => {
		try {
			const [s, a] = await Promise.all([
				getGlobalStats(),
				getRecentGlobalActivities()
			]);
			setStats(s);
			setActivities(a);
		} catch (err) {
			console.error('Failed to fetch admin data:', err);
		} finally {
			setIsLoading(false);
		}
	};

	const logout = () => {
		localStorage.removeItem('adminAuth');
		navigate('/');
	};

	const flowRoles = [
		{ id: 'supplier', name: 'Supplier', icon: '🏭', color: 'from-blue-500 to-blue-600', count: stats?.supplierCount || 0, label: 'Materials' },
		{ id: 'manufacturer', name: 'Manufacturer', icon: '⚗️', color: 'from-purple-500 to-purple-600', count: stats?.manufacturerCount || 0, label: 'Drugs' },
		{ id: 'distributor', name: 'Distributor', icon: '📦', color: 'from-orange-500 to-orange-600', count: stats?.distributorCount || 0, label: 'Packages' },
		{ id: 'transport', name: 'Transport', icon: '🚚', color: 'from-yellow-500 to-yellow-600', count: stats?.transporterCount || 0, label: 'Shipments' },
		{ id: 'retailer', name: 'Retailer', icon: '🏥', color: 'from-green-500 to-green-600', count: stats?.retailerCount || 0, label: 'Sales' }
	];

	return (
		<div className="min-h-screen relative overflow-hidden transition-colors duration-300" style={{
			backgroundColor: 'var(--bg-primary)',
			color: 'var(--text-primary)'
		}}>
			{/* Animated Background Grid */}
			<div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#22c55e 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

			{/* Background Particles (Keep as requested) */}
			<div className="fixed inset-0 pointer-events-none">
				{Array.from({ length: 15 }).map((_, i) => (
					<div
						key={i}
						className="particle"
						style={{
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`,
							animationDelay: `${Math.random() * 8}s`,
							animationDuration: `${6 + Math.random() * 4}s`
						}}
					/>
				))}
			</div>

			{/* Header */}
			<div className="bg-[#111] border-b border-[rgba(34,197,94,0.2)] relative z-10 sticky top-0 shadow-xl backdrop-blur-md">
				<div className="max-w-7xl mx-auto px-6 py-4">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-4">
							<div className="w-10 h-10 bg-brand-green/20 rounded-lg flex items-center justify-center">
								<BarChart3 className="text-brand-green w-6 h-6" />
							</div>
							<div>
								<h1 className="text-xl font-bold tracking-tight"><span className="text-brand-green">Analysis</span> Center</h1>
								<p className="text-white/50 text-[10px] uppercase tracking-widest font-bold">Admin Dashboard • Real-time Data</p>
							</div>
						</div>
						<div className="flex items-center gap-6">
							<button onClick={logout} className="text-white/70 hover:text-red-500 text-sm font-medium transition-colors">Logout</button>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-6 py-12 relative z-10">

				{/* Tab Navigation */}
				<div className="flex space-x-4 mb-8">
					<button
						onClick={() => setCurrentTab('dashboard')}
						className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover-lift ${currentTab === 'dashboard'
							? 'bg-gradient-to-r from-brand-green to-brand-blue text-black shadow-lg'
							: 'bg-gradient-to-r from-[#111] to-[#0d0d0d] text-white border-2 border-[rgba(34,197,94,0.2)] hover:border-brand-green hover:shadow-lg hover:shadow-brand-green/20'
							}`}
					>
						📊 Dashboard
					</button>
					<button
						onClick={() => setCurrentTab('charts')}
						className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover-lift ${currentTab === 'charts'
							? 'bg-gradient-to-r from-brand-green to-brand-blue text-black shadow-lg'
							: 'bg-gradient-to-r from-[#111] to-[#0d0d0d] text-white border-2 border-[rgba(34,197,94,0.2)] hover:border-brand-green hover:shadow-lg hover:shadow-brand-green/20'
							}`}
					>
						📈 Charts
					</button>
					<button
						onClick={() => setCurrentTab('activities')}
						className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover-lift ${currentTab === 'activities'
							? 'bg-gradient-to-r from-brand-green to-brand-blue text-black shadow-lg'
							: 'bg-gradient-to-r from-[#111] to-[#0d0d0d] text-white border-2 border-[rgba(34,197,94,0.2)] hover:border-brand-green hover:shadow-lg hover:shadow-brand-green/20'
							}`}
					>
						📋 Global Activities
					</button>
				</div>

				{/* Tab Content */}
				<div className="transition-all duration-300">
					{currentTab === 'dashboard' && (
						<div className="space-y-8 animate-fadeIn">
							{/* Enhanced Stats Grid */}
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
								<div className="group bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.2)] rounded-2xl p-6 hover:border-brand-green transition-all duration-300 hover-lift hover:shadow-2xl hover:shadow-brand-green/20 transform-3d perspective-1000">
									<div className="flex justify-between items-start mb-4">
										<div className="flex items-center gap-2">
											<Database className="w-5 h-5 text-brand-green group-hover:scale-110 transition-transform" />
											<h3 className="text-white/70 text-sm font-semibold group-hover:text-brand-green transition-colors duration-300">Total Products</h3>
										</div>
									</div>
									<p className="text-3xl font-bold text-white group-hover:text-brand-green transition-colors duration-300 animation-fadeInUp">{stats?.totalProducts || 0}</p>
									<div className="mt-4 h-1 bg-gradient-to-r from-brand-green to-brand-blue rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
								</div>

								{flowRoles.map((role, index) => (
									<div key={role.id} className="group bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.2)] rounded-2xl p-6 hover:border-brand-green transition-all duration-300 hover-lift hover:shadow-2xl hover:shadow-brand-green/20 transform-3d perspective-1000">
										<div className="flex justify-between items-start mb-4">
											<div className="flex items-center gap-2">
												<span className="text-xl group-hover:scale-110 transition-transform">{role.icon}</span>
												<h3 className="text-white/70 text-sm font-semibold group-hover:text-brand-green transition-colors duration-300">{role.label}</h3>
											</div>
										</div>
										<p className="text-3xl font-bold text-white group-hover:text-brand-green transition-colors duration-300 animation-fadeInUp" style={{ animationDelay: `${(index + 1) * 0.1}s` }}>{role.count}</p>
										<div className="mt-4 h-1 bg-gradient-to-r from-brand-green to-brand-blue rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
									</div>
								))}
							</div>

							{/* Supply Chain Flow Visualization Card */}
							<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.2)] rounded-3xl p-8 shadow-2xl overflow-hidden relative">
								<div className="absolute top-0 right-0 p-8 opacity-10"><Activity className="w-32 h-32" /></div>
								<h3 className="text-lg font-bold mb-8 flex items-center gap-2">
									<LayoutGrid className="text-brand-green w-5 h-5" />
									Supply Chain Intelligence Flow
								</h3>

								<div className="flex items-center justify-between relative px-4">
									{flowRoles.map((role, index) => (
										<React.Fragment key={role.id}>
											<div className="flex flex-col items-center relative z-10">
												<div className={`w-14 h-14 bg-gradient-to-br ${role.color} rounded-2xl flex items-center justify-center mb-3 shadow-lg transition-all border border-white/10`}>
													<span className="text-2xl">{role.icon}</span>
												</div>
												<span className="text-[10px] font-bold uppercase text-white/50">{role.name}</span>
												<span className="text-xs font-bold text-brand-green">{role.count}</span>
											</div>
											{index < flowRoles.length - 1 && (
												<div className="flex-1 h-[2px] bg-gradient-to-r from-brand-green/50 to-brand-green/10 mx-2 relative top-[-15px]">
													<div className="absolute right-0 top-[-3px] w-2 h-2 bg-brand-green rounded-full shadow-[0_0_10px_#22c55e]"></div>
												</div>
											)}
										</React.Fragment>
									))}
								</div>
							</div>

							<div className="bg-[#111] border border-[rgba(34,197,94,0.1)] rounded-3xl p-8 border-dashed flex flex-col items-center justify-center text-center">
								<div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
									<BarChart3 className="text-white/30" />
								</div>
								<h4 className="text-white/50 font-bold mb-1">Status Overview</h4>
								<p className="text-white/30 text-xs text-balance max-w-md mx-auto">The dashboard provides a real-time snapshot of the entire supply chain state. View live updates as participants record activities.</p>
							</div>
						</div>
					)}

					{currentTab === 'charts' && (
						<div className="grid md:grid-cols-2 gap-8 animate-fadeIn">
							<div className="bg-[#111] border border-[rgba(34,197,94,0.2)] rounded-3xl p-8">
								<h3 className="text-lg font-bold mb-6 flex items-center gap-2">
									<BarChart3 className="text-brand-green w-5 h-5" />
									Distribution Analysis
								</h3>
								<div className="h-64 flex items-end justify-between gap-4 px-4">
									{flowRoles.map(role => (
										<div key={role.id} className="flex-1 group flex flex-col items-center gap-2">
											<div
												className={`w-full bg-gradient-to-t ${role.color} rounded-t-lg transition-all duration-500`}
												style={{ height: `${Math.max(10, (role.count / (stats?.totalProducts || 1)) * 100)}%` }}
											></div>
											<span className="text-[10px] font-bold uppercase text-white/30 group-hover:text-brand-green transition-colors">{role.name.substring(0, 3)}</span>
										</div>
									))}
								</div>
								<p className="text-white/40 text-[10px] text-center mt-6 uppercase tracking-widest">Participant Activity Distribution</p>
							</div>

							<div className="bg-[#111] border border-[rgba(34,197,94,0.2)] rounded-3xl p-8 flex flex-col items-center justify-center text-center">
								<div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mb-6">
									<LayoutGrid className="text-brand-green animate-pulse" />
								</div>
								<h3 className="text-lg font-bold mb-2">More Charts Coming Soon</h3>
								<p className="text-white/40 text-sm max-w-xs">We are developing advanced data visualizations including geographical maps and time-series analysis.</p>
							</div>
						</div>
					)}

					{currentTab === 'activities' && (
						<div className="max-w-4xl mx-auto animate-fadeIn">
							<div className="bg-[#111] border border-[rgba(34,197,94,0.2)] rounded-3xl p-8">
								<div className="flex items-center justify-between mb-8">
									<h3 className="text-lg font-bold flex items-center gap-2">
										<Activity className="text-brand-green w-5 h-5" />
										Global Activity Stream
									</h3>
									{isLoading && <div className="w-4 h-4 border-2 border-brand-green border-t-transparent rounded-full animate-spin"></div>}
								</div>

								<div className="space-y-4">
									{!isLoading && activities.length === 0 && (
										<p className="text-center text-white/30 py-12 text-sm italic">No activities recorded in database yet.</p>
									)}
									{activities.map((activity, idx) => (
										<div key={idx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:border-brand-green/30 transition-all flex items-center gap-6 group">
											<div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
												<span className="text-xl">
													{activity.role === 'Supplier' && '🏭'}
													{activity.role === 'Manufacturer' && '⚗️'}
													{activity.role === 'Distributor' && '📦'}
													{activity.role === 'Transport' && '🚚'}
													{activity.role === 'Retailer' && '🏥'}
												</span>
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex justify-between items-start mb-1">
													<span className="text-[10px] font-black uppercase tracking-tighter text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-md">
														{activity.role}
													</span>
													<span className="text-[10px] text-white/30 font-mono">
														{new Date(activity.timestamp).toLocaleString()}
													</span>
												</div>
												<p className="text-sm font-medium text-white/90 mb-1 group-hover:text-brand-green transition-colors">{activity.action}</p>
												<p className="text-[10px] text-white/40 font-mono truncate">TX: {activity.txHash || 'N/A'}</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			<Chatbot />
		</div>
	);
};

export default AdminDashboard;

