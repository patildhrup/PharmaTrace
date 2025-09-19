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
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogin = (userType) => {
    setUser({ type: userType, name: userType.charAt(0).toUpperCase() + userType.slice(1) })
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
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
