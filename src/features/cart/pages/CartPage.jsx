import { Link } from 'react-router-dom'
import { useCart } from '@/features/cart/hooks/useCart'
import { formatCurrency } from '@/shared/utils/formatters'
import './CartPage.css'

export default function CartPage() {
  const { items, subtotal, totalItems, removeItem, updateQuantity, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="cart__empty">
        <span className="cart__empty-icon">🛒</span>
        <h2>Your cart is empty</h2>
        <p>Add items from a restaurant to get started.</p>
        <Link to="/explore" className="cart__empty-cta">
          Explore Restaurants
        </Link>
      </div>
    )
  }

  return (
    <div className="cart">
      <div className="cart__header">
        <h1 className="cart__title">Your Cart ({totalItems})</h1>
        <button onClick={clearCart} className="cart__clear-btn">
          Clear all
        </button>
      </div>

      <div className="cart__items">
        {items.map((item) => (
          <div key={item.id} className="cart__item">
            <div>
              <p className="cart__item-name">{item.name}</p>
              <p className="cart__item-price">{formatCurrency(item.price)} each</p>
            </div>
            <div className="cart__item-controls">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="cart__qty-btn"
              >
                −
              </button>
              <span className="cart__qty-value">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="cart__qty-btn"
              >
                +
              </button>
              <button
                onClick={() => removeItem(item.id)}
                className="cart__remove-btn"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart__summary">
        <span className="cart__summary-label">Subtotal</span>
        <span className="cart__summary-value">{formatCurrency(subtotal)}</span>
      </div>

      <Link to="/checkout" id="proceed-checkout" className="cart__checkout-btn">
        Proceed to Checkout →
      </Link>
    </div>
  )
}
