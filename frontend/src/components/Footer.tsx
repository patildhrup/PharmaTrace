import React from 'react';

const Footer: React.FC = () => {
	return (
		<footer className="bg-[#0a0a0a] border-t border-[rgba(34,197,94,0.2)]/50 text-white/80">
			<div className="max-w-7xl mx-auto px-4 py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
				<div>
					<h4 className="text-brand-green font-semibold mb-3">PharmaTrace</h4>
					<p className="text-sm">Blockchain-powered pharmaceutical drug tracking and anti-counterfeiting.</p>
				</div>
				<div>
					<h4 className="text-brand-green font-semibold mb-3">Company</h4>
					<ul className="space-y-2 text-sm">
						<li><a href="#" className="hover:text-brand-green">Privacy Policy</a></li>
						<li><a href="#" className="hover:text-brand-green">Terms of Service</a></li>
						<li><a href="#" className="hover:text-brand-green">Support</a></li>
					</ul>
				</div>
				<div>
					<h4 className="text-brand-green font-semibold mb-3">Contact</h4>
					<ul className="space-y-2 text-sm">
						<li>Email: support@pharmatrace.example</li>
						<li>Phone: +1 (555) 123-4567</li>
					</ul>
				</div>
				<div>
					<h4 className="text-brand-green font-semibold mb-3">Follow Us</h4>
					<div className="flex space-x-3 text-sm">
						<a className="hover:text-brand-green" href="#">LinkedIn</a>
						<a className="hover:text-brand-green" href="#">Twitter</a>
						<a className="hover:text-brand-green" href="#">GitHub</a>
					</div>
				</div>
			</div>
			<div className="text-center text-xs text-white/50 pb-6">© {new Date().getFullYear()} PharmaTrace. All rights reserved.</div>
		</footer>
	);
};

export default Footer;



