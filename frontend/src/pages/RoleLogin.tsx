import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useWeb3, ROLE_ACCOUNTS } from '../contexts/Web3Context';

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
	const { connectWalletForRole, account, isConnected } = useWeb3();
	const [selectedRole, setSelectedRole] = useState<string>('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [step, setStep] = useState<'credentials' | 'metamask'>('credentials');
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
	];

	const selectedRoleData = roles.find(role => role.id === selectedRole);
	const expectedAddr = selectedRole ? ROLE_ACCOUNTS[selectedRole] : null;

	const truncateAddress = (addr: string) =>
		addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (!selectedRoleData) {
			setError('Please select a role first');
			return;
		}

		if (email === selectedRoleData.email && password === selectedRoleData.password) {
			// Credentials valid — move to MetaMask step
			setStep('metamask');
		} else {
			setError(`Invalid credentials for ${selectedRoleData.name}. Use: ${selectedRoleData.email} / ${selectedRoleData.password}`);
		}
	};

	const onConnectMetaMask = async () => {
		if (!selectedRoleData) return;
		setLoading(true);
		setError('');
		try {
			await connectWalletForRole(selectedRole);
			// Success — save auth and navigate
			localStorage.setItem('roleAuth', selectedRole);
			navigate(`/role-dashboard/${selectedRole}`);
		} catch (err: any) {
			setError(err.message || 'MetaMask connection failed');
		} finally {
			setLoading(false);
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
								setStep('credentials');
							}}
							className={`group bg-[#111] border rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${selectedRole === role.id
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

				{/* Step 1: Credentials Form */}
				{selectedRoleData && step === 'credentials' && (
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
									onChange={e => setEmail(e.target.value)}
									type="email"
									className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors"
									placeholder={selectedRoleData.email}
								/>
							</div>
							<div>
								<label className="block text-sm mb-2">Password</label>
								<input
									value={password}
									onChange={e => setPassword(e.target.value)}
									type="password"
									className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors"
									placeholder={selectedRoleData.password}
								/>
							</div>
							{error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-md">{error}</div>}
							<button type="submit" className="w-full bg-brand-green text-black rounded-md py-2 font-semibold hover:brightness-110 transition animation-pulseGlow">
								Continue →
							</button>
						</form>
					</div>
				)}

				{/* Step 2: MetaMask Connection */}
				{selectedRoleData && step === 'metamask' && (
					<div className="bg-[#111] border border-[rgba(34,197,94,0.2)] rounded-xl p-8 animation-fadeInUp">
						{/* Header */}
						<div className="flex items-center mb-6">
							<div className={`w-12 h-12 bg-gradient-to-r ${selectedRoleData.color} rounded-full flex items-center justify-center mr-4`}>
								<span className="text-xl">{selectedRoleData.icon}</span>
							</div>
							<div>
								<h2 className="text-xl font-semibold">Connect MetaMask</h2>
								<p className="text-white/70 text-sm">Credentials verified ✓ — Now connect your wallet</p>
							</div>
						</div>

						{/* Helper Banner: expected account */}
						{expectedAddr && (
							<div className="mb-6 p-4 rounded-xl border border-brand-green/40 bg-brand-green/5">
								<div className="flex items-start gap-3">
									<span className="text-2xl mt-0.5">🦊</span>
									<div>
										<p className="text-brand-green font-semibold text-sm mb-1">
											Select the <strong>{selectedRoleData.name}</strong> account in MetaMask
										</p>
										<p className="text-white/60 text-xs mb-2">When the MetaMask popup opens, choose this account:</p>
										<div className="flex items-center gap-2 bg-[#0d0d0d] border border-[rgba(34,197,94,0.3)] rounded-lg px-3 py-2">
											<span className="text-xs text-white/40">Expected address:</span>
											<code className="text-brand-green text-xs font-mono break-all">{expectedAddr}</code>
										</div>
										<p className="text-yellow-400/80 text-xs mt-2">
											⚠️ Selecting any other account will result in an error.
										</p>
									</div>
								</div>
							</div>
						)}

						{/* Error */}
						{error && (
							<div className="mb-4 text-red-400 text-sm bg-red-900/20 p-3 rounded-md whitespace-pre-line">
								{error}
							</div>
						)}

						<div className="flex gap-3">
							<button
								onClick={() => { setStep('credentials'); setError(''); }}
								className="flex-1 border border-[rgba(34,197,94,0.3)] text-white rounded-md py-2 font-semibold hover:border-brand-green transition"
							>
								← Back
							</button>
							<button
								onClick={onConnectMetaMask}
								disabled={loading}
								className="flex-[2] bg-brand-green text-black rounded-md py-2 font-semibold hover:brightness-110 transition animation-pulseGlow disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
							>
								{loading ? (
									<>
										<svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
										</svg>
										Waiting for MetaMask...
									</>
								) : (
									<>🦊 Open MetaMask &amp; Connect</>
								)}
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default RoleLogin;
