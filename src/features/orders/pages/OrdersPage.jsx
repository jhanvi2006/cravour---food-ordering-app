import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { orderService } from '@/features/orders/services/orderService'
import { formatCurrency, formatDate } from '@/shared/utils/formatters'
import { ORDER_STATUSES } from '@/shared/utils/constants'
import './OrdersPage.css'

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    async function load() {
      setLoading(true)
      const { data, error: err } = await orderService.getUserOrders(user.id)
      if (err) setError(err.message)
      else setOrders(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  if (!user) {
    return (
      <div className="orders__state">
        <p>Please <Link to="/login" style={{ color: 'var(--color-primary)' }}>log in</Link> to view your orders.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="orders__state">
        <div className="orders__spinner" />
        <p>Loading orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="orders__state">
        <p style={{ color: 'var(--color-error)' }}>⚠️ {error}</p>
      </div>
    )
  }

  return (
    <div className="orders">
      <h1 className="orders__title">My Orders</h1>

      {orders.length === 0 ? (
        <div className="orders__empty">
          <span style={{ fontSize: '3rem' }}>📦</span>
          <h2>No orders yet</h2>
          <p>Your order history will appear here after your first order.</p>
          <Link to="/explore" className="orders__explore-btn">Explore Restaurants</Link>
        </div>
      ) : (
        <div className="orders__list">
          {orders.map((order) => {
            const status = ORDER_STATUSES[order.status] || { label: order.status, color: '#888' }
            return (
              <div key={order.id} className="order-card" id={`order-${order.id}`}>
                <div className="order-card__header">
                  <div>
                    <h3 className="order-card__restaurant">
                      {order.restaurant?.name || 'Restaurant'}
                    </h3>
                    <p className="order-card__date">{formatDate(order.created_at)}</p>
                  </div>
                  <span
                    className="order-card__status"
                    style={{ background: `${status.color}20`, color: status.color, borderColor: status.color }}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="order-card__items">
                  {(order.order_items || []).map((item) => (
                    <span key={item.id} className="order-card__item">
                      {item.name} × {item.quantity}
                    </span>
                  ))}
                </div>

                <div className="order-card__footer">
                  <span className="order-card__total">
                    {formatCurrency(order.total)}
                  </span>
                  <span className="order-card__payment">
                    {order.payment_method === 'cod' ? '💵 COD' : '💳 Card'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
