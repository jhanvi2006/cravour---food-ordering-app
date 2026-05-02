import { supabase } from '@/lib/supabase'

export const profileService = {
  /**
   * Get profile for a given user ID
   */
  get: async (userId) => {
    return supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
  },

  /**
   * Update profile fields (full_name, phone, avatar_url)
   */
  update: async (userId, updates) => {
    return supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
  },

  /**
   * Get all saved addresses for a user
   */
  getAddresses: async (userId) => {
    return supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
  },

  /**
   * Add a new address
   */
  addAddress: async (address) => {
    return supabase
      .from('addresses')
      .insert(address)
      .select()
      .single()
  },

  /**
   * Delete a saved address by ID
   */
  deleteAddress: async (addressId) => {
    return supabase
      .from('addresses')
      .delete()
      .eq('id', addressId)
  },
}
