import { supabase } from '@/lib/supabase'

export const adminService = {
  getStats: async () => {
    const [
      { count: usersCount },
      { count: restCount },
      { count: ordersCount }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('restaurants').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true })
    ])

    return {
      totalUsers: usersCount || 0,
      totalRestaurants: restCount || 0,
      totalOrders: ordersCount || 0
    }
  },

  getAllRestaurants: async () => {
    return supabase
      .from('restaurants')
      .select('*, profiles:owner_id(full_name)')
      .order('created_at', { ascending: false })
  },

  toggleRestaurantStatus: async (id, isActive) => {
    return supabase
      .from('restaurants')
      .update({ is_active: isActive })
      .eq('id', id)
  }
}
