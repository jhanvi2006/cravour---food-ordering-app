import { supabase } from '@/lib/supabase'

export const goalService = {
  /**
   * Get all active goals for a user
   */
  getUserGoals: async (userId) => {
    return supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
  },

  /**
   * Add or update a user goal
   */
  upsertGoal: async (userId, goalData) => {
    // If goal of this type exists for user, update it. Otherwise insert.
    // First check if it exists:
    const { data: existing } = await supabase
      .from('user_goals')
      .select('id')
      .eq('user_id', userId)
      .eq('goal_type', goalData.goal_type)
      .eq('is_active', true)
      .single()

    if (existing) {
      return supabase
        .from('user_goals')
        .update({ target_value: goalData.target_value, period: goalData.period })
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      return supabase
        .from('user_goals')
        .insert({
          user_id: userId,
          ...goalData,
          is_active: true
        })
        .select()
        .single()
    }
  },

  /**
   * Delete a goal (or mark inactive)
   */
  deleteGoal: async (goalId) => {
    return supabase
      .from('user_goals')
      .delete()
      .eq('id', goalId)
  }
}
