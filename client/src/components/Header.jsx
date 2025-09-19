import { Menu, Bell, User } from 'lucide-react'
import './Header.css'

const Header = ({ user, onLogout, onToggleSidebar }) => {
  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onToggleSidebar}>
          <Menu size={24} />
        </button>
        <h1>Welcome, {user.name}</h1>
      </div>
      
      <div className="header-right">
        <button className="notification-btn">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>
        
        <div className="user-menu">
          <button className="user-btn">
            <User size={20} />
            <span>{user.name}</span>
          </button>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
