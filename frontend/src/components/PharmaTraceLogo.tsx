import React, { useEffect, useRef } from 'react';

const PharmaTraceLogo: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let animationId: number;
		let time = 0;

		const resizeCanvas = () => {
			canvas.width = canvas.offsetWidth * 2;
			canvas.height = canvas.offsetHeight * 2;
			ctx.scale(2, 2);
		};

		const drawLogo = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			
			const centerX = canvas.width / 4;
			const centerY = canvas.height / 4;
			
			// Create gradient background
			const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200);
			gradient.addColorStop(0, 'rgba(34, 197, 94, 0.1)');
			gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.05)');
			gradient.addColorStop(1, 'rgba(139, 92, 246, 0.02)');
			
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, canvas.width / 2, canvas.height / 2);
			
			// Draw animated particles
			for (let i = 0; i < 20; i++) {
				const angle = (time * 0.001 + i * 0.3) % (Math.PI * 2);
				const radius = 50 + Math.sin(time * 0.002 + i) * 30;
				const x = centerX + Math.cos(angle) * radius;
				const y = centerY + Math.sin(angle) * radius;
				
				ctx.beginPath();
				ctx.arc(x, y, 2 + Math.sin(time * 0.003 + i) * 1, 0, Math.PI * 2);
				ctx.fillStyle = `hsl(${(time * 0.1 + i * 18) % 360}, 70%, 60%)`;
				ctx.fill();
			}
			
			// Draw animated circles
			for (let i = 0; i < 3; i++) {
				const radius = 30 + Math.sin(time * 0.002 + i * 2) * 20;
				ctx.beginPath();
				ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
				ctx.strokeStyle = `hsl(${(time * 0.05 + i * 120) % 360}, 80%, 50%)`;
				ctx.lineWidth = 2;
				ctx.stroke();
			}
			
			// Draw floating elements
			const elements = ['💊', '🧬', '⚗️', '🔬', '📊'];
			elements.forEach((element, i) => {
				const angle = (time * 0.001 + i * 1.2) % (Math.PI * 2);
				const radius = 80 + Math.sin(time * 0.001 + i) * 40;
				const x = centerX + Math.cos(angle) * radius;
				const y = centerY + Math.sin(angle) * radius;
				
				ctx.font = '24px Arial';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillStyle = `hsl(${(time * 0.08 + i * 72) % 360}, 70%, 60%)`;
				ctx.fillText(element, x, y);
			});
			
			time += 16;
			animationId = requestAnimationFrame(drawLogo);
		};

		resizeCanvas();
		drawLogo();

		window.addEventListener('resize', resizeCanvas);

		return () => {
			cancelAnimationFrame(animationId);
			window.removeEventListener('resize', resizeCanvas);
		};
	}, []);

	return (
		<div className="relative w-full h-[500px] bg-gradient-to-br from-[#0d0d0d] to-[#111] rounded-2xl border border-[rgba(34,197,94,0.3)] overflow-hidden transform-3d perspective-1000">
			{/* Animated Background Grid */}
			<div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(#22c55e 1px, transparent 1px)', backgroundSize:'20px 20px'}}/>
			
			{/* 3D Canvas Animation */}
			<canvas
				ref={canvasRef}
				className="absolute inset-0 w-full h-full"
				style={{ imageRendering: 'pixelated' }}
			/>
			
			{/* Floating 3D Elements */}
			<div className="absolute top-8 left-8 animation-float transform-3d">
				<div className="w-16 h-20 bg-gradient-to-br from-brand-green/30 to-brand-blue/30 border-2 border-brand-green rounded-xl flex items-center justify-center hover-scale">
					<span className="text-brand-green text-2xl">🧪</span>
				</div>
			</div>
			
			<div className="absolute top-20 right-16 animation-float transform-3d" style={{animationDelay: '0.5s'}}>
				<div className="w-20 h-20 bg-gradient-to-br from-brand-purple/30 to-brand-green/30 border-2 border-brand-purple rounded-2xl flex items-center justify-center hover-scale">
					<span className="text-brand-purple text-3xl">⚗️</span>
				</div>
			</div>
			
			{/* Enhanced Drug Pills Animation */}
			<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
				<div className="flex space-x-3">
					{Array.from({length: 7}).map((_, i) => (
						<div key={i} className="w-8 h-4 bg-gradient-to-r from-brand-green to-brand-blue rounded-full animation-float opacity-90 hover-scale" style={{animationDelay: `${i * 0.2}s`}}></div>
					))}
				</div>
			</div>
			
			{/* Enhanced Quality Control Scanner */}
			<div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 animation-pulseGlow">
				<div className="w-24 h-12 bg-gradient-to-r from-brand-green/40 to-brand-blue/40 border-2 border-brand-green rounded-xl flex items-center justify-center hover-glow">
					<span className="text-brand-green text-lg font-bold">📊 QC Scanner</span>
				</div>
			</div>
			
			{/* Enhanced Floating Molecules */}
			<div className="absolute top-16 left-1/4 w-3 h-3 bg-brand-green rounded-full opacity-80 animate-bounce hover-scale"></div>
			<div className="absolute top-24 right-1/4 w-3 h-3 bg-brand-blue rounded-full opacity-60 animate-bounce hover-scale" style={{animationDelay: '0.3s'}}></div>
			<div className="absolute bottom-24 left-1/3 w-3 h-3 bg-brand-purple rounded-full opacity-70 animate-bounce hover-scale" style={{animationDelay: '0.6s'}}></div>
			<div className="absolute top-1/3 right-1/3 w-3 h-3 bg-brand-orange rounded-full opacity-50 animate-bounce hover-scale" style={{animationDelay: '0.9s'}}></div>
			
			{/* Enhanced Blockchain Chain */}
			<div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
				{Array.from({length: 10}).map((_, i) => (
					<div key={i} className="w-4 h-4 border-2 border-brand-green rounded-full animate-pulse hover-scale" style={{animationDelay: `${i * 0.1}s`}}></div>
				))}
			</div>
			<div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm text-brand-green font-semibold">Blockchain Verification</div>
			
			{/* Enhanced Shimmer Effect */}
			<div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-green/20 to-transparent animation-shimmer"></div>
			
			{/* 3D Hover Effects */}
			<div className="absolute inset-0 bg-gradient-to-br from-transparent via-brand-green/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
			
			{/* PharmaTrace Logo Text */}
			<div className="absolute inset-0 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-6xl font-bold mb-4">
						<span className="gradient-text animation-neonGlow">Pharma</span>
						<span className="text-white ml-4 animation-slideIn" style={{animationDelay: '0.2s'}}>Trace</span>
					</h1>
					<p className="text-xl text-white/70 animation-fadeInUp" style={{animationDelay: '0.4s'}}>
						Advanced Pharmaceutical Supply Chain Management
					</p>
				</div>
			</div>
		</div>
	);
};

export default PharmaTraceLogo;


