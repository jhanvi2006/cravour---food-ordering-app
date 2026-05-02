import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCart } from '@/features/cart/hooks/useCart'
import { orderService } from '@/features/orders/services/orderService'
import { formatCurrency } from '@/shared/utils/formatters'
import { useToast } from '@/shared/components/Toast'
import './CheckoutPage.css'

export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, subtotal, restaurantId, clearCart } = useCart()
  const navigate = useNavigate()
  const toast = useToast()

  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [pincode, setPincode] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deliveryFee = 30
  const tax = Math.round(subtotal * 0.05 * 100) / 100
  const total = subtotal + deliveryFee + tax

  if (!user) {
    navigate('/login')
    return null
  }

  if (items.length === 0) {
    return (
      <div className="checkout__empty">
        <span style={{ fontSize: '3rem' }}>🛒</span>
        <h2>Your cart is empty</h2>
        <p>Add items from a restaurant before checking out.</p>
      </div>
    )
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!address.trim() || !city.trim() || !pincode.trim()) {
      setError('Please fill in all address fields.')
      return
    }

    setLoading(true)
    setError(null)

    const orderData = {
      user_id: user.id,
      restaurant_id: restaurantId,
      subtotal,
      delivery_fee: deliveryFee,
      tax,
      total,
      payment_method: 'cod',
      payment_status: 'pending',
      delivery_address: {
        address_line: address,
        city,
        pincode,
      },
      notes: notes || null,
    }

    const { data, error: err } = await orderService.create({
      orderData,
      items,
    })

    setLoading(false)

    if (err) {
      setError(err.message)
      toast.error('Failed to place order. Please try again.')
    } else {
      clearCart()
      toast.success('Order placed successfully! 🎉')
      navigate('/orders', { state: { newOrderId: data.id } })
    }
  }

  return (
    <div className="checkout">
      <h1 className="checkout__title">Checkout</h1>

      <div className="checkout__layout">
        {/* Left: Address Form */}
        <form className="checkout__form" onSubmit={handlePlaceOrder}>
          <h2 className="checkout__section-title">Delivery Address</h2>

          {error && <div className="checkout__error">{error}</div>}

          <div className="checkout__field">
            <label htmlFor="checkout-address">Address</label>
            <input
              id="checkout-address"
              type="text"
              placeholder="House/flat number, street, landmark"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="checkout__row">
            <div className="checkout__field">
              <label htmlFor="checkout-city">City</label>
              <input
                id="checkout-city"
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div className="checkout__field">
              <label htmlFor="checkout-pincode">Pincode</label>
              <input
                id="checkout-pincode"
                type="text"
                placeholder="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="checkout__field">
            <label htmlFor="checkout-notes">Order Notes (optional)</label>
            <textarea
              id="checkout-notes"
              placeholder="E.g. ring the bell, no onions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="checkout__payment-badge">
            💵 Cash on Delivery
          </div>

          <button
            type="submit"
            className="checkout__place-btn"
            disabled={loading}
            id="place-order-btn"
          >
            {loading ? 'Placing Order...' : `Place Order • ${formatCurrency(total)}`}
          </button>
        </form>

        {/* Right: Order Summary */}
        <div className="checkout__summary">
          <h2 className="checkout__section-title">Order Summary</h2>

          <div className="checkout__items">
            {items.map((item) => (
              <div key={item.id} className="checkout__item">
                <div>
                  <span className="checkout__item-name">{item.name}</span>
                  <span className="checkout__item-qty">× {item.quantity}</span>
                </div>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="checkout__totals">
            <div className="checkout__total-row">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="checkout__total-row">
              <span>Delivery Fee</span>
              <span>{formatCurrency(deliveryFee)}</span>
            </div>
            <div className="checkout__total-row">
              <span>Tax (5%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="checkout__total-row checkout__total-row--final">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
