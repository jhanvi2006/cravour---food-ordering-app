import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function testSignup() {
  const testEmail = `test_${Date.now()}@test.com`
  console.log("Signing up:", testEmail)
  
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: 'password123',
    options: { data: { full_name: 'Test Role', role: 'restaurant_owner' } }
  })
  
  if (error) {
    console.log("Signup error:", error)
    return
  }
  
  console.log("Signup success, user ID:", data.user.id)
  
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: data.user.id,
    full_name: 'Test Role',
    role: 'restaurant_owner'
  })
  
  console.log("Profile Upsert Error:", profileError)
  
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
  console.log("Profile inserted:", profile)
}
testSignup()
