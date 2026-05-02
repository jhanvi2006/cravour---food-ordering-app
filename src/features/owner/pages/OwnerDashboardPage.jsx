import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ownerService } from '../services/ownerService'
import { formatCurrency, formatDate } from '@/shared/utils/formatters'
import { ORDER_STATUSES } from '@/shared/utils/constants'
import { useToast } from '@/shared/components/Toast'
import './OwnerDashboardPage.css'

export default function OwnerDashboardPage() {
  const { user, displayName } = useAuth()
  const toast = useToast()
  
  const [restaurant, setRestaurant] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const { data: restData, error: restError } = await ownerService.getRestaurant(user.id)
        
        if (restError) throw restError
        setRestaurant(restData)
        
        if (restData) {
          const { data: ordersData } = await ownerService.getRecentOrders(restData.id)
          setOrders(ordersData || [])
        }
      } catch (err) {
        console.error("Failed to load owner data:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const handleStatusUpdate = async (orderId, newStatus) => {
    const { error } = await ownerService.updateOrderStatus(orderId, newStatus)
    if (error) {
      toast.error('Failed to update status')
    } else {
      toast.success('Order status updated')
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    }
  }

  if (loading) {
    return (
      <div className="owner-dash__loading">
        <div className="owner-dash__spinner" />
      </div>
    )
  }

  const [setupData, setSetupData] = useState({ name: '', description: '', cuisine: '', city: '' })
  const [setupLoading, setSetupLoading] = useState(false)

  const handleCreateRestaurant = async (e) => {
    e.preventDefault()
    setSetupLoading(true)
    const { data, error } = await ownerService.createRestaurant(user.id, setupData)
    setSetupLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      setRestaurant(data)
      toast.success('Restaurant created! Awaiting admin approval.')
    }
  }

  if (!restaurant) {
    return (
      <div className="owner-dash">
        <div className="owner-dash__welcome" style={{ marginBottom: '2rem' }}>
          <h1 className="owner-dash__greeting">Welcome, <span className="owner-dash__accent">{displayName}</span></h1>
          <p className="owner-dash__sub">Let's set up your new restaurant before you start selling.</p>
        </div>
        
        <form onSubmit={handleCreateRestaurant} style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--color-border)', maxWidth: '600px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Restaurant Name</label>
            <input 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}
              value={setupData.name} onChange={e => setSetupData({...setupData, name: e.target.value})} 
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Cuisine (e.g., Italian, Indian)</label>
            <input 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}
              value={setupData.cuisine} onChange={e => setSetupData({...setupData, cuisine: e.target.value})} 
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>City</label>
            <input 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}
              value={setupData.city} onChange={e => setSetupData({...setupData, city: e.target.value})} 
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Short Description</label>
            <textarea 
              required 
              rows={3}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}
              value={setupData.description} onChange={e => setSetupData({...setupData, description: e.target.value})} 
            />
          </div>
          <button 
            type="submit" 
            disabled={setupLoading}
            style={{ background: 'var(--color-primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
          >
            {setupLoading ? 'Creating...' : 'Create Restaurant'}
          </button>
        </form>
      </div>
    )
  }

  // Calculate today's revenue
  const today = new Date().toDateString()
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today)
  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)

  return (
    <div className="owner-dash">
      <div className="owner-dash__welcome">
        <h1 className="owner-dash__greeting">Dashboard: <span className="owner-dash__accent">{restaurant.name}</span></h1>
        <p className="owner-dash__sub">Manage your restaurant and incoming orders.</p>
      </div>

      <div className="owner-dash__stats">
        <div className="owner-dash__stat-card">
          <span className="owner-dash__stat-icon">📦</span>
          <div>
            <p className="owner-dash__stat-value">{orders.length}</p>
            <p className="owner-dash__stat-label">Recent Orders</p>
          </div>
        </div>
        <div className="owner-dash__stat-card">
          <span className="owner-dash__stat-icon">💰</span>
          <div>
            <p className="owner-dash__stat-value">{formatCurrency(todayRevenue)}</p>
            <p className="owner-dash__stat-label">Today's Revenue</p>
          </div>
        </div>
        <div className="owner-dash__stat-card">
          <span className="owner-dash__stat-icon">⭐</span>
          <div>
            <p className="owner-dash__stat-value">{restaurant.rating || 'N/A'}</p>
            <p className="owner-dash__stat-label">Rating</p>
          </div>
        </div>
      </div>

      <div className="owner-dash__section">
        <h2 className="owner-dash__section-title">Incoming Orders</h2>
        
        {orders.length === 0 ? (
          <div className="owner-dash__empty">No recent orders.</div>
        ) : (
          <div className="owner-dash__orders-grid">
            {orders.map(order => (
              <div key={order.id} className="owner-dash__order-card">
                <div className="owner-dash__order-header">
                  <span className="owner-dash__order-id">#{order.id.slice(0, 8)}</span>
                  <span className="owner-dash__order-date">{formatDate(order.created_at)}</span>
                </div>
                <div className="owner-dash__order-customer">
                  <strong>{order.profiles?.full_name || 'Customer'}</strong>
                  <br/>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                    {order.delivery_address?.address_line}, {order.delivery_address?.city}
                  </span>
                </div>
                <div className="owner-dash__order-footer">
                  <span className="owner-dash__order-total">{formatCurrency(order.total)}</span>
                  <select 
                    className="owner-dash__status-select"
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                  >
                    {Object.entries(ORDER_STATUSES).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
