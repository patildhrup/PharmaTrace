import { useState } from 'react'
import { Truck, TrendingUp, Store, DollarSign, Plus, Search } from 'lucide-react'
import './Dashboard.css'

const DistributorDashboard = () => {
  const [inventory] = useState([
    { id: 1, product: 'Paracetamol 500mg', supplier: 'MediPharma', stock: 800, price: 3.25 },
    { id: 2, product: 'Amoxicillin 250mg', supplier: 'HealthCorp', stock: 400, price: 7.50 },
    { id: 3, product: 'Ibuprofen 400mg', supplier: 'MediPharma', stock: 600, price: 4.00 },
    { id: 4, product: 'Omeprazole 20mg', supplier: 'PharmaPlus', stock: 200, price: 11.25 }
  ])

  const [orders] = useState([
    { id: 1, retailer: 'City Pharmacy', product: 'Paracetamol 500mg', quantity: 200, status: 'Processing', date: '2024-01-15' },
    { id: 2, retailer: 'HealthMart', product: 'Amoxicillin 250mg', quantity: 100, status: 'Shipped', date: '2024-01-14' },
    { id: 3, retailer: 'MediStore', product: 'Ibuprofen 400mg', quantity: 150, status: 'Delivered', date: '2024-01-13' }
  ])

  const stats = [
    { title: 'Total Inventory', value: '2,000', icon: Truck, change: '+15%', color: 'blue' },
    { title: 'Active Orders', value: '25', icon: TrendingUp, change: '+8%', color: 'green' },
    { title: 'Retailers', value: '18', icon: Store, change: '+3', color: 'purple' },
    { title: 'Revenue', value: '$28,450', icon: DollarSign, change: '+12%', color: 'orange' }
  ]

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Distributor Dashboard</h2>
        <button className="add-btn">
          <Plus size={20} />
          New Order
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
            <h3>Recent Orders</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Retailer</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.retailer}</td>
                    <td>{order.product}</td>
                    <td>{order.quantity}</td>
                    <td>
                      <span className={`status-badge ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="content-section">
          <div className="section-header">
            <h3>Inventory Management</h3>
            <div className="search-box">
              <Search size={16} />
              <input type="text" placeholder="Search inventory..." />
            </div>
          </div>
          <div className="products-grid">
            {inventory.map((item) => (
              <div key={item.id} className="product-card">
                <div className="product-header">
                  <h4>{item.product}</h4>
                  <span className="product-category">{item.supplier}</span>
                </div>
                <div className="product-details">
                  <div className="product-stock">
                    <span className="stock-label">Stock:</span>
                    <span className="stock-value">{item.stock} units</span>
                  </div>
                  <div className="product-price">
                    <span className="price-label">Price:</span>
                    <span className="price-value">${item.price}</span>
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

export default DistributorDashboard
