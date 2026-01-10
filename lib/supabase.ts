import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Public client (respects RLS, for client-side)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server client with service role (bypasses RLS, for server-side admin ops)
export function createServerClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Authenticated client (for API routes with user context)
export function createAuthenticatedClient(accessToken: string): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  })
}
