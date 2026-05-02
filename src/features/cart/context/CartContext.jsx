import { createContext, useState, useEffect } from 'react'

export const CartContext = createContext(null)

const CART_KEY = 'cravour_cart'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Restaurant lock: cart can only have items from one restaurant
  const [restaurantId, setRestaurantId] = useState(() => {
    try {
      return localStorage.getItem('cravour_cart_restaurant') || null
    } catch {
      return null
    }
  })

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
    if (restaurantId) {
      localStorage.setItem('cravour_cart_restaurant', restaurantId)
    } else {
      localStorage.removeItem('cravour_cart_restaurant')
    }
  }, [items, restaurantId])

  const addItem = (item, restId) => {
    // If adding from a different restaurant, clear the cart first
    if (restaurantId && restaurantId !== restId) {
      setItems([{ ...item, quantity: 1 }])
      setRestaurantId(restId)
      return
    }

    setRestaurantId(restId)
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeItem = (itemId) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== itemId)
      if (updated.length === 0) setRestaurantId(null)
      return updated
    })
  }

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) return removeItem(itemId)
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    )
  }

  const clearCart = () => {
    setItems([])
    setRestaurantId(null)
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        restaurantId,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
