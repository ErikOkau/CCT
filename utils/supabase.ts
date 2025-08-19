import { createClient } from '@supabase/supabase-js'

// Use runtime config for better Nuxt 3 compatibility
const config = useRuntimeConfig()

const supabaseUrl = config.public.supabaseUrl || process.env.SUPABASE_URL!
const supabaseKey = config.public.supabaseAnonKey || process.env.SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Server-side client for admin operations
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_KEY!
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
