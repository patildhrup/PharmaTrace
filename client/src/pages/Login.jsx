import { useState } from 'react'
import { Package, Truck, Store, ShoppingCart, Pill } from 'lucide-react'
import './Login.css'

const Login = ({ onLogin, initialType }) => {
  const [selectedType, setSelectedType] = useState(initialType || '')

  const userTypes = [
    { type: 'supplier', label: 'Supplier', icon: Package, description: 'Manage pharmaceutical products and supply chain' },
    { type: 'distributor', label: 'Distributor', icon: Truck, description: 'Distribute products to retailers and pharmacies' },
    { type: 'transporter', label: 'Transporter', icon: Truck, description: 'Handle logistics and transportation' },
    { type: 'retailer', label: 'Retailer', icon: Store, description: 'Manage retail operations and inventory' },
    { type: 'pharmacy', label: 'Pharmacy', icon: Pill, description: 'Serve customers and manage prescriptions' }
  ]

  const handleLogin = () => {
    if (selectedType) {
      onLogin(selectedType)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>PharmaChain</h1>
          <p>Select your role to access the dashboard</p>
        </div>
        
        <div className="user-type-selection">
          {userTypes.map((userType) => {
            const Icon = userType.icon
            return (
              <div 
                key={userType.type}
                className={`user-type-card ${selectedType === userType.type ? 'selected' : ''}`}
                onClick={() => setSelectedType(userType.type)}
              >
                <Icon size={32} />
                <h3>{userType.label}</h3>
                <p>{userType.description}</p>
              </div>
            )
          })}
        </div>
        
        <button 
          className="login-btn"
          onClick={handleLogin}
          disabled={!selectedType}
        >
          Access Dashboard
        </button>
      </div>
    </div>
  )
}

export default Login
