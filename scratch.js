import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY // Actually we can just fetch via REST or use standard client

async function checkSchema() {
  const res = await fetch(`${supabaseUrl}/rest/v1/profiles?limit=1`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`
    }
  })
  const text = await res.text()
  console.log("Profiles shape:", text)
}
checkSchema()
