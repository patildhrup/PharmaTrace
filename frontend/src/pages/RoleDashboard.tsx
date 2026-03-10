import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Moon, Sun, Bell } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useWeb3, ROLE_ACCOUNTS } from '../contexts/Web3Context';
import ManufacturerForm from '../components/ManufacturerForm';
import SupplierForm from '../components/SupplierForm';
import DistributorForm from '../components/DistributorForm';
import TransportForm from '../components/TransportForm';
import RetailerForm from '../components/RetailerForm';
import ConsumerForm from '../components/ConsumerForm';
import RecentTasks from '../components/RecentTasks';
import NotificationPanel from '../components/NotificationPanel';
import { getRoleStats, getRoleActivities } from '../services/api';

interface RoleData {
	id: string;
	name: string;
	icon: string;
	color: string;
	stats: { label: string; value: string; change: string }[];
	recentActivities: { id: string; action: string; timestamp: string; status: string }[];
}

const RoleDashboard: React.FC = () => {
	const { isDarkMode } = useTheme();
	const { account, isConnected, connectWalletForRole } = useWeb3();
	const { roleId } = useParams<{ roleId: string }>();
	const navigate = useNavigate();
	const [roleData, setRoleData] = useState<RoleData | null>(null);
	const [activeTab, setActiveTab] = useState<'dashboard' | 'form' | 'activities'>('dashboard');
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const [switchingAccount, setSwitchingAccount] = useState(false);
	const [isNotifOpen, setIsNotifOpen] = useState(false);
	const [prefillBatch, setPrefillBatch] = useState<string | null>(null);
	const [prefillLocation, setPrefillLocation] = useState<string | null>(null);
	const [prefillEntity, setPrefillEntity] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const handleAcceptPickup = (batch: string, location: string, entity: string) => {
		setPrefillBatch(batch);
		setPrefillLocation(location);
		setPrefillEntity(entity);
		setActiveTab('form');
	};

	const expectedAddress = roleId ? ROLE_ACCOUNTS[roleId] : null;
	const isWrongAccount = isConnected && account && expectedAddress
		? account.toLowerCase() !== expectedAddress.toLowerCase()
		: false;
	const isNotConnected = !isConnected || !account;

	const truncateAddress = (addr: string) =>
		addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

	const handleSwitchAccount = useCallback(async () => {
		if (!roleId) return;
		setSwitchingAccount(true);
		try {
			await connectWalletForRole(roleId);
		} catch (err: any) {
			console.warn('Account switch error:', err.message);
		} finally {
			setSwitchingAccount(false);
		}
	}, [roleId, connectWalletForRole]);

	useEffect(() => {
		const onMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
		window.addEventListener('mousemove', onMove);
		return () => window.removeEventListener('mousemove', onMove);
	}, []);

	useEffect(() => {
		if (!localStorage.getItem('adminAuth') && !localStorage.getItem('roleAuth')) {
			navigate('/admin-login');
			return;
		}

		const fetchRoleData = async () => {
			setIsLoading(true);

			// Base configurations for roles
			const baseConfig: Record<string, Partial<RoleData>> = {
				supplier: { id: 'supplier', name: 'Supplier Dashboard', icon: '🏭', color: 'from-blue-500 to-blue-600' },
				manufacturer: { id: 'manufacturer', name: 'Manufacturer Dashboard', icon: '⚗️', color: 'from-purple-500 to-purple-600' },
				distributor: { id: 'distributor', name: 'Distributor Dashboard', icon: '📦', color: 'from-orange-500 to-orange-600' },
				transport: { id: 'transport', name: 'Transport Dashboard', icon: '🚚', color: 'from-yellow-500 to-yellow-600' },
				retailer: { id: 'retailer', name: 'Retailer Dashboard', icon: '🏥', color: 'from-green-500 to-green-600' },
				consumer: { id: 'consumer', name: 'Consumer Dashboard', icon: '🧑\u200d⚕️', color: 'from-emerald-500 to-teal-600' }
			};

			const config = baseConfig[roleId || ''];
			if (!config) {
				setIsLoading(false);
				return;
			}

			try {
				let stats = [];
				let recentActivities = [];

				if (account && roleId) {
					const statsResponse = await getRoleStats(roleId, account);
					const activitiesResponse = await getRoleActivities(roleId, account);

					stats = statsResponse.stats || [];
					recentActivities = activitiesResponse.activities || [];
				}

				// Fallback stats if API fails or no account
				if (stats.length === 0) {
					stats = [
						{ label: 'Active Tasks', value: '0', change: '0%' },
						{ label: 'Items Processed', value: '0', change: '0%' },
						{ label: 'Success Rate', value: '0%', change: '0%' },
						{ label: 'Pending', value: '0', change: '0' }
					];
				}

				setRoleData({
					...(config as RoleData),
					stats,
					recentActivities
				});
			} catch (error) {
				console.error("Failed to fetch dashboard data:", error);

				// Fallback state on error
				setRoleData({
					...(config as RoleData),
					stats: [
						{ label: 'Data Unavailable', value: '-', change: '' },
						{ label: 'Please connect', value: '-', change: '' },
						{ label: 'or switch', value: '-', change: '' },
						{ label: 'accounts', value: '-', change: '' }
					],
					recentActivities: []
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchRoleData();
	}, [roleId, account, navigate]);

	if (isLoading || !roleData) {
		return <div className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{
			backgroundColor: 'var(--bg-primary)',
			color: 'var(--text-primary)'
		}}>Loading...</div>;
	}

	return (
		<div className="min-h-screen relative overflow-hidden transition-colors duration-300" style={{
			backgroundColor: 'var(--bg-primary)',
			color: 'var(--text-primary)'
		}}>
			{/* Animated Background Particles */}
			<div className="fixed inset-0 pointer-events-none">
				{Array.from({ length: 30 }).map((_, i) => (
					<div
						key={i}
						className="particle"
						style={{
							left: `calc(${Math.random() * 100}% + ${(mousePosition.x - window.innerWidth / 2) * 0.004}px)`,
							top: `calc(${Math.random() * 100}% + ${(mousePosition.y - window.innerHeight / 2) * 0.004}px)`,
							animationDelay: `${Math.random() * 8}s`,
							animationDuration: `${6 + Math.random() * 4}s`
						}}
					/>
				))}
			</div>

			{/* Animated Background Grid */}
			<div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#22c55e 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

			{/* Floating 3D Elements */}
			<div className="absolute top-20 left-10 animation-float transform-3d perspective-1000">
				<div className="w-12 h-12 bg-gradient-to-br from-brand-green/20 to-brand-blue/20 border border-brand-green/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
					<span className="text-xl">💊</span>
				</div>
			</div>

			<div className="absolute top-32 right-20 animation-floatReverse transform-3d perspective-1000" style={{ animationDelay: '1s' }}>
				<div className="w-16 h-16 bg-gradient-to-br from-brand-purple/20 to-brand-green/20 border border-brand-purple/30 rounded-full flex items-center justify-center backdrop-blur-sm">
					<span className="text-2xl">🧬</span>
				</div>
			</div>

			<div className="absolute bottom-32 left-1/4 animation-float transform-3d perspective-1000" style={{ animationDelay: '2s' }}>
				<div className="w-10 h-10 bg-gradient-to-br from-brand-orange/20 to-brand-green/20 border border-brand-orange/30 rounded-lg flex items-center justify-center backdrop-blur-sm">
					<span className="text-lg">⚗️</span>
				</div>
			</div>
			{/* Header */}
			<div className="bg-[#111] border-b border-[rgba(34,197,94,0.2)] relative z-40">
				<div className="max-w-7xl mx-auto px-4 py-6">
					<div className="flex justify-between items-center">
						<div className="flex items-center">

							<div className={`w-12 h-12 bg-gradient-to-r ${roleData.color} rounded-full flex items-center justify-center mr-4`}>
								<span className="text-xl">{roleData.icon}</span>
							</div>
							<div>
								<h1 className="text-2xl font-bold">{roleData.name}</h1>
								<p className="text-white/70">Real-time monitoring and management</p>
							</div>
						</div>
						{/* Wallet Badge */}
						<div className="flex items-center gap-4">
							{/* Notification Button */}
							<div className="relative">
								<button
									onClick={() => setIsNotifOpen(!isNotifOpen)}
									className={`p-2 rounded-full border border-white/10 transition-all duration-300 hover-lift ${isNotifOpen
										? 'bg-brand-green text-black border-brand-green shadow-[0_0_15px_rgba(34,197,94,0.4)]'
										: 'bg-white/5 text-white/70 hover:text-brand-green hover:border-brand-green/30 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]'
										}`}
									title="Notifications"
								>
									<Bell className="w-5 h-5" />
								</button>

								<NotificationPanel
									role={roleId || ''}
									isOpen={isNotifOpen}
									onClose={() => setIsNotifOpen(false)}
									onAcceptPickup={handleAcceptPickup}
								/>
							</div>

							{isConnected && account ? (
								<div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono ${isWrongAccount
									? 'border-red-500/50 bg-red-900/20 text-red-400'
									: 'border-brand-green/40 bg-brand-green/10 text-brand-green'
									}`}>
									<span className={`w-2 h-2 rounded-full ${isWrongAccount ? 'bg-red-500' : 'bg-brand-green'}`}></span>
									{truncateAddress(account)}
								</div>
							) : (
								<div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-yellow-500/40 bg-yellow-900/20 text-yellow-400 text-xs">
									<span className="w-2 h-2 rounded-full bg-yellow-400"></span>
									Not Connected
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* MetaMask Mismatch / Not Connected Warning Banner */}
			{
				(isWrongAccount || isNotConnected) && (
					<div className="relative z-10 border-b border-red-500/30 bg-red-900/10">
						<div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
							<div className="flex items-start gap-3">
								<span className="text-xl mt-0.5">🦊</span>
								<div>
									{isNotConnected ? (
										<p className="text-yellow-400 font-semibold text-sm">Wallet not connected</p>
									) : (
										<p className="text-red-400 font-semibold text-sm">Wrong MetaMask account connected</p>
									)}
									{expectedAddress && (
										<p className="text-white/50 text-xs mt-0.5">
											Expected: <code className="text-brand-green font-mono">{truncateAddress(expectedAddress)}</code>
											<span className="ml-2 text-white/30 font-mono text-[10px]">{expectedAddress}</span>
										</p>
									)}
								</div>
							</div>
							<button
								onClick={handleSwitchAccount}
								disabled={switchingAccount}
								className="shrink-0 bg-brand-green text-black text-xs font-bold px-4 py-1.5 rounded-full hover:brightness-110 transition disabled:opacity-60"
							>
								{switchingAccount ? 'Switching...' : '🔄 Switch Account'}
							</button>
						</div>
					</div>
				)
			}

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
				{/* Enhanced Tab Navigation */}
				<div className="flex space-x-4 mb-8">
					<button
						onClick={() => setActiveTab('dashboard')}
						className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover-lift ${activeTab === 'dashboard'
							? 'bg-gradient-to-r from-brand-green to-brand-blue text-black shadow-lg'
							: 'bg-gradient-to-r from-[#111] to-[#0d0d0d] text-white border-2 border-[rgba(34,197,94,0.2)] hover:border-brand-green hover:shadow-lg hover:shadow-brand-green/20'
							}`}
					>
						📊 Dashboard
					</button>
					<button
						onClick={() => setActiveTab('form')}
						className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover-lift ${activeTab === 'form'
							? 'bg-gradient-to-r from-brand-green to-brand-blue text-black shadow-lg'
							: 'bg-gradient-to-r from-[#111] to-[#0d0d0d] text-white border-2 border-[rgba(34,197,94,0.2)] hover:border-brand-green hover:shadow-lg hover:shadow-brand-green/20'
							}`}
					>
						{roleData?.id === 'manufacturer' ? '💊 Add Drug' :
							roleData?.id === 'supplier' ? '🏭 Add Raw Material' :
								roleData?.id === 'distributor' ? '📦 Add Distribution' :
									roleData?.id === 'transport' ? '🚚 Add Shipment' :
										roleData?.id === 'retailer' ? '🏥 Add Sale' :
											roleData?.id === 'consumer' ? '🧑\u200d⚕️ Verify Product' : '➕ Add Item'}
					</button>
					<button
						onClick={() => setActiveTab('activities')}
						className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover-lift ${activeTab === 'activities'
							? 'bg-gradient-to-r from-brand-green to-brand-blue text-black shadow-lg'
							: 'bg-gradient-to-r from-[#111] to-[#0d0d0d] text-white border-2 border-[rgba(34,197,94,0.2)] hover:border-brand-green hover:shadow-lg hover:shadow-brand-green/20'
							}`}
					>
						📋 Recent Activities
					</button>
				</div>

				{/* Form Content */}
				{activeTab === 'form' && (
					<div className="mb-8 animation-fadeInUp">
						{roleData?.id === 'manufacturer' && <ManufacturerForm />}
						{roleData?.id === 'supplier' && <SupplierForm />}
						{roleData?.id === 'distributor' && <DistributorForm />}
						{roleData?.id === 'transport' && (
							<TransportForm
								prefilledBatch={prefillBatch}
								prefilledLocation={prefillLocation}
								prefilledEntity={prefillEntity}
							/>
						)}
						{roleData?.id === 'retailer' && <RetailerForm />}
						{roleData?.id === 'consumer' && <ConsumerForm />}
					</div>
				)}

				{/* Activities Content */}
				{activeTab === 'activities' && (
					<div className="mb-8 animation-fadeInUp">
						<RecentTasks />
					</div>
				)}

				{/* Dashboard Content */}
				{activeTab === 'dashboard' && (
					<>
						{/* Enhanced Stats Grid */}
						<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
							{roleData.stats.map((stat, index) => (
								<div key={index} className="group bg-gradient-to-br from-[#111] to-[#0d0d0d] border border-[rgba(34,197,94,0.2)] rounded-2xl p-6 hover:border-brand-green transition-all duration-300 hover-lift hover:shadow-2xl hover:shadow-brand-green/20 transform-3d perspective-1000">
									<div className="flex justify-between items-start mb-4">
										<h3 className="text-white/70 text-sm font-semibold group-hover:text-brand-green transition-colors duration-300">{stat.label}</h3>
										<span className="text-brand-green text-xs font-bold bg-brand-green/20 px-2 py-1 rounded-full">{stat.change}</span>
									</div>
									<p className="text-3xl font-bold text-white group-hover:text-brand-green transition-colors duration-300 animation-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>{stat.value}</p>
									<div className="mt-4 h-1 bg-gradient-to-r from-brand-green to-brand-blue rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
								</div>
							))}
						</div>

						{/* Recent Activities */}
						<div className="bg-[#111] border border-[rgba(34,197,94,0.2)] rounded-xl p-6">
							<h2 className="text-xl font-semibold mb-6">Recent Activities</h2>
							<div className="space-y-4">
								{roleData.recentActivities.map((activity) => (
									<div key={activity.id} className="flex items-center justify-between p-4 bg-[#0d0d0d] rounded-lg hover:bg-[#141414] transition-colors">
										<div className="flex items-center">
											<div className={`w-3 h-3 rounded-full mr-4 ${activity.status === 'completed' ? 'bg-brand-green' :
												activity.status === 'in-progress' ? 'bg-yellow-500' :
													'bg-red-500'
												}`}></div>
											<div>
												<p className="text-white font-medium">{activity.action}</p>
												<p className="text-white/50 text-sm">{activity.timestamp}</p>
											</div>
										</div>
										<span className={`px-3 py-1 rounded-full text-xs font-semibold ${activity.status === 'completed' ? 'bg-brand-green text-black' :
											activity.status === 'in-progress' ? 'bg-yellow-500 text-black' :
												'bg-red-500 text-white'
											}`}>
											{activity.status}
										</span>
									</div>
								))}
							</div>
						</div>
					</>
				)}
			</div>
		</div >
	);
};

export default RoleDashboard;
