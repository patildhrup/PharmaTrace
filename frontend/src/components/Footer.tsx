import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Footer: React.FC = () => {
	const { isDarkMode } = useTheme();

	return (
		<footer className="border-t transition-colors duration-300" style={{
			backgroundColor: isDarkMode ? '#0a0a0a' : '#ffffff',
			borderColor: isDarkMode ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.3)',
			color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(31,41,55,0.5)'
		}}>
			<div className="max-w-7xl mx-auto px-4 py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
				<div>
					<h4 className="text-brand-green font-semibold mb-3">PharmaTrace</h4>
					<p className="text-sm" style={{color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(31,41,55,0.7)'}}>Blockchain-powered pharmaceutical drug tracking and anti-counterfeiting.</p>
				</div>
				<div>
					<h4 className="text-brand-green font-semibold mb-3">Company</h4>
					<ul className="space-y-2 text-sm">
						<li><a href="#" className="hover:text-brand-green" style={{color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(31,41,55,0.7)'}}>Privacy Policy</a></li>
						<li><a href="#" className="hover:text-brand-green" style={{color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(31,41,55,0.7)'}}>Terms of Service</a></li>
						<li><a href="#" className="hover:text-brand-green" style={{color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(31,41,55,0.7)'}}>Support</a></li>
					</ul>
				</div>
				<div>
					<h4 className="text-brand-green font-semibold mb-3">Contact</h4>
					<ul className="space-y-2 text-sm" style={{color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(31,41,55,0.7)'}}>
						<li>Email: support@pharmatrace.example</li>
						<li>Phone: +1 (555) 123-4567</li>
					</ul>
				</div>
				<div>
					<h4 className="text-brand-green font-semibold mb-3">Follow Us</h4>
					<div className="flex space-x-3 text-sm">
						<a className="hover:text-brand-green" href="#" style={{color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(31,41,55,0.7)'}}>LinkedIn</a>
						<a className="hover:text-brand-green" href="#" style={{color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(31,41,55,0.7)'}}>Twitter</a>
						<a className="hover:text-brand-green" href="#" style={{color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(31,41,55,0.7)'}}>GitHub</a>
					</div>
				</div>
			</div>
			<div className="text-center text-xs pb-6" style={{color: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(31,41,55,0.3)'}}>© {new Date().getFullYear()} PharmaTrace. All rights reserved.</div>
		</footer>
	);
};

export default Footer;



