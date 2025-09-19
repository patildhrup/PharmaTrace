import { useState } from 'react'
import { Pill, Users, ShoppingCart, DollarSign, Plus, Search } from 'lucide-react'
import './Dashboard.css'

const PharmacyDashboard = () => {
  const [inventory] = useState([
    { id: 1, product: 'Paracetamol 500mg', supplier: 'City Pharmacy', stock: 45, price: 5.25, category: 'Pain Relief' },
    { id: 2, product: 'Amoxicillin 250mg', supplier: 'HealthMart', stock: 25, price: 11.50, category: 'Antibiotic' },
    { id: 3, product: 'Ibuprofen 400mg', supplier: 'MediStore', stock: 35, price: 6.75, category: 'Anti-inflammatory' },
    { id: 4, product: 'Omeprazole 20mg', supplier: 'City Pharmacy', stock: 20, price: 15.25, category: 'Gastrointestinal' }
  ])

  const [prescriptions] = useState([
    { id: 1, customer: 'John Doe', product: 'Paracetamol 500mg', quantity: 2, status: 'Filled', date: '2024-01-15' },
    { id: 2, customer: 'Jane Smith', product: 'Amoxicillin 250mg', quantity: 1, status: 'Pending', date: '2024-01-15' },
    { id: 3, customer: 'Bob Johnson', product: 'Ibuprofen 400mg', quantity: 1, status: 'Ready', date: '2024-01-14' }
  ])

  const stats = [
    { title: 'Total Products', value: '89', icon: Pill, change: '+5%', color: 'blue' },
    { title: 'Prescriptions', value: '34', icon: ShoppingCart, change: '+18%', color: 'green' },
    { title: 'Customers', value: '156', icon: Users, change: '+8', color: 'purple' },
    { title: 'Revenue', value: '$18,750', icon: DollarSign, change: '+22%', color: 'orange' }
  ]

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Pharmacy Dashboard</h2>
        <button className="add-btn">
          <Plus size={20} />
          New Prescription
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
            <h3>Recent Prescriptions</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Prescription ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((prescription) => (
                  <tr key={prescription.id}>
                    <td>#{prescription.id}</td>
                    <td>{prescription.customer}</td>
                    <td>{prescription.product}</td>
                    <td>{prescription.quantity}</td>
                    <td>
                      <span className={`status-badge ${prescription.status.toLowerCase()}`}>
                        {prescription.status}
                      </span>
                    </td>
                    <td>{prescription.date}</td>
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

export default PharmacyDashboard
