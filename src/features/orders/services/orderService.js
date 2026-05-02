import { supabase } from '@/lib/supabase'

export const orderService = {
  /**
   * Create a new order + its line items in one flow
   */
  create: async ({ orderData, items }) => {
    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) return { data: null, error: orderError }

    // Insert order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      menu_item_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) return { data: order, error: itemsError }

    return { data: order, error: null }
  },

  /**
   * Get all orders for the current user, with restaurant info and line items
   */
  getUserOrders: async (userId) => {
    return supabase
      .from('orders')
      .select(`
        *,
        restaurant:restaurants ( name, image_url ),
        order_items ( 
          *,
          menu_item:menu_items ( calories, protein, carbs, fat )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  },

  /**
   * Get a single order by ID
   */
  getById: async (orderId) => {
    return supabase
      .from('orders')
      .select(`
        *,
        restaurant:restaurants ( name, image_url, address ),
        order_items ( 
          *,
          menu_item:menu_items ( calories, protein, carbs, fat )
        )
      `)
      .eq('id', orderId)
      .single()
  },
}
