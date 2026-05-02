import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { orderService } from '@/features/orders/services/orderService'
import { goalService } from '@/features/profile/services/goalService'
import { formatCurrency, formatDate } from '@/shared/utils/formatters'
import { ORDER_STATUSES } from '@/shared/utils/constants'
import './DashboardPage.css'

export default function DashboardPage() {
  const { user, displayName } = useAuth()
  const [orders, setOrders] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data: orderData } = await orderService.getUserOrders(user.id)
      setOrders(orderData || [])
      
      const { data: goalData } = await goalService.getUserGoals(user.id)
      setGoals(goalData || [])

      setLoading(false)
    }
    load()
  }, [user])

  // Calculate stats from orders
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total || 0), 0)
  const totalOrders = orders.length

  // Monthly spending (current month)
  const now = new Date()
  const thisMonthOrders = orders.filter((o) => {
    const d = new Date(o.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  
  const todayStr = now.toDateString()
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === todayStr)

  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay()) 
  startOfWeek.setHours(0,0,0,0)
  const weekOrders = orders.filter(o => new Date(o.created_at) >= startOfWeek)

  const monthlySpend = thisMonthOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)

  // Calculate nutrition helpers
  const calcNutrition = (orderList) => orderList.reduce((acc, order) => {
    if (!order.order_items) return acc;
    order.order_items.forEach((item) => {
      const qty = item.quantity || 1;
      const macros = item.menu_item || {};
      acc.calories += (macros.calories || 0) * qty;
      acc.protein += (macros.protein || 0) * qty;
      acc.carbs += (macros.carbs || 0) * qty;
      acc.fat += (macros.fat || 0) * qty;
    });
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const monthlyNutrition = calcNutrition(thisMonthOrders);
  const weeklyNutrition = calcNutrition(weekOrders);
  const dailyNutrition = calcNutrition(todayOrders);

  // Points estimate (1 point per ₹10 spent)
  const points = Math.floor(totalSpent / 10)

  // Recent 5 orders
  const recentOrders = orders.slice(0, 5)

  // Greeting based on time
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  if (!user) {
    return (
      <div className="dash__state">
        <p>Please <Link to="/login" style={{ color: 'var(--color-primary)' }}>log in</Link> to view your dashboard.</p>
      </div>
    )
  }

  return (
    <div className="dash">
      {/* Welcome */}
      <div className="dash__welcome">
        <h1 className="dash__greeting">{greeting}, <span className="dash__accent">{displayName.split(' ')[0]}</span> 👋</h1>
        <p className="dash__sub">Here's your Cravour overview</p>
      </div>

      {/* Stats Cards */}
      <div className="dash__stats">
        <div className="dash__stat-card">
          <span className="dash__stat-icon">📦</span>
          <div>
            <p className="dash__stat-value">{totalOrders}</p>
            <p className="dash__stat-label">Total Orders</p>
          </div>
        </div>
        <div className="dash__stat-card">
          <span className="dash__stat-icon">💰</span>
          <div>
            <p className="dash__stat-value">{formatCurrency(totalSpent)}</p>
            <p className="dash__stat-label">All-time Spend</p>
          </div>
        </div>
        <div className="dash__stat-card">
          <span className="dash__stat-icon">📅</span>
          <div>
            <p className="dash__stat-value">{formatCurrency(monthlySpend)}</p>
            <p className="dash__stat-label">This Month</p>
          </div>
        </div>
        <div className="dash__stat-card dash__stat-card--points">
          <span className="dash__stat-icon">⭐</span>
          <div>
            <p className="dash__stat-value">{points}</p>
            <p className="dash__stat-label">Cravour Points</p>
          </div>
        </div>
      </div>

      {/* Nutrition Passport & Goals */}
      <div className="dash__section">
        <div className="dash__section-header">
          <h2 className="dash__section-title">Nutrition Passport</h2>
          <Link to="/profile" className="dash__section-link">Manage Goals →</Link>
        </div>
        
        {goals.length > 0 ? (
          <div className="dash__goals">
            {goals.map(goal => {
              // Map period to correct consumption
              let consumption = 0;
              let unit = goal.goal_type.includes('calorie') ? 'kcal' : 'g';
              let macroKey = goal.goal_type.split('_')[0]; // 'calorie', 'protein', 'carbs', 'fat'
              if (macroKey === 'calorie') macroKey = 'calories';
              
              if (goal.period === 'daily') consumption = dailyNutrition[macroKey];
              if (goal.period === 'weekly') consumption = weeklyNutrition[macroKey];
              if (goal.period === 'monthly') consumption = monthlyNutrition[macroKey];

              let progress = Math.min((consumption / goal.target_value) * 100, 100);
              let isOver = consumption > goal.target_value;
              let barColor = goal.goal_type.includes('protein') 
                ? (progress >= 100 ? 'var(--color-success)' : 'var(--color-primary)') // For protein, higher is better
                : (isOver ? 'var(--color-error)' : 'var(--color-primary)'); // For calories/fat/carbs, lower is better
              
              return (
                <div key={goal.id} className="dash__goal-card">
                  <div className="dash__goal-header">
                    <span className="dash__goal-title">{goal.goal_type.replace('_', ' ').toUpperCase()} ({goal.period})</span>
                    <span className="dash__goal-values">
                      <strong style={{ color: isOver ? 'var(--color-error)' : 'inherit' }}>
                        {Math.round(consumption)}
                      </strong> / {goal.target_value} {unit}
                    </span>
                  </div>
                  <div className="dash__goal-progress-bar">
                    <div 
                      className="dash__goal-progress-fill" 
                      style={{ width: `${progress}%`, backgroundColor: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="dash__nutrition">
            <p className="dash__empty" style={{ gridColumn: '1 / -1', paddingBottom: '1rem' }}>
              No nutrition goals set. Track your monthly intake below or <Link to="/profile" style={{ color: 'var(--color-primary)' }}>set a goal</Link>.
            </p>
            <div className="dash__nutrition-item">
              <span className="dash__nutrition-label">Calories</span>
              <span className="dash__nutrition-value">{Math.round(monthlyNutrition.calories)} kcal</span>
            </div>
            <div className="dash__nutrition-item">
              <span className="dash__nutrition-label">Protein</span>
              <span className="dash__nutrition-value">{Math.round(monthlyNutrition.protein)}g</span>
            </div>
            <div className="dash__nutrition-item">
              <span className="dash__nutrition-label">Carbs</span>
              <span className="dash__nutrition-value">{Math.round(monthlyNutrition.carbs)}g</span>
            </div>
            <div className="dash__nutrition-item">
              <span className="dash__nutrition-label">Fat</span>
              <span className="dash__nutrition-value">{Math.round(monthlyNutrition.fat)}g</span>
            </div>
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="dash__section">
        <div className="dash__section-header">
          <h2 className="dash__section-title">Recent Orders</h2>
          <Link to="/orders" className="dash__section-link">View all →</Link>
        </div>

        {loading ? (
          <div className="dash__loading"><div className="dash__spinner" /></div>
        ) : recentOrders.length === 0 ? (
          <div className="dash__empty-orders">
            <p>No orders yet. <Link to="/explore" style={{ color: 'var(--color-primary)' }}>Start exploring!</Link></p>
          </div>
        ) : (
          <div className="dash__orders">
            {recentOrders.map((order) => {
              const status = ORDER_STATUSES[order.status] || { label: order.status, color: '#888' }
              return (
                <div key={order.id} className="dash__order-row">
                  <div className="dash__order-info">
                    <span className="dash__order-restaurant">{order.restaurant?.name || 'Restaurant'}</span>
                    <span className="dash__order-date">{formatDate(order.created_at)}</span>
                  </div>
                  <div className="dash__order-right">
                    <span className="dash__order-total">{formatCurrency(order.total)}</span>
                    <span
                      className="dash__order-status"
                      style={{ color: status.color }}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="dash__actions">
        <Link to="/explore" className="dash__action-card">
          <span>🍽️</span>
          <span>Order Food</span>
        </Link>
        <Link to="/orders" className="dash__action-card">
          <span>📋</span>
          <span>Order History</span>
        </Link>
        <Link to="/profile" className="dash__action-card">
          <span>👤</span>
          <span>Edit Profile</span>
        </Link>
      </div>
    </div>
  )
}
