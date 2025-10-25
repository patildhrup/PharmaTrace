import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';

const linkBase = "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover-lift cursor-pointer relative overflow-hidden";

const Navbar: React.FC = () => {
	const [isDarkMode, setIsDarkMode] = useState(true);

	useEffect(() => {
		const savedMode = localStorage.getItem('darkMode');
		if (savedMode !== null) {
			const dark = JSON.parse(savedMode);
			setIsDarkMode(dark);
			applyTheme(dark);
		}
	}, []);

	const applyTheme = (dark: boolean) => {
		if (dark) {
			document.documentElement.classList.add('dark');
			document.documentElement.classList.remove('light');
		} else {
			document.documentElement.classList.add('light');
			document.documentElement.classList.remove('dark');
		}
	};

	const toggleTheme = () => {
		const newMode = !isDarkMode;
		setIsDarkMode(newMode);
		localStorage.setItem('darkMode', JSON.stringify(newMode));
		applyTheme(newMode);
	};

	return (
		<nav className="bg-[#0a0a0a] border-b border-[rgba(34,197,94,0.2)]/50 backdrop-blur-md glass">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-20">
					<div className="flex items-center">
						<div className="text-brand-green font-extrabold text-3xl tracking-wide animation-neonGlow hover-scale cursor-pointer gradient-text">
							<span className="animation-slideIn">Pharma</span>
							<span className="animation-slideIn" style={{animationDelay: '0.2s'}}>Trace</span>
						</div>
					</div>
					<div className="flex items-center space-x-3">
						<NavLink 
							to="/" 
							className={({isActive})=>`${linkBase} cursor-glow ${isActive? 'bg-brand-green text-black shadow-lg':'text-white/90 hover:text-brand-green hover-glow'}`}
						>
							Home
						</NavLink>
						<NavLink 
							to="/features" 
							className={({isActive})=>`${linkBase} cursor-glow ${isActive? 'bg-brand-green text-black shadow-lg':'text-white/90 hover:text-brand-green hover-glow'}`}
						>
							Features
						</NavLink>
						<NavLink 
							to="/pricing" 
							className={({isActive})=>`${linkBase} cursor-glow ${isActive? 'bg-brand-green text-black shadow-lg':'text-white/90 hover:text-brand-green hover-glow'}`}
						>
							Pricing
						</NavLink>
						<NavLink 
							to="/about" 
							className={({isActive})=>`${linkBase} cursor-glow ${isActive? 'bg-brand-green text-black shadow-lg':'text-white/90 hover:text-brand-green hover-glow'}`}
						>
							About Us
						</NavLink>
						<NavLink 
							to="/role-login" 
							className={({isActive})=>`${linkBase} cursor-glow ${isActive? 'bg-brand-green text-black shadow-lg':'text-white/90 hover:text-brand-green hover-glow'}`}
						>
							Role Login
						</NavLink>
						<NavLink 
							to="/admin-login" 
							className={({isActive})=>`${linkBase} border-2 border-brand-green cursor-glow ${isActive? 'bg-brand-green text-black shadow-lg':'text-brand-green hover:bg-brand-green hover:text-black hover-glow'}`}
						>
							Admin Portal
						</NavLink>
						<button
							onClick={toggleTheme}
							className="px-3 py-2 rounded-lg text-white/90 hover:text-brand-green transition-all duration-300 cursor-pointer hover-glow"
							title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
						>
							{isDarkMode ? (
								<Moon className="w-5 h-5" />
							) : (
								<Sun className="w-5 h-5" />
							)}
						</button>
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
