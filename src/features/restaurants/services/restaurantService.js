import { supabase } from '@/lib/supabase'

export const restaurantService = {
  /**
   * Fetch all active restaurants with optional filters + pagination
   */
  getAll: async ({ city, cuisine, search, page = 1, limit = 12 } = {}) => {
    let query = supabase
      .from('restaurants')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (city) query = query.eq('city', city)
    if (cuisine) query = query.contains('cuisine_type', [cuisine])
    if (search) query = query.ilike('name', `%${search}%`)

    return query
  },

  /**
   * Fetch a single restaurant by slug, including its menu categories and items
   */
  getBySlug: async (slug) => {
    return supabase
      .from('restaurants')
      .select(`
        *,
        menu_categories (
          *,
          menu_items (*)
        )
      `)
      .eq('slug', slug)
      .single()
  },

  /**
   * Fetch menu items for the Craving Match Quiz
   */
  getDiscoverItems: async ({ maxPrice } = {}) => {
    let query = supabase
      .from('menu_items')
      .select(`
        *,
        restaurant:restaurants!inner(name, slug)
      `)
      .eq('is_available', true)
      .eq('restaurant.is_active', true)
      
    if (maxPrice) {
      query = query.lte('price', maxPrice)
    }

    // Fetch up to 30 items
    return query.limit(30)
  },
}
