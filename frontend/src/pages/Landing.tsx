import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import PharmaTraceLogo from '../components/PharmaTraceLogo';

const Landing: React.FC = () => {
    const { isDarkMode } = useTheme();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

	return (
		<div className="min-h-screen relative overflow-hidden transition-colors duration-300" style={{
			backgroundColor: 'var(--bg-primary)',
			color: 'var(--text-primary)'
		}}>
			{/* Animated Background Particles */}
            <div className="fixed inset-0 pointer-events-none">
                {Array.from({ length: 50 }).map((_, i) => (
					<div
						key={i}
						className="particle"
						style={{
                            left: `calc(${Math.random() * 100}% + ${(mousePosition.x - window.innerWidth / 2) * 0.005}px)`,
                            top: `calc(${Math.random() * 100}% + ${(mousePosition.y - window.innerHeight / 2) * 0.005}px)`,
							animationDelay: `${Math.random() * 8}s`,
							animationDuration: `${6 + Math.random() * 4}s`
						}}
					/>
				))}
			</div>

			{/* Hero */}
			<section className="relative overflow-hidden min-h-screen flex items-center">
				<div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0d0d0d] to-[#111]"/>
				<div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage:'radial-gradient(#22c55e 1px, transparent 1px)', backgroundSize:'24px 24px'}}/>
				
				{/* 3D Floating Elements */}
				<div className="absolute top-20 left-10 animation-float transform-3d perspective-1000">
					<div className="w-16 h-16 bg-gradient-to-br from-brand-green/20 to-brand-blue/20 border border-brand-green/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
						<span className="text-2xl">💊</span>
					</div>
				</div>
				
				<div className="absolute top-32 right-20 animation-floatReverse transform-3d perspective-1000" style={{animationDelay: '1s'}}>
					<div className="w-20 h-20 bg-gradient-to-br from-brand-purple/20 to-brand-green/20 border border-brand-purple/30 rounded-full flex items-center justify-center backdrop-blur-sm">
						<span className="text-3xl">🧬</span>
					</div>
				</div>

				<div className="absolute bottom-32 left-1/4 animation-float transform-3d perspective-1000" style={{animationDelay: '2s'}}>
					<div className="w-12 h-12 bg-gradient-to-br from-brand-orange/20 to-brand-green/20 border border-brand-orange/30 rounded-lg flex items-center justify-center backdrop-blur-sm">
						<span className="text-xl">⚗️</span>
					</div>
				</div>

				<div className="max-w-7xl mx-auto px-4 py-24 relative z-10">
					<div className="grid lg:grid-cols-2 gap-16 items-center">
						<div className="animation-fadeInUp">
							<h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-tight">
								<span className="text-white animation-slideIn block">Revolutionary</span>
								<span className="text-white animation-slideIn block" style={{animationDelay: '0.2s'}}>Pharmaceutical</span>
								<span className="gradient-text animation-slideIn block text-6xl sm:text-8xl" style={{animationDelay: '0.4s'}}>Drug Trace</span>
							</h1>
							<p className="mt-6 text-white/80 text-xl max-w-prose animation-fadeInUp leading-relaxed" style={{animationDelay: '0.6s'}}>
								Advanced blockchain-powered pharmaceutical supply chain tracking with AI-driven analytics, 
								real-time monitoring, and tamper-proof verification from raw materials to patient delivery.
							</p>
							<div className="mt-10 flex flex-col sm:flex-row gap-6 animation-fadeInUp" style={{animationDelay: '0.8s'}}>
								<a href="#features" className="bg-gradient-to-r from-brand-green to-brand-blue text-black px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:brightness-110 transition-all duration-300 animation-pulseGlow hover:scale-105 transform hover-lift text-center">
									🚀 Get Started
								</a>
								<a href="#contact" className="border-2 border-brand-green text-brand-green px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-green hover:text-black transition-all duration-300 hover:scale-105 transform hover-glow text-center">
									📞 Book Demo
								</a>
							</div>
						</div>
						
						<div className="relative animation-fadeInUp" style={{animationDelay: '1s'}}>
							<PharmaTraceLogo />
						</div>
					</div>
				</div>
			</section>

			{/* Features */}
			<section id="features" className="max-w-7xl mx-auto px-4 py-24 relative">
				<div className="text-center mb-16">
					<h2 className="text-5xl font-bold mb-6">
						<span className="gradient-text animation-neonGlow">Advanced</span> 
						<span className="text-white ml-4">Features</span>
					</h2>
					<p className="text-xl text-white/70 max-w-3xl mx-auto">
						Cutting-edge pharmaceutical supply chain technology powered by blockchain, AI, and IoT
					</p>
				</div>
				
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
					{[
						{
							title:'Blockchain Traceability',
							desc:'Immutable ledger for every handover and location update with cryptographic proof.',
							icon:'🔗',
							details:'Track every step from raw materials to final delivery with cryptographic proof and smart contracts.',
							color:'from-brand-green to-brand-blue'
						},
						{
							title:'AI-Powered Analytics',
							desc:'Machine learning algorithms for predictive analytics and anomaly detection.',
							icon:'🤖',
							details:'Advanced AI models predict supply chain disruptions and optimize inventory management.',
							color:'from-brand-purple to-brand-green'
						},
						{
							title:'Anti-Counterfeiting',
							desc:'Verify authenticity via on-chain validation and QR flows with biometric verification.',
							icon:'🛡️',
							details:'Multi-layer verification system prevents fake drugs with blockchain validation and biometric checks.',
							color:'from-brand-orange to-brand-red'
						},
						{
							title:'Supply Demand Management',
							desc:'Intelligent forecasting and inventory optimization for pharmaceutical supply chains.',
							icon:'📈',
							details:'AI-powered demand forecasting and supply optimization to prevent stockouts and overstock situations.',
							color:'from-brand-blue to-brand-purple'
						},
						{
							title:'Smart Contracts',
							desc:'Automated compliance and payment processing with self-executing contracts.',
							icon:'📋',
							details:'Automated compliance checks and payment processing based on predefined conditions.',
							color:'from-brand-green to-brand-orange'
						},
						{
							title:'API Integration',
							desc:'Seamless integration with ERP, WMS, and third-party systems.',
							icon:'🔌',
							details:'RESTful APIs and webhooks for easy integration with existing pharmaceutical systems.',
							color:'from-brand-purple to-brand-blue'
						},
					].map((f,i)=> (
						<div key={i} className="group bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.2)] rounded-2xl p-8 hover:border-brand-green transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-brand-green/20 cursor-pointer hover-lift transform-3d perspective-1000">
							<div className="flex items-center mb-4">
								<div className={`w-16 h-16 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 animation-float`}>
									<span className="text-3xl">{f.icon}</span>
								</div>
								<h3 className="text-xl font-bold text-white group-hover:text-brand-green transition-colors duration-300">{f.title}</h3>
							</div>
							<p className="text-white/70 text-base mb-4 leading-relaxed">{f.desc}</p>
							<div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
								<p className="text-brand-green text-sm font-medium leading-relaxed">{f.details}</p>
							</div>
							<div className="absolute inset-0 bg-gradient-to-br from-transparent via-brand-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
						</div>
					))}
				</div>
			</section>

			{/* Pricing */}
			<section id="pricing" className="bg-gradient-to-br from-[#0d0d0d] to-[#111] py-24">
				<div className="max-w-7xl mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-5xl font-bold mb-6">
							<span className="gradient-text animation-neonGlow">Flexible</span> 
							<span className="text-white ml-4">Pricing</span>
						</h2>
						<p className="text-xl text-white/70 max-w-3xl mx-auto">
							Choose the perfect plan for your pharmaceutical organization
						</p>
					</div>
					
					<div className="grid md:grid-cols-3 gap-8">
						{[
							{
								name: 'Starter',
								price: '$299',
								period: '/month',
								description: 'Perfect for small pharmaceutical companies',
								features: [
									'Up to 1,000 drug batches',
									'Basic blockchain tracking',
									'Standard support',
									'API access',
									'Basic analytics'
								],
								highlight: false
							},
							{
								name: 'Professional',
								price: '$799',
								period: '/month',
								description: 'Ideal for growing pharmaceutical businesses',
								features: [
									'Up to 10,000 drug batches',
									'Advanced AI analytics',
									'Priority support',
									'Custom integrations',
									'Real-time monitoring',
									'IoT sensor integration'
								],
								highlight: true
							},
							{
								name: 'Enterprise',
								price: 'Custom',
								period: '',
								description: 'For large pharmaceutical corporations',
								features: [
									'Unlimited drug batches',
									'Custom blockchain solutions',
									'24/7 dedicated support',
									'White-label options',
									'Advanced security features',
									'Custom development'
								],
								highlight: false
							}
						].map((plan, i) => (
							<div key={i} className={`relative bg-gradient-to-br from-[#111] to-[#0d0d0d] border rounded-2xl p-8 hover-lift transform-3d perspective-1000 ${
								plan.highlight 
									? 'border-brand-green shadow-2xl shadow-brand-green/20 scale-105' 
									: 'border-[rgba(34,197,94,0.2)] hover:border-brand-green'
							}`}>
								{plan.highlight && (
									<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
										<span className="bg-brand-green text-black px-4 py-2 rounded-full text-sm font-bold">Most Popular</span>
									</div>
								)}
								
								<div className="text-center mb-8">
									<h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
									<div className="flex items-baseline justify-center mb-2">
										<span className="text-4xl font-bold text-brand-green">{plan.price}</span>
										<span className="text-white/70 ml-1">{plan.period}</span>
									</div>
									<p className="text-white/70">{plan.description}</p>
								</div>
								
								<ul className="space-y-4 mb-8">
									{plan.features.map((feature, j) => (
										<li key={j} className="flex items-center text-white/80">
											<span className="text-brand-green mr-3">✓</span>
											{feature}
										</li>
									))}
								</ul>
								
								<button className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${
									plan.highlight
										? 'bg-brand-green text-black hover:brightness-110 animation-pulseGlow'
										: 'border-2 border-brand-green text-brand-green hover:bg-brand-green hover:text-black'
								}`}>
									Get Started
								</button>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* About Us */}
			<section id="about" className="max-w-7xl mx-auto px-4 py-24">
				<div className="text-center mb-16">
					<h2 className="text-5xl font-bold mb-6">
						<span className="gradient-text animation-neonGlow">About</span> 
						<span className="text-white ml-4">PharmaTrace</span>
					</h2>
					<p className="text-xl text-white/70 max-w-3xl mx-auto">
						Revolutionizing pharmaceutical supply chains with cutting-edge blockchain technology
					</p>
				</div>
				
				<div className="grid lg:grid-cols-2 gap-16 items-center">
					<div className="animation-fadeInUp">
						<h3 className="text-3xl font-bold text-white mb-6">Our Mission</h3>
						<p className="text-lg text-white/80 mb-6 leading-relaxed">
							We are dedicated to revolutionizing pharmaceutical supply chains through innovative blockchain technology, 
							ensuring drug safety, authenticity, and transparency from manufacturing to patient delivery.
						</p>
						<p className="text-lg text-white/80 mb-8 leading-relaxed">
							Our platform combines advanced AI analytics, IoT integration, and blockchain technology to create 
							the most secure and efficient pharmaceutical tracking system in the industry.
						</p>
						
						<div className="grid grid-cols-2 gap-6">
							<div className="text-center">
								<div className="text-3xl font-bold text-brand-green mb-2">99.9%</div>
								<div className="text-white/70">Accuracy Rate</div>
							</div>
							<div className="text-center">
								<div className="text-3xl font-bold text-brand-green mb-2">24/7</div>
								<div className="text-white/70">Monitoring</div>
							</div>
							<div className="text-center">
								<div className="text-3xl font-bold text-brand-green mb-2">100+</div>
								<div className="text-white/70">Pharma Partners</div>
							</div>
							<div className="text-center">
								<div className="text-3xl font-bold text-brand-green mb-2">5+</div>
								<div className="text-white/70">Years Experience</div>
							</div>
						</div>
					</div>
					
					<div className="animation-fadeInUp" style={{animationDelay: '0.3s'}}>
						<div className="relative">
							<div className="bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.3)] rounded-2xl p-8 hover-lift">
								<div className="text-center mb-6">
									<h4 className="text-2xl font-bold text-white mb-4">Why Choose PharmaTrace?</h4>
								</div>
								
								<div className="space-y-6">
									{[
										{
											icon: '🔒',
											title: 'Bank-Level Security',
											desc: 'Military-grade encryption and blockchain security'
										},
										{
											icon: '⚡',
											title: 'Real-Time Tracking',
											desc: 'Instant updates and notifications across the supply chain'
										},
										{
											icon: '🤖',
											title: 'AI-Powered Insights',
											desc: 'Predictive analytics and intelligent recommendations'
										},
										{
											icon: '🌐',
											title: 'Global Compliance',
											desc: 'Meets international pharmaceutical regulations'
										}
									].map((item, i) => (
										<div key={i} className="flex items-start space-x-4 hover-scale">
											<div className="w-12 h-12 bg-gradient-to-br from-brand-green/20 to-brand-blue/20 rounded-xl flex items-center justify-center">
												<span className="text-2xl">{item.icon}</span>
											</div>
											<div>
												<h5 className="text-lg font-semibold text-white mb-1">{item.title}</h5>
												<p className="text-white/70">{item.desc}</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Social Proof */}
			<section className="bg-[#0d0d0d] border-y border-[rgba(34,197,94,0.2)]">
				<div className="max-w-7xl mx-auto px-4 py-14 grid md:grid-cols-3 gap-6 text-center">
					<div className="text-brand-green text-3xl font-extrabold">+120</div>
					<div className="text-brand-green text-3xl font-extrabold">99.99%</div>
					<div className="text-brand-green text-3xl font-extrabold">24/7</div>
					<p className="text-white/70">Partners onboarded</p>
					<p className="text-white/70">Uptime & integrity</p>
					<p className="text-white/70">Monitoring</p>
				</div>
			</section>

			{/* Contact */}
			<section id="contact" className="max-w-7xl mx-auto px-4 py-16">
				<div className="bg-[#111] border border-[rgba(34,197,94,0.2)] rounded-xl p-8 grid md:grid-cols-2 gap-6">
					<div>
						<h3 className="text-2xl font-bold mb-2">Get in touch</h3>
						<p className="text-white/70">Chat, email, or book a demo with our team.</p>
					</div>
					<div className="grid sm:grid-cols-3 gap-3">
						<a className="bg-brand-green text-black rounded-lg py-3 text-center font-semibold hover:brightness-110" href="#">Live Chat</a>
						<a className="border border-brand-green text-brand-green rounded-lg py-3 text-center font-semibold hover:bg-brand-green hover:text-black" href="#">Email</a>
						<a className="border border-brand-green text-brand-green rounded-lg py-3 text-center font-semibold hover:bg-brand-green hover:text-black" href="#">Book Demo</a>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Landing;
