import { useState } from 'react'
import { Truck, MapPin, Clock, DollarSign, Plus, Search } from 'lucide-react'
import './Dashboard.css'

const TransporterDashboard = () => {
  const [shipments] = useState([
    { id: 1, from: 'MediPharma', to: 'City Pharmacy', status: 'In Transit', distance: '45 km', eta: '2 hours' },
    { id: 2, from: 'HealthCorp', to: 'HealthMart', status: 'Delivered', distance: '32 km', eta: 'Completed' },
    { id: 3, from: 'PharmaPlus', to: 'MediStore', status: 'Scheduled', distance: '67 km', eta: 'Tomorrow' }
  ])

  const [routes] = useState([
    { id: 1, name: 'North Route', stops: 5, distance: '120 km', duration: '4 hours', status: 'Active' },
    { id: 2, name: 'South Route', stops: 3, distance: '85 km', duration: '3 hours', status: 'Active' },
    { id: 3, name: 'East Route', stops: 4, distance: '95 km', duration: '3.5 hours', status: 'Inactive' }
  ])

  const stats = [
    { title: 'Active Shipments', value: '12', icon: Truck, change: '+3', color: 'blue' },
    { title: 'Routes', value: '8', icon: MapPin, change: '+1', color: 'green' },
    { title: 'Avg Delivery Time', value: '3.2h', icon: Clock, change: '-0.5h', color: 'purple' },
    { title: 'Revenue', value: '$15,680', icon: DollarSign, change: '+18%', color: 'orange' }
  ]

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Transporter Dashboard</h2>
        <button className="add-btn">
          <Plus size={20} />
          New Shipment
        </button>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className={`stat-card ${stat.color}`}>
              <div className="stat-icon">
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <h3>{stat.value}</h3>
                <p>{stat.title}</p>
                <span className="stat-change">{stat.change}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="dashboard-content">
        <div className="content-section">
          <div className="section-header">
            <h3>Active Shipments</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Shipment ID</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Distance</th>
                  <th>Status</th>
                  <th>ETA</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td>#{shipment.id}</td>
                    <td>{shipment.from}</td>
                    <td>{shipment.to}</td>
                    <td>{shipment.distance}</td>
                    <td>
                      <span className={`status-badge ${shipment.status.toLowerCase().replace(' ', '-')}`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td>{shipment.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h3>Route Management</h3>
            <div className="search-box">
              <Search size={16} />
              <input type="text" placeholder="Search routes..." />
            </div>
          </div>
          <div className="products-grid">
            {routes.map((route) => (
              <div key={route.id} className="product-card">
                <div className="product-header">
                  <h4>{route.name}</h4>
                  <span className={`product-category ${route.status.toLowerCase()}`}>
                    {route.status}
                  </span>
                </div>
                <div className="product-details">
                  <div className="product-stock">
                    <span className="stock-label">Stops:</span>
                    <span className="stock-value">{route.stops}</span>
                  </div>
                  <div className="product-price">
                    <span className="price-label">Distance:</span>
                    <span className="price-value">{route.distance}</span>
                  </div>
                  <div className="product-duration">
                    <span className="duration-label">Duration:</span>
                    <span className="duration-value">{route.duration}</span>
                  </div>
                </div>
                <button className="product-action-btn">Manage</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransporterDashboard
