import { Link, useLocation } from 'react-router-dom'
import { 
  Package, 
  Truck, 
  Store, 
  ShoppingCart, 
  Pill,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react'
import './Sidebar.css'

const Sidebar = ({ isOpen, userType }) => {
  const location = useLocation()

  const getMenuItems = () => {
    const baseItems = [
      { path: `/${userType}`, icon: BarChart3, label: 'Dashboard' },
      { path: `/${userType}/inventory`, icon: Package, label: 'Inventory' },
      { path: `/${userType}/orders`, icon: ShoppingCart, label: 'Orders' },
      { path: `/${userType}/settings`, icon: Settings, label: 'Settings' }
    ]

    switch (userType) {
      case 'supplier':
        return [
          ...baseItems,
          { path: '/supplier/products', icon: Pill, label: 'Products' },
          { path: '/supplier/distributors', icon: Store, label: 'Distributors' }
        ]
      case 'distributor':
        return [
          ...baseItems,
          { path: '/distributor/suppliers', icon: Package, label: 'Suppliers' },
          { path: '/distributor/retailers', icon: Store, label: 'Retailers' }
        ]
      case 'transporter':
        return [
          ...baseItems,
          { path: '/transporter/shipments', icon: Truck, label: 'Shipments' },
          { path: '/transporter/routes', icon: BarChart3, label: 'Routes' }
        ]
      case 'retailer':
        return [
          ...baseItems,
          { path: '/retailer/distributors', icon: Package, label: 'Distributors' },
          { path: '/retailer/pharmacies', icon: Pill, label: 'Pharmacies' }
        ]
      case 'pharmacy':
        return [
          ...baseItems,
          { path: '/pharmacy/retailers', icon: Store, label: 'Retailers' },
          { path: '/pharmacy/customers', icon: ShoppingCart, label: 'Customers' }
        ]
      default:
        return baseItems
    }
  }

  const menuItems = getMenuItems()

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h2>PharmaChain</h2>
        <span className="user-type">{userType.charAt(0).toUpperCase() + userType.slice(1)}</span>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span className="nav-label">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar
