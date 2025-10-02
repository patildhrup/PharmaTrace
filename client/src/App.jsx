import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import SupplierDashboard from './pages/SupplierDashboard'
import DistributorDashboard from './pages/DistributorDashboard'
import TransporterDashboard from './pages/TransporterDashboard'
import RetailerDashboard from './pages/RetailerDashboard'
import PharmacyDashboard from './pages/PharmacyDashboard'
import Login from './pages/Login'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [presetRole, setPresetRole] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogin = (userType) => {
    setUser({ type: userType, name: userType.charAt(0).toUpperCase() + userType.slice(1) })
  }

  const handleLogout = () => {
    setUser(null)
  }

  // Logged-out experience: show simple Home page until user opens Login
  if (!user && !showLogin) {
    return (
      <div className="landing">
        <header className="landing-header">
          <div className="landing-header-inner">
            <div className="brand">
              <div className="brand-mark">PC</div>
              <span className="brand-name">PharmaChain</span>
            </div>
            <nav className="landing-nav">
              <button className="btn-link" onClick={() => setShowLogin(true)}>Login</button>
            </nav>
          </div>
        </header>

        <main className="landing-hero">
          <h1 className="landing-title">A unified platform for the pharma supply chain</h1>
          <p className="landing-sub">Dashboards for Suppliers, Distributors, Transporters, Retailers, and Pharmacies.</p>
          <div className="hero-actions">
            <button className="btn primary" onClick={() => setShowLogin(true)}>Get Started</button>
            <a className="btn secondary" href="#features">Learn More</a>
          </div>

          <div className="landing-roles">
            <h2>Pick your role</h2>
            <div className="landing-roles-grid">
              {[
                { type: 'supplier', label: 'Supplier' },
                { type: 'distributor', label: 'Distributor' },
                { type: 'transporter', label: 'Transporter' },
                { type: 'retailer', label: 'Retailer' },
                { type: 'pharmacy', label: 'Pharmacy' },
              ].map((r) => (
                <button
                  key={r.type}
                  className="role-pill"
                  onClick={() => { setPresetRole(r.type); setShowLogin(true) }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </main>

        <footer className="landing-footer">
          <p>© {new Date().getFullYear()} PharmaChain. All rights reserved.</p>
        </footer>
      </div>
    )
  }

  if (!user && showLogin) {
    return <Login onLogin={handleLogin} initialType={presetRole} />
  }

  return (
    <Router>
      <div className="app">
        <Sidebar isOpen={sidebarOpen} userType={user.type} />
        <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <Header 
            user={user} 
            onLogout={handleLogout}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
          <div className="content">
            <Routes>
              <Route path="/" element={<Navigate to={`/${user.type}`} replace />} />
              <Route path="/supplier" element={<SupplierDashboard />} />
              <Route path="/distributor" element={<DistributorDashboard />} />
              <Route path="/transporter" element={<TransporterDashboard />} />
              <Route path="/retailer" element={<RetailerDashboard />} />
              <Route path="/pharmacy" element={<PharmacyDashboard />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App
