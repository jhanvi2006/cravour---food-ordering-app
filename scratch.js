import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function checkSchema() {
  const { data, error } = await supabase.from('profiles').insert({
    id: '00000000-0000-0000-0000-000000000000',
    full_name: 'Test',
    role: 'restaurant_owner'
  })
  console.log("Error details:", error)
}
checkSchema()
