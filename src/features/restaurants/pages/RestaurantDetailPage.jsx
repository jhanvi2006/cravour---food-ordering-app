import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { restaurantService } from '@/features/restaurants/services/restaurantService'
import { useCart } from '@/features/cart/hooks/useCart'
import { formatCurrency, formatPriceRange } from '@/shared/utils/formatters'
import './RestaurantDetailPage.css'

export default function RestaurantDetailPage() {
  const { slug } = useParams()
  const { addItem, items, restaurantId } = useCart()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error: err } = await restaurantService.getBySlug(slug)
      if (err) setError(err.message)
      else setRestaurant(data)
      setLoading(false)
    }
    load()
  }, [slug])

  // Get quantity of an item already in cart
  const getCartQty = (itemId) => {
    const found = items.find((i) => i.id === itemId)
    return found ? found.quantity : 0
  }

  if (loading) {
    return (
      <div className="detail__state">
        <div className="detail__spinner" />
        <p>Loading restaurant...</p>
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="detail__state">
        <span style={{ fontSize: '3rem' }}>😕</span>
        <p>{error || 'Restaurant not found.'}</p>
      </div>
    )
  }

  const {
    id: restId,
    name,
    cover_url,
    image_url,
    description,
    cuisine_type = [],
    rating,
    total_reviews,
    price_range,
    address,
    avg_delivery_time,
    delivery_fee,
    opens_at,
    closes_at,
    menu_categories = [],
  } = restaurant

  // Sort categories by sort_order
  const sortedCategories = [...menu_categories].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  )

  // Show warning if cart has items from another restaurant
  const hasDifferentCart = restaurantId && restaurantId !== restId && items.length > 0

  return (
    <div className="detail">
      {/* Hero */}
      <div className="detail__hero">
        {(cover_url || image_url) ? (
          <img src={cover_url || image_url} alt={name} className="detail__hero-img" />
        ) : (
          <div className="detail__hero-placeholder">🍽️</div>
        )}
        <div className="detail__hero-overlay" />
      </div>

      {/* Info */}
      <div className="detail__container">
        <div className="detail__info">
          <h1 className="detail__name">{name}</h1>
          {description && <p className="detail__desc">{description}</p>}

          <div className="detail__tags">
            {cuisine_type.map((c) => (
              <span key={c} className="detail__tag">{c}</span>
            ))}
          </div>

          <div className="detail__meta">
            {rating > 0 && (
              <span className="detail__meta-item">⭐ {rating.toFixed(1)} ({total_reviews})</span>
            )}
            <span className="detail__meta-item">{formatPriceRange(price_range || 2)}</span>
            <span className="detail__meta-item">🕐 {avg_delivery_time} min</span>
            <span className="detail__meta-item">
              {delivery_fee > 0 ? `Delivery ${formatCurrency(delivery_fee)}` : '🟢 Free Delivery'}
            </span>
            {address && <span className="detail__meta-item">📍 {address}</span>}
            {opens_at && closes_at && (
              <span className="detail__meta-item">🕰️ {opens_at} – {closes_at}</span>
            )}
          </div>
        </div>

        {/* Cart warning */}
        {hasDifferentCart && (
          <div className="detail__cart-warning">
            ⚠️ Adding items will replace your current cart from another restaurant.
          </div>
        )}

        {/* Menu */}
        <div className="detail__menu">
          <h2 className="detail__menu-title">Menu</h2>

          {sortedCategories.length === 0 && (
            <p className="detail__empty">No menu items available yet.</p>
          )}

          {sortedCategories.map((category) => (
            <div key={category.id} className="detail__category">
              <h3 className="detail__category-name">{category.name}</h3>

              <div className="detail__items">
                {(category.menu_items || [])
                  .filter((item) => item.is_available)
                  .map((item) => {
                    const qty = getCartQty(item.id)
                    return (
                      <div key={item.id} className="menu-item" id={`menu-item-${item.id}`}>
                        <div className="menu-item__info">
                          <div className="menu-item__header">
                            {item.is_veg ? (
                              <span className="menu-item__veg-badge veg">●</span>
                            ) : (
                              <span className="menu-item__veg-badge nonveg">●</span>
                            )}
                            <h4 className="menu-item__name">{item.name}</h4>
                          </div>
                          <p className="menu-item__price">{formatCurrency(item.price)}</p>
                          {item.description && (
                            <p className="menu-item__desc">{item.description}</p>
                          )}
                          {item.tags && item.tags.length > 0 && (
                            <div className="menu-item__tags">
                              {item.tags.map((tag) => (
                                <span key={tag} className="menu-item__tag">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="menu-item__action">
                          {item.image_url && (
                            <img src={item.image_url} alt={item.name} className="menu-item__image" />
                          )}
                          <button
                            className="menu-item__add-btn"
                            onClick={() => addItem({
                              id: item.id,
                              name: item.name,
                              price: Number(item.price),
                              image_url: item.image_url,
                            }, restId)}
                          >
                            {qty > 0 ? `Added (${qty})` : 'Add +'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
