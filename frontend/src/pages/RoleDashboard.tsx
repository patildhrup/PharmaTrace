import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ManufacturerForm from '../components/ManufacturerForm';
import SupplierForm from '../components/SupplierForm';
import DistributorForm from '../components/DistributorForm';
import TransportForm from '../components/TransportForm';
import RetailerForm from '../components/RetailerForm';
import ConsumerForm from '../components/ConsumerForm';
import RecentTasks from '../components/RecentTasks';

interface RoleData {
	id: string;
	name: string;
	icon: string;
	color: string;
	stats: { label: string; value: string; change: string }[];
	recentActivities: { id: string; action: string; timestamp: string; status: string }[];
}

const RoleDashboard: React.FC = () => {
	const { roleId } = useParams<{ roleId: string }>();
	const navigate = useNavigate();
    const [roleData, setRoleData] = useState<RoleData | null>(null);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'form' | 'activities'>('dashboard');
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const onMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', onMove);
        return () => window.removeEventListener('mousemove', onMove);
    }, []);

    useEffect(() => {
		if (!localStorage.getItem('adminAuth') && !localStorage.getItem('roleAuth')) {
			navigate('/admin-login');
			return;
		}

		// Mock data for different roles
		const roleDataMap: Record<string, RoleData> = {
			supplier: {
				id: 'supplier',
				name: 'Supplier Dashboard',
				icon: '🏭',
				color: 'from-blue-500 to-blue-600',
				stats: [
					{ label: 'Active Suppliers', value: '45', change: '+12%' },
					{ label: 'Materials Supplied', value: '1,234', change: '+8%' },
					{ label: 'Quality Score', value: '98.5%', change: '+2.1%' },
					{ label: 'Pending Orders', value: '23', change: '-5%' }
				],
				recentActivities: [
					{ id: '1', action: 'Raw Material Batch #RM-001 delivered', timestamp: '2 hours ago', status: 'completed' },
					{ id: '2', action: 'Quality inspection for Batch #RM-002', timestamp: '4 hours ago', status: 'pending' },
					{ id: '3', action: 'New supplier registration: PharmaCorp', timestamp: '1 day ago', status: 'completed' }
				]
			},
			manufacturer: {
				id: 'manufacturer',
				name: 'Manufacturer Dashboard',
				icon: '⚗️',
				color: 'from-purple-500 to-purple-600',
				stats: [
					{ label: 'Production Lines', value: '12', change: '+2' },
					{ label: 'Drugs Manufactured', value: '5,678', change: '+15%' },
					{ label: 'Quality Compliance', value: '99.2%', change: '+0.8%' },
					{ label: 'Batch Failures', value: '3', change: '-67%' }
				],
				recentActivities: [
					{ id: '1', action: 'Paracetamol Batch #PCM-2024-001 completed', timestamp: '1 hour ago', status: 'completed' },
					{ id: '2', action: 'Amoxicillin production started', timestamp: '3 hours ago', status: 'in-progress' },
					{ id: '3', action: 'Quality control for Batch #AMX-2024-002', timestamp: '6 hours ago', status: 'pending' }
				]
			},
			distributor: {
				id: 'distributor',
				name: 'Distributor Dashboard',
				icon: '📦',
				color: 'from-orange-500 to-orange-600',
				stats: [
					{ label: 'Distribution Centers', value: '8', change: '+1' },
					{ label: 'Packages Distributed', value: '12,345', change: '+22%' },
					{ label: 'Delivery Success Rate', value: '97.8%', change: '+1.2%' },
					{ label: 'Pending Shipments', value: '156', change: '-12%' }
				],
				recentActivities: [
					{ id: '1', action: 'Shipment to Delhi Distribution Center', timestamp: '30 minutes ago', status: 'in-transit' },
					{ id: '2', action: 'Batch #PCM-2024-001 received from manufacturer', timestamp: '2 hours ago', status: 'completed' },
					{ id: '3', action: 'Quality check for incoming shipment', timestamp: '4 hours ago', status: 'pending' }
				]
			},
			transport: {
				id: 'transport',
				name: 'Transport Dashboard',
				icon: '🚚',
				color: 'from-yellow-500 to-yellow-600',
				stats: [
					{ label: 'Active Vehicles', value: '24', change: '+3' },
					{ label: 'Deliveries Today', value: '89', change: '+18%' },
					{ label: 'On-Time Delivery', value: '94.5%', change: '+2.1%' },
					{ label: 'Temperature Violations', value: '2', change: '-50%' }
				],
				recentActivities: [
					{ id: '1', action: 'Vehicle #TR-001 departed for Mumbai', timestamp: '1 hour ago', status: 'in-transit' },
					{ id: '2', action: 'Temperature monitoring alert resolved', timestamp: '3 hours ago', status: 'completed' },
					{ id: '3', action: 'New route optimization applied', timestamp: '1 day ago', status: 'completed' }
				]
			},
			retailer: {
				id: 'retailer',
				name: 'Retailer Dashboard',
				icon: '🏥',
				color: 'from-green-500 to-green-600',
				stats: [
					{ label: 'Registered Pharmacies', value: '156', change: '+8' },
					{ label: 'Drugs Sold Today', value: '2,345', change: '+12%' },
					{ label: 'Customer Satisfaction', value: '96.8%', change: '+1.5%' },
					{ label: 'Expired Drugs', value: '12', change: '-25%' }
				],
				recentActivities: [
					{ id: '1', action: 'Apollo Pharmacy received new stock', timestamp: '45 minutes ago', status: 'completed' },
					{ id: '2', action: 'Expiry alert for Batch #PCM-2023-045', timestamp: '2 hours ago', status: 'pending' },
					{ id: '3', action: 'Customer verification for prescription', timestamp: '3 hours ago', status: 'completed' }
				]
			},
			consumer: {
				id: 'consumer',
				name: 'Consumer Dashboard',
				icon: '🧑\u200d⚕️',
				color: 'from-emerald-500 to-teal-600',
				stats: [
					{ label: 'Scans Performed', value: '89', change: '+14%' },
					{ label: 'Authenticity Verified', value: '100%', change: '0%' },
					{ label: 'Alerts Received', value: '0', change: '0' },
					{ label: 'Batches Viewed', value: '72', change: '+8%' }
				],
				recentActivities: [
					{ id: '1', action: 'Scanned QR for Paracetamol 500mg', timestamp: '10 minutes ago', status: 'completed' },
					{ id: '2', action: 'Viewed chain of custody for Batch #PCM-2024-001', timestamp: '20 minutes ago', status: 'completed' },
					{ id: '3', action: 'Checked retailer authenticity', timestamp: '30 minutes ago', status: 'completed' }
				]
			}
		};

		setRoleData(roleDataMap[roleId || '']);
	}, [roleId, navigate]);

	if (!roleData) {
		return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>;
	}

	return (
		<div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
			{/* Animated Background Particles */}
            <div className="fixed inset-0 pointer-events-none">
                {Array.from({ length: 30 }).map((_, i) => (
					<div
						key={i}
						className="particle"
						style={{
                            left: `calc(${Math.random() * 100}% + ${(mousePosition.x - window.innerWidth / 2) * 0.004}px)`,
                            top: `calc(${Math.random() * 100}% + ${(mousePosition.y - window.innerHeight / 2) * 0.004}px)`,
							animationDelay: `${Math.random() * 8}s`,
							animationDuration: `${6 + Math.random() * 4}s`
						}}
					/>
				))}
			</div>
			
			{/* Animated Background Grid */}
			<div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'radial-gradient(#22c55e 1px, transparent 1px)', backgroundSize:'24px 24px'}}/>
			
			{/* Floating 3D Elements */}
			<div className="absolute top-20 left-10 animation-float transform-3d perspective-1000">
				<div className="w-12 h-12 bg-gradient-to-br from-brand-green/20 to-brand-blue/20 border border-brand-green/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
					<span className="text-xl">💊</span>
				</div>
			</div>
			
			<div className="absolute top-32 right-20 animation-floatReverse transform-3d perspective-1000" style={{animationDelay: '1s'}}>
				<div className="w-16 h-16 bg-gradient-to-br from-brand-purple/20 to-brand-green/20 border border-brand-purple/30 rounded-full flex items-center justify-center backdrop-blur-sm">
					<span className="text-2xl">🧬</span>
				</div>
			</div>

			<div className="absolute bottom-32 left-1/4 animation-float transform-3d perspective-1000" style={{animationDelay: '2s'}}>
				<div className="w-10 h-10 bg-gradient-to-br from-brand-orange/20 to-brand-green/20 border border-brand-orange/30 rounded-lg flex items-center justify-center backdrop-blur-sm">
					<span className="text-lg">⚗️</span>
				</div>
			</div>
			{/* Header */}
			<div className="bg-[#111] border-b border-[rgba(34,197,94,0.2)] relative z-10">
				<div className="max-w-7xl mx-auto px-4 py-6">
					<div className="flex justify-between items-center">
						<div className="flex items-center">
							<button 
								onClick={() => navigate('/admin-dashboard')}
								className="mr-4 text-brand-green hover:text-white transition-colors"
							>
								← Back to Admin
							</button>
							<div className={`w-12 h-12 bg-gradient-to-r ${roleData.color} rounded-full flex items-center justify-center mr-4`}>
								<span className="text-xl">{roleData.icon}</span>
							</div>
							<div>
								<h1 className="text-2xl font-bold">{roleData.name}</h1>
								<p className="text-white/70">Real-time monitoring and management</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
				{/* Enhanced Tab Navigation */}
				<div className="flex space-x-4 mb-8">
					<button
						onClick={() => setActiveTab('dashboard')}
						className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover-lift ${
							activeTab === 'dashboard'
								? 'bg-gradient-to-r from-brand-green to-brand-blue text-black shadow-lg'
								: 'bg-gradient-to-r from-[#111] to-[#0d0d0d] text-white border-2 border-[rgba(34,197,94,0.2)] hover:border-brand-green hover:shadow-lg hover:shadow-brand-green/20'
						}`}
					>
						📊 Dashboard
					</button>
					<button
						onClick={() => setActiveTab('form')}
						className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover-lift ${
							activeTab === 'form'
								? 'bg-gradient-to-r from-brand-green to-brand-blue text-black shadow-lg'
								: 'bg-gradient-to-r from-[#111] to-[#0d0d0d] text-white border-2 border-[rgba(34,197,94,0.2)] hover:border-brand-green hover:shadow-lg hover:shadow-brand-green/20'
						}`}
					>
					{roleData?.id === 'manufacturer' ? '💊 Add Drug' : 
					 roleData?.id === 'supplier' ? '🏭 Add Raw Material' :
					 roleData?.id === 'distributor' ? '📦 Add Distribution' :
					 roleData?.id === 'transport' ? '🚚 Add Shipment' :
					 roleData?.id === 'retailer' ? '🏥 Add Sale' :
					 roleData?.id === 'consumer' ? '🧑\u200d⚕️ Verify Product' : '➕ Add Item'}
					</button>
					<button
						onClick={() => setActiveTab('activities')}
						className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover-lift ${
							activeTab === 'activities'
								? 'bg-gradient-to-r from-brand-green to-brand-blue text-black shadow-lg'
								: 'bg-gradient-to-r from-[#111] to-[#0d0d0d] text-white border-2 border-[rgba(34,197,94,0.2)] hover:border-brand-green hover:shadow-lg hover:shadow-brand-green/20'
						}`}
					>
						📋 Recent Activities
					</button>
				</div>

				{/* Form Content */}
				{activeTab === 'form' && (
					<div className="mb-8 animation-fadeInUp">
						{roleData?.id === 'manufacturer' && <ManufacturerForm />}
					{roleData?.id === 'supplier' && <SupplierForm />}
					{roleData?.id === 'distributor' && <DistributorForm />}
					{roleData?.id === 'transport' && <TransportForm />}
					{roleData?.id === 'retailer' && <RetailerForm />}
					{roleData?.id === 'consumer' && <ConsumerForm />}
					</div>
				)}

				{/* Activities Content */}
				{activeTab === 'activities' && (
					<div className="mb-8 animation-fadeInUp">
						<RecentTasks />
					</div>
				)}

				{/* Dashboard Content */}
				{activeTab === 'dashboard' && (
					<>
						{/* Enhanced Stats Grid */}
						<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
							{roleData.stats.map((stat, index) => (
								<div key={index} className="group bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.2)] rounded-2xl p-6 hover:border-brand-green transition-all duration-300 hover-lift hover:shadow-2xl hover:shadow-brand-green/20 transform-3d perspective-1000">
									<div className="flex justify-between items-start mb-4">
										<h3 className="text-white/70 text-sm font-semibold group-hover:text-brand-green transition-colors duration-300">{stat.label}</h3>
										<span className="text-brand-green text-xs font-bold bg-brand-green/20 px-2 py-1 rounded-full">{stat.change}</span>
									</div>
									<p className="text-3xl font-bold text-white group-hover:text-brand-green transition-colors duration-300 animation-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>{stat.value}</p>
									<div className="mt-4 h-1 bg-gradient-to-r from-brand-green to-brand-blue rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
								</div>
							))}
						</div>

				{/* Recent Activities */}
				<div className="bg-[#111] border border-[rgba(34,197,94,0.2)] rounded-xl p-6">
					<h2 className="text-xl font-semibold mb-6">Recent Activities</h2>
					<div className="space-y-4">
						{roleData.recentActivities.map((activity) => (
							<div key={activity.id} className="flex items-center justify-between p-4 bg-[#0d0d0d] rounded-lg hover:bg-[#141414] transition-colors">
								<div className="flex items-center">
									<div className={`w-3 h-3 rounded-full mr-4 ${
										activity.status === 'completed' ? 'bg-brand-green' :
										activity.status === 'in-progress' ? 'bg-yellow-500' :
										'bg-red-500'
									}`}></div>
									<div>
										<p className="text-white font-medium">{activity.action}</p>
										<p className="text-white/50 text-sm">{activity.timestamp}</p>
									</div>
								</div>
								<span className={`px-3 py-1 rounded-full text-xs font-semibold ${
									activity.status === 'completed' ? 'bg-brand-green text-black' :
									activity.status === 'in-progress' ? 'bg-yellow-500 text-black' :
									'bg-red-500 text-white'
								}`}>
									{activity.status}
								</span>
							</div>
						))}
					</div>
				</div>
					</>
				)}
			</div>
		</div>
	);
};

export default RoleDashboard;
