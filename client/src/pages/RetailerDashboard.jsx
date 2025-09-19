import { useState } from 'react'
import { Store, TrendingUp, ShoppingCart, DollarSign, Plus, Search } from 'lucide-react'
import './Dashboard.css'

const RetailerDashboard = () => {
  const [inventory] = useState([
    { id: 1, product: 'Paracetamol 500mg', supplier: 'MediDistributors', stock: 150, price: 4.50, category: 'Pain Relief' },
    { id: 2, product: 'Amoxicillin 250mg', supplier: 'HealthSupply Co', stock: 80, price: 9.25, category: 'Antibiotic' },
    { id: 3, product: 'Ibuprofen 400mg', supplier: 'PharmaLink', stock: 120, price: 5.75, category: 'Anti-inflammatory' },
    { id: 4, product: 'Omeprazole 20mg', supplier: 'MediDistributors', stock: 60, price: 13.50, category: 'Gastrointestinal' }
  ])

  const [orders] = useState([
    { id: 1, pharmacy: 'City Pharmacy', product: 'Paracetamol 500mg', quantity: 50, status: 'Processing', date: '2024-01-15' },
    { id: 2, pharmacy: 'HealthMart', product: 'Amoxicillin 250mg', quantity: 30, status: 'Shipped', date: '2024-01-14' },
    { id: 3, pharmacy: 'MediStore', product: 'Ibuprofen 400mg', quantity: 40, status: 'Delivered', date: '2024-01-13' }
  ])

  const stats = [
    { title: 'Total Products', value: '156', icon: Store, change: '+8%', color: 'blue' },
    { title: 'Active Orders', value: '22', icon: TrendingUp, change: '+12%', color: 'green' },
    { title: 'Pharmacies', value: '15', icon: ShoppingCart, change: '+2', color: 'purple' },
    { title: 'Revenue', value: '$32,150', icon: DollarSign, change: '+15%', color: 'orange' }
  ]

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Retailer Dashboard</h2>
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
                  <th>Pharmacy</th>
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
                    <td>{order.pharmacy}</td>
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
            {inventory.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-header">
                  <h4>{product.product}</h4>
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
                  <div className="product-supplier">
                    <span className="supplier-label">Supplier:</span>
                    <span className="supplier-value">{product.supplier}</span>
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

export default RetailerDashboard
