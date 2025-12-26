import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const AdminLogin: React.FC = () => {
	const { isDarkMode } = useTheme();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		
		// Admin credentials
		if (email === 'admin@pharmatrace.com' && password === 'admin123') {
			localStorage.setItem('adminAuth', 'true');
			navigate('/admin-dashboard');
		} else {
			setError('Invalid admin credentials. Use: admin@pharmatrace.com / admin123');
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center px-4 transition-colors duration-300" style={{
			backgroundColor: 'var(--bg-primary)',
			color: 'var(--text-primary)'
		}}>
			<div className="w-full max-w-md border rounded-xl p-8 shadow-xl transition-colors duration-300" style={{
				backgroundColor: 'var(--bg-secondary)',
				borderColor: isDarkMode ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.3)'
			}}>
				<div className="text-center mb-6">
					<div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4 animation-pulseGlow">
						<span className="text-2xl">🔐</span>
					</div>
					<h1 className="text-2xl font-bold"><span className="text-brand-green">Admin</span> Portal</h1>
					<p className="text-white/70 text-sm mt-2">Access role-based dashboards</p>
				</div>
				
				<form onSubmit={onSubmit} className="space-y-5">
					<div>
						<label className="block text-sm mb-2">Email</label>
						<input 
							value={email} 
							onChange={e=>setEmail(e.target.value)} 
							type="email" 
							className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors" 
							placeholder="admin@pharmatrace.com"
						/>
					</div>
					<div>
						<label className="block text-sm mb-2">Password</label>
						<input 
							value={password} 
							onChange={e=>setPassword(e.target.value)} 
							type="password" 
							className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 outline-none focus:border-brand-green transition-colors" 
							placeholder="admin123"
						/>
					</div>
					{error && <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-md">{error}</div>}
					<button type="submit" className="w-full bg-brand-green text-black rounded-md py-2 font-semibold hover:brightness-110 transition">
						Login to Admin Dashboard
					</button>
				</form>
				
			</div>
		</div>
	);
};

export default AdminLogin;

