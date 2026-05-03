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
  const [activeTab, setActiveTab] = useState('orders') // 'orders', 'menu', 'settings'

  // Settings State
  const [settingsData, setSettingsData] = useState({})
  const [settingsLoading, setSettingsLoading] = useState(false)

  // Menu State
  const [menuItems, setMenuItems] = useState([])
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', image_url: '', is_veg: true })
  const [menuLoading, setMenuLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const { data: restData, error: restError } = await ownerService.getRestaurant(user.id)
        
        if (restError) throw restError
        setRestaurant(restData)
        
        if (restData) {
          setSettingsData({
            name: restData.name || '',
            description: restData.description || '',
            cuisine_type: restData.cuisine_type || '',
            city: restData.city || '',
            image_url: restData.image_url || ''
          })
          const { data: ordersData } = await ownerService.getRecentOrders(restData.id)
          setOrders(ordersData || [])
          
          const { data: menuData } = await ownerService.getMenu(restData.id)
          const allItems = menuData?.flatMap(c => c.menu_items) || []
          setMenuItems(allItems)
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

  const handleUpdateSettings = async (e) => {
    e.preventDefault()
    setSettingsLoading(true)
    const { data, error } = await ownerService.updateRestaurant(restaurant.id, settingsData)
    setSettingsLoading(false)
    if (error) {
      toast.error('Failed to update settings')
    } else {
      setRestaurant(data)
      toast.success('Restaurant settings updated!')
    }
  }

  const handleAddMenuItem = async (e) => {
    e.preventDefault()
    setMenuLoading(true)
    const categoryId = await ownerService.ensureCategoryExists(restaurant.id)
    const { data, error } = await ownerService.addMenuItem({
      category_id: categoryId,
      ...newItem,
      price: Number(newItem.price),
      is_available: true
    })
    setMenuLoading(false)
    if (error) {
      toast.error('Failed to add menu item')
    } else {
      setMenuItems(prev => [...prev, data])
      setNewItem({ name: '', description: '', price: '', image_url: '', is_veg: true })
      toast.success('Menu item added successfully!')
    }
  }

  // Calculate today's revenue
  const today = new Date().toDateString()
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today)
  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)

  return (
    <div className="owner-dash">
      {!restaurant.is_active && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--color-error)' }}>
          <strong>Awaiting Approval:</strong> Your restaurant is currently hidden from customers. An admin must approve it before you can receive orders. You can still set up your Menu and Settings.
        </div>
      )}

      <div className="owner-dash__welcome">
        <h1 className="owner-dash__greeting">Dashboard: <span className="owner-dash__accent">{restaurant.name}</span></h1>
        <p className="owner-dash__sub">Manage your restaurant, menu, and incoming orders.</p>
      </div>

      <div className="owner-dash__tabs">
        <button className={`owner-dash__tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Orders</button>
        <button className={`owner-dash__tab ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>Menu Management</button>
        <button className={`owner-dash__tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</button>
      </div>

      {activeTab === 'orders' && (
        <>
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
    </>
  )}

      {activeTab === 'menu' && (
        <div className="owner-dash__section">
          <h2 className="owner-dash__section-title">Add Menu Item</h2>
          <form onSubmit={handleAddMenuItem} style={{ display: 'grid', gap: '1rem', maxWidth: '600px', marginBottom: '3rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Item Name</label>
              <input required style={inputStyle} value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="E.g., Margherita Pizza" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
              <textarea required rows={2} style={inputStyle} value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} placeholder="Classic delight with 100% real mozzarella cheese" />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Price (₹)</label>
                <input required type="number" min="0" style={inputStyle} value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} placeholder="299" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Dietary Type</label>
                <select style={inputStyle} value={newItem.is_veg} onChange={e => setNewItem({...newItem, is_veg: e.target.value === 'true'})}>
                  <option value="true">🟢 Veg</option>
                  <option value="false">🔴 Non-Veg</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Image URL (Optional)</label>
              <input style={inputStyle} value={newItem.image_url} onChange={e => setNewItem({...newItem, image_url: e.target.value})} placeholder="https://example.com/pizza.jpg" />
            </div>
            <button type="submit" disabled={menuLoading} style={btnStyle}>
              {menuLoading ? 'Adding...' : 'Add Item'}
            </button>
          </form>

          <h2 className="owner-dash__section-title">Your Menu Items ({menuItems.length})</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {menuItems.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <div>
                  <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                    {item.is_veg ? '🟢' : '🔴'} {item.name}
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{item.description}</p>
                </div>
                <div style={{ fontWeight: 600 }}>{formatCurrency(item.price)}</div>
              </div>
            ))}
            {menuItems.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>No items yet. Add one above!</p>}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="owner-dash__section">
          <h2 className="owner-dash__section-title">Restaurant Settings</h2>
          <form onSubmit={handleUpdateSettings} style={{ display: 'grid', gap: '1rem', maxWidth: '600px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Restaurant Name</label>
              <input required style={inputStyle} value={settingsData.name} onChange={e => setSettingsData({...settingsData, name: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Banner Image URL</label>
              <input style={inputStyle} value={settingsData.image_url} onChange={e => setSettingsData({...settingsData, image_url: e.target.value})} placeholder="https://example.com/banner.jpg" />
              {settingsData.image_url && (
                <img src={settingsData.image_url} alt="Banner Preview" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginTop: '0.5rem' }} />
              )}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Cuisine Type</label>
              <input required style={inputStyle} value={settingsData.cuisine_type} onChange={e => setSettingsData({...settingsData, cuisine_type: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>City</label>
              <input required style={inputStyle} value={settingsData.city} onChange={e => setSettingsData({...settingsData, city: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
              <textarea required rows={4} style={inputStyle} value={settingsData.description} onChange={e => setSettingsData({...settingsData, description: e.target.value})} />
            </div>
            <button type="submit" disabled={settingsLoading} style={btnStyle}>
              {settingsLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }
const btnStyle = { background: 'var(--color-primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }
