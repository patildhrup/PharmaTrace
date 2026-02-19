import React, { useState } from 'react';

const Login: React.FC = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			setError('Please enter a valid email address.');
			return;
		}
		if (password.length < 6) {
			setError('Password must be at least 6 characters.');
			return;
		}
		alert('Logged in (demo). For production, add backend auth + 2FA.');
	};

	return (
		<div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
			<div className="w-full max-w-md bg-[#111] border border-[rgba(34,197,94,0.2)] rounded-xl p-8 shadow-xl">
				<h1 className="text-2xl font-bold mb-6 text-center"><span className="text-brand-green">Secure</span> Login</h1>
				<form onSubmit={onSubmit} className="space-y-5">
					<div>
						<label className="block text-sm mb-2">Email</label>
						<input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 outline-none focus:border-brand-green" placeholder="you@example.com"/>
					</div>
					<div>
						<label className="block text-sm mb-2">Password</label>
						<input value={password} onChange={e=>setPassword(e.target.value)} type="password" className="w-full bg-[#0d0d0d] border border-[rgba(34,197,94,0.25)] rounded-md px-3 py-2 outline-none focus:border-brand-green" placeholder="********"/>
						<div className="text-right mt-2">
							<a href="#" className="text-xs text-brand-green hover:underline">Forgot Password?</a>
						</div>
					</div>
					{error && <div className="text-red-400 text-sm">{error}</div>}
					<button type="submit" className="w-full bg-brand-green text-black rounded-md py-2 font-semibold hover:brightness-110 transition">Login</button>
				</form>
				<div className="mt-4 text-center text-sm">
					<span className="text-white/70">New here?</span> <a className="text-brand-green hover:underline" href="#">Create an account</a>
				</div>
			</div>
		</div>
	);
};

export default Login;

