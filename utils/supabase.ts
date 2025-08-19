import { createClient } from '@supabase/supabase-js'

// Get runtime config for environment variables
const config = useRuntimeConfig()

// Client-side Supabase instance
export const supabase = createClient(
  config.public.supabaseUrl || 'https://gqajwewiebxohfxuihnj.supabase.co',
  config.public.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxYWp3ZXdpZWJ4b2hmeHVpaG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1OTk4MzEsImV4cCI6MjA3MTE3NTgzMX0.ycu9oibffIHaQE2m9inwi6rfypBhWzA5xlmeCClMJgI'
)

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
