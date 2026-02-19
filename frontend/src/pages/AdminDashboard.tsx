import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

interface Role {
	id: string;
	name: string;
	icon: string;
	description: string;
	color: string;
}

const AdminDashboard: React.FC = () => {
	const { isDarkMode } = useTheme();
	// const [selectedRole, setSelectedRole] = useState<string | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		if (!localStorage.getItem('adminAuth')) {
			navigate('/admin-login');
		}
	}, [navigate]);

	const roles: Role[] = [
		{
			id: 'supplier',
			name: 'Supplier',
			icon: '🏭',
			description: 'Raw material suppliers and ingredient providers',
			color: 'from-blue-500 to-blue-600'
		},
		{
			id: 'manufacturer',
			name: 'Manufacturer',
			icon: '⚗️',
			description: 'Drug manufacturing and production facilities',
			color: 'from-purple-500 to-purple-600'
		},
		{
			id: 'distributor',
			name: 'Distributor',
			icon: '📦',
			description: 'Wholesale distributors and regional centers',
			color: 'from-orange-500 to-orange-600'
		},
		{
			id: 'transport',
			name: 'Transport',
			icon: '🚚',
			description: 'Logistics and transportation companies',
			color: 'from-yellow-500 to-yellow-600'
		},
		{
			id: 'retailer',
			name: 'Retailer',
			icon: '🏥',
			description: 'Pharmacies, hospitals, and retail outlets',
			color: 'from-green-500 to-green-600'
		}
	];

	const handleRoleSelect = (roleId: string) => {
		// Navigate to specific role dashboard
		navigate(`/role-dashboard/${roleId}`);
	};

	const logout = () => {
		localStorage.removeItem('adminAuth');
		navigate('/');
	};

	return (
		<div className="min-h-screen relative overflow-hidden transition-colors duration-300" style={{
			backgroundColor: 'var(--bg-primary)',
			color: 'var(--text-primary)'
		}}>
			{/* Animated Background Particles */}
			<div className="fixed inset-0 pointer-events-none">
				{Array.from({ length: 25 }).map((_, i) => (
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
						<div>
							<h1 className="text-2xl font-bold"><span className="text-brand-green">Admin</span> Dashboard</h1>
							<p className="text-white/70">Manage pharmaceutical supply chain roles</p>
						</div>
						<button 
							onClick={logout}
							className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
						>
							Logout
						</button>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold mb-4">Select Role Dashboard</h2>
					<p className="text-white/70 max-w-2xl mx-auto">
						Choose a role to access its specific dashboard and manage pharmaceutical supply chain operations.
					</p>
				</div>

				{/* Role Cards */}
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{roles.map((role) => (
						<div 
							key={role.id}
							onClick={() => handleRoleSelect(role.id)}
							className="group bg-[#111] border border-[rgba(34,197,94,0.2)] rounded-xl p-6 hover:border-brand-green transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-brand-green/20 cursor-pointer"
						>
							<div className="text-center">
								<div className={`w-20 h-20 bg-gradient-to-r ${role.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
									<span className="text-3xl">{role.icon}</span>
								</div>
								<h3 className="text-xl font-semibold text-white mb-2 group-hover:text-brand-green transition-colors">
									{role.name}
								</h3>
								<p className="text-white/70 text-sm mb-4">{role.description}</p>
								<div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
									<div className="bg-brand-green text-black px-4 py-2 rounded-md text-sm font-semibold">
										Access Dashboard
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Supply Chain Flow Visualization */}
				<div className="mt-16 bg-[#111] border border-[rgba(34,197,94,0.2)] rounded-xl p-8">
					<h3 className="text-xl font-semibold text-center mb-8">Supply Chain Flow</h3>
					<div className="flex items-center justify-center space-x-4 overflow-x-auto">
						{roles.map((role, index) => (
							<React.Fragment key={role.id}>
								<div className="flex flex-col items-center min-w-[120px]">
									<div className={`w-16 h-16 bg-gradient-to-r ${role.color} rounded-full flex items-center justify-center mb-2 animation-float`} style={{animationDelay: `${index * 0.2}s`}}>
										<span className="text-xl">{role.icon}</span>
									</div>
									<span className="text-xs text-white/70 text-center">{role.name}</span>
								</div>
								{index < roles.length - 1 && (
									<div className="flex items-center">
										<div className="w-8 h-0.5 bg-brand-green"></div>
										<div className="w-0 h-0 border-l-4 border-l-brand-green border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
									</div>
								)}
							</React.Fragment>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminDashboard;

