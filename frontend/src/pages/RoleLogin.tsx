import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

interface RoleCredentials {
	id: string;
	name: string;
	icon: string;
	color: string;
	email: string;
	password: string;
	description: string;
}

const RoleLogin: React.FC = () => {
	const { isDarkMode } = useTheme();
	const [selectedRole, setSelectedRole] = useState<string>('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const roles: RoleCredentials[] = [
		{
			id: 'supplier',
			name: 'Supplier',
			icon: '🏭',
			color: 'from-blue-500 to-blue-600',
			email: 'supplier@pharmatrace.com',
			password: 'supplier123',
			description: 'Raw material suppliers and ingredient providers'
		},
		{
			id: 'manufacturer',
			name: 'Manufacturer',
			icon: '⚗️',
			color: 'from-purple-500 to-purple-600',
			email: 'manufacturer@pharmatrace.com',
			password: 'manufacturer123',
			description: 'Drug manufacturing and production facilities'
		},
		{
			id: 'distributor',
			name: 'Distributor',
			icon: '📦',
			color: 'from-orange-500 to-orange-600',
			email: 'distributor@pharmatrace.com',
			password: 'distributor123',
			description: 'Wholesale distributors and regional centers'
		},
		{
			id: 'transport',
			name: 'Transport',
			icon: '🚚',
			color: 'from-yellow-500 to-yellow-600',
			email: 'transport@pharmatrace.com',
			password: 'transport123',
			description: 'Logistics and transportation companies'
		},
		{
			id: 'retailer',
			name: 'Retailer',
			icon: '🏥',
			color: 'from-green-500 to-green-600',
			email: 'retailer@pharmatrace.com',
			password: 'retailer123',
			description: 'Pharmacies, hospitals, and retail outlets'
		}
		,
		{
			id: 'consumer',
			name: 'Consumer',
			icon: '🧑‍⚕️',
			color: 'from-emerald-500 to-teal-600',
			email: 'consumer@pharmatrace.com',
			password: 'consumer123',
			description: 'Patients verifying safety and origin of their drugs'
		}
	];

	const selectedRoleData = roles.find(role => role.id === selectedRole);

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		
		if (!selectedRoleData) {
			setError('Please select a role first');
			return;
		}
		
		if (email === selectedRoleData.email && password === selectedRoleData.password) {
			localStorage.setItem('roleAuth', selectedRole);
			navigate(`/role-dashboard/${selectedRole}`);
		} else {
			setError(`Invalid credentials for ${selectedRoleData.name}. Use: ${selectedRoleData.email} / ${selectedRoleData.password}`);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center px-4 transition-colors duration-300" style={{
			backgroundColor: 'var(--bg-primary)',
			color: 'var(--text-primary)'
		}}>
			<div className="w-full max-w-4xl">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold mb-2"><span className="text-brand-green">Role-Based</span> Login</h1>
					<p className="text-white/70">Select your role and login to access your dashboard</p>
				</div>

				{/* Role Selection */}
				<div className="grid md:grid-cols-5 gap-4 mb-8">
					{roles.map((role) => (
						<div 
							key={role.id}
							onClick={() => {
								setSelectedRole(role.id);
								setEmail(role.email);
								setPassword(role.password);
								setError('');
							}}
							className={`group bg-[#111] border rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
								selectedRole === role.id 
									? 'border-brand-green bg-brand-green/10' 
									: 'border-[rgba(34,197,94,0.2)] hover:border-brand-green'
							}`}
						>
							<div className="text-center">
								<div className={`w-16 h-16 bg-gradient-to-r ${role.color} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
									<span className="text-2xl">{role.icon}</span>
								</div>
								<h3 className="text-lg font-semibold text-white mb-1 group-hover:text-brand-green transition-colors">
									{role.name}
								</h3>
								<p className="text-white/60 text-xs">{role.description}</p>
							</div>
						</div>
					))}
				</div>

				{/* Login Form */}
				{selectedRoleData && (
					<div className="bg-[#111] border border-[rgba(34,197,94,0.2)] rounded-xl p-8 animation-fadeInUp">
						<div className="flex items-center mb-6">
							<div className={`w-12 h-12 bg-gradient-to-r ${selectedRoleData.color} rounded-full flex items-center justify-center mr-4`}>
								<span className="text-xl">{selectedRoleData.icon}</span>
							</div>
							<div>
								<h2 className="text-xl font-semibold">{selectedRoleData.name} Login</h2>
								<p className="text-white/70 text-sm">{selectedRoleData.description}</p>
							</div>
						</div>
						
						<form onSubmit={onSubmit} className="space-y-5">
							<div>
								<label className="block text-sm mb-2">Email</label>
								<input 
									value={email} 
									onChange={e=>setEmail(e.target.value)} 
									type="email" 
									className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors" 
									placeholder={selectedRoleData.email}
								/>
							</div>
							<div>
								<label className="block text-sm mb-2">Password</label>
								<input 
									value={password} 
									onChange={e=>setPassword(e.target.value)} 
									type="password" 
									className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors" 
									placeholder={selectedRoleData.password}
								/>
							</div>
							{error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-md">{error}</div>}
							<button type="submit" className="w-full bg-brand-green text-black rounded-md py-2 font-semibold hover:brightness-110 transition animation-pulseGlow">
								Login to {selectedRoleData.name} Dashboard
							</button>
						</form>
						
					</div>
				)}
			</div>
		</div>
	);
};

export default RoleLogin;

