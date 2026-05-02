import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { adminService } from '../services/adminService'
import { useToast } from '@/shared/components/Toast'
import './AdminDashboardPage.css'

export default function AdminDashboardPage() {
  const { displayName } = useAuth()
  const toast = useToast()
  
  const [stats, setStats] = useState({ totalUsers: 0, totalRestaurants: 0, totalOrders: 0 })
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, { data: restsData, error }] = await Promise.all([
          adminService.getStats(),
          adminService.getAllRestaurants()
        ])
        
        if (error) throw error
        
        setStats(statsData)
        setRestaurants(restsData || [])
      } catch (err) {
        console.error("Admin load error:", err)
        toast.error('Failed to load admin data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = !currentStatus
    const { error } = await adminService.toggleRestaurantStatus(id, newStatus)
    if (error) {
      toast.error('Failed to update restaurant status')
    } else {
      toast.success(`Restaurant ${newStatus ? 'approved' : 'disabled'}`)
      setRestaurants(prev => prev.map(r => r.id === id ? { ...r, is_active: newStatus } : r))
    }
  }

  if (loading) {
    return (
      <div className="admin-dash__loading">
        <div className="admin-dash__spinner" />
      </div>
    )
  }

  return (
    <div className="admin-dash">
      <div className="admin-dash__welcome">
        <h1 className="admin-dash__greeting">Admin Portal, <span className="admin-dash__accent">{displayName}</span> 👑</h1>
        <p className="admin-dash__sub">Manage Cravour platform settings, users, and restaurants.</p>
      </div>

      <div className="admin-dash__stats">
        <div className="admin-dash__stat-card">
          <span className="admin-dash__stat-icon">👥</span>
          <div>
            <p className="admin-dash__stat-value">{stats.totalUsers}</p>
            <p className="admin-dash__stat-label">Total Users</p>
          </div>
        </div>
        <div className="admin-dash__stat-card">
          <span className="admin-dash__stat-icon">🏪</span>
          <div>
            <p className="admin-dash__stat-value">{stats.totalRestaurants}</p>
            <p className="admin-dash__stat-label">Restaurants</p>
          </div>
        </div>
        <div className="admin-dash__stat-card">
          <span className="admin-dash__stat-icon">📦</span>
          <div>
            <p className="admin-dash__stat-value">{stats.totalOrders}</p>
            <p className="admin-dash__stat-label">Total Orders</p>
          </div>
        </div>
      </div>

      <div className="admin-dash__section">
        <h2 className="admin-dash__section-title">Restaurant Approvals</h2>
        
        {restaurants.length === 0 ? (
          <div className="admin-dash__empty">No restaurants found.</div>
        ) : (
          <div className="admin-dash__table-wrapper">
            <table className="admin-dash__table">
              <thead>
                <tr>
                  <th>Restaurant Name</th>
                  <th>Owner</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map(rest => (
                  <tr key={rest.id}>
                    <td className="admin-dash__font-medium">{rest.name}</td>
                    <td>{rest.profiles?.full_name || 'No Owner'}</td>
                    <td>{rest.city}</td>
                    <td>
                      <span className={`admin-dash__badge ${rest.is_active ? 'admin-dash__badge--active' : 'admin-dash__badge--inactive'}`}>
                        {rest.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={`admin-dash__toggle-btn ${rest.is_active ? 'admin-dash__toggle-btn--danger' : 'admin-dash__toggle-btn--success'}`}
                        onClick={() => handleToggleStatus(rest.id, rest.is_active)}
                      >
                        {rest.is_active ? 'Disable' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
