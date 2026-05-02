import { useContext } from 'react'
import { CartContext } from '@/features/cart/context/CartContext'

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
