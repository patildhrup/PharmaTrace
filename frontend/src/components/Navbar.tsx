import React from 'react';
import { NavLink } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const linkBase = "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover-lift cursor-pointer relative overflow-hidden";

const Navbar: React.FC = () => {
	const { isDarkMode, toggleTheme } = useTheme();

	return (
		<nav className="border-b backdrop-blur-md glass transition-colors duration-300" style={{
			backgroundColor: isDarkMode ? '#0a0a0a' : '#ffffff',
			borderColor: isDarkMode ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.3)',
		}}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-20">
					<div className="flex items-center">
						<div className="text-brand-green font-extrabold text-3xl tracking-wide  hover-scale cursor-pointer gradient-text">
							<span className="animation-slideIn">Pharma</span>
							<span className="animation-slideIn" style={{animationDelay: '0.2s'}}>Trace</span>
						</div>
					</div>
					<div className="flex items-center space-x-3">
						<NavLink 
							to="/" 
							className={({isActive})=>`${linkBase} cursor-glow ${isActive? 'bg-brand-green text-black shadow-lg':'hover-glow'}`}
							style={({isActive}) => ({
								color: isActive ? '#000000' : isDarkMode ? '#ffffff' : '#1f2937'
							})}
						>
							Home
						</NavLink>
						<NavLink 
							to="/features" 
							className={({isActive})=>`${linkBase} cursor-glow ${isActive? 'bg-brand-green text-black shadow-lg':'hover-glow'}`}
							style={({isActive}) => ({
								color: isActive ? '#000000' : isDarkMode ? '#ffffff' : '#1f2937'
							})}
						>
							Features
						</NavLink>
						<NavLink 
							to="/pricing" 
							className={({isActive})=>`${linkBase} cursor-glow ${isActive? 'bg-brand-green text-black shadow-lg':'hover-glow'}`}
							style={({isActive}) => ({
								color: isActive ? '#000000' : isDarkMode ? '#ffffff' : '#1f2937'
							})}
						>
							Pricing
						</NavLink>
						<NavLink 
							to="/about" 
							className={({isActive})=>`${linkBase} cursor-glow ${isActive? 'bg-brand-green text-black shadow-lg':'hover-glow'}`}
							style={({isActive}) => ({
								color: isActive ? '#000000' : isDarkMode ? '#ffffff' : '#1f2937'
							})}
						>
							About Us
						</NavLink>
						<NavLink 
							to="/role-login" 
							className={({isActive})=>`${linkBase} cursor-glow ${isActive? 'bg-brand-green text-black shadow-lg':'hover-glow'}`}
							style={({isActive}) => ({
								color: isActive ? '#000000' : isDarkMode ? '#ffffff' : '#1f2937'
							})}
						>
							Role Login
						</NavLink>
						<NavLink 
							to="/admin-login" 
							className={({isActive})=>`${linkBase} border-2 border-brand-green cursor-glow ${isActive? 'bg-brand-green text-black shadow-lg':'hover-glow'}`}
							style={({isActive}) => ({
								color: isActive ? '#000000' : '#22c55e'
							})}
						>
							Admin Portal
						</NavLink>
						<button
							onClick={toggleTheme}
							className="px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer hover-glow"
							style={{
								color: isDarkMode ? '#ffffff' : '#1f2937'
							}}
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
