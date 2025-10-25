import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import RoleDashboard from './pages/RoleDashboard';
import RoleLogin from './pages/RoleLogin';

const App: React.FC = () => {
	return (
		<Router>
			<div className="min-h-screen bg-[#0a0a0a] text-white">
				<Navbar />
				<main>
					<Routes>
						<Route path="/" element={<Landing />} />
						<Route path="/role-login" element={<RoleLogin />} />
						<Route path="/admin-login" element={<AdminLogin />} />
						<Route path="/admin-dashboard" element={<AdminDashboard />} />
						<Route path="/role-dashboard/:roleId" element={<RoleDashboard />} />
						{/* Placeholders for additional routes */}
						<Route path="/features" element={<Landing />} />
						<Route path="/pricing" element={<Landing />} />
						<Route path="/about" element={<Landing />} />
					</Routes>
				</main>
				<Footer />
			</div>
		</Router>
	);
};

export default App;