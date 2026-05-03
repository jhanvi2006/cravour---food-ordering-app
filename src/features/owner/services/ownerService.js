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
      .maybeSingle()
  },

  /**
   * Create a new restaurant
   */
  createRestaurant: async (ownerId, data) => {
    return supabase
      .from('restaurants')
      .insert({
        owner_id: ownerId,
        ...data,
        is_active: false // Admin must approve
      })
      .select()
      .single()
  },

  /**
   * Update restaurant details
   */
  updateRestaurant: async (id, data) => {
    return supabase
      .from('restaurants')
      .update(data)
      .eq('id', id)
      .select()
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
   * Ensure a default category exists and return its ID
   */
  ensureCategoryExists: async (restaurantId) => {
    // Check if any exists
    const { data: existing } = await supabase.from('menu_categories').select('id').eq('restaurant_id', restaurantId).limit(1)
    if (existing && existing.length > 0) return existing[0].id

    // Create a default one
    const { data } = await supabase.from('menu_categories').insert({ restaurant_id: restaurantId, name: 'Menu', sort_order: 1 }).select().single()
    return data?.id
  },

  /**
   * Add a menu item
   */
  addMenuItem: async (itemData) => {
    return supabase.from('menu_items').insert(itemData).select().single()
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
