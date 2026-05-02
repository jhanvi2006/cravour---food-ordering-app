import { supabase } from '@/lib/supabase'

export const ownerService = {
  /**
   * Get the restaurant belonging to this owner
   */
  getRestaurant: async (ownerId) => {
    return supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', ownerId)
      .single()
  },

  /**
   * Get recent orders for a restaurant
   */
  getRecentOrders: async (restaurantId, limit = 10) => {
    return supabase
      .from('orders')
      .select(`
        *,
        profiles!inner(full_name, email)
      `)
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
      .limit(limit)
  },

  /**
   * Get menu categories and items
   */
  getMenu: async (restaurantId) => {
    return supabase
      .from('menu_categories')
      .select(`
        *,
        menu_items(*)
      `)
      .eq('restaurant_id', restaurantId)
      .order('sort_order')
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (orderId, status) => {
    return supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
  }
}
