import { useState } from 'react'
import { Package, TrendingUp, Users, DollarSign, Plus, Search } from 'lucide-react'
import './Dashboard.css'

const SupplierDashboard = () => {
  const [products] = useState([
    { id: 1, name: 'Paracetamol 500mg', stock: 1500, price: 2.50, category: 'Pain Relief' },
    { id: 2, name: 'Amoxicillin 250mg', stock: 800, price: 5.75, category: 'Antibiotic' },
    { id: 3, name: 'Ibuprofen 400mg', stock: 1200, price: 3.25, category: 'Anti-inflammatory' },
    { id: 4, name: 'Omeprazole 20mg', stock: 600, price: 8.90, category: 'Gastrointestinal' }
  ])

  const [orders] = useState([
    { id: 1, distributor: 'MediDistributors', product: 'Paracetamol 500mg', quantity: 500, status: 'Pending', date: '2024-01-15' },
    { id: 2, distributor: 'HealthSupply Co', product: 'Amoxicillin 250mg', quantity: 200, status: 'Shipped', date: '2024-01-14' },
    { id: 3, distributor: 'PharmaLink', product: 'Ibuprofen 400mg', quantity: 300, status: 'Delivered', date: '2024-01-13' }
  ])

  const stats = [
    { title: 'Total Products', value: '24', icon: Package, change: '+12%', color: 'blue' },
    { title: 'Active Orders', value: '18', icon: TrendingUp, change: '+5%', color: 'green' },
    { title: 'Distributors', value: '12', icon: Users, change: '+2', color: 'purple' },
    { title: 'Revenue', value: '$45,230', icon: DollarSign, change: '+8%', color: 'orange' }
  ]

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Supplier Dashboard</h2>
        <button className="add-btn">
          <Plus size={20} />
          Add Product
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
                  <th>Distributor</th>
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
                    <td>{order.distributor}</td>
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
            <h3>Product Inventory</h3>
            <div className="search-box">
              <Search size={16} />
              <input type="text" placeholder="Search products..." />
            </div>
          </div>
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-header">
                  <h4>{product.name}</h4>
                  <span className="product-category">{product.category}</span>
                </div>
                <div className="product-details">
                  <div className="product-stock">
                    <span className="stock-label">Stock:</span>
                    <span className="stock-value">{product.stock} units</span>
                  </div>
                  <div className="product-price">
                    <span className="price-label">Price:</span>
                    <span className="price-value">${product.price}</span>
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

export default SupplierDashboard
