import { createClient } from '@supabase/supabase-js'

export const useSupabase = () => {
  const config = useRuntimeConfig()

  const supabaseUrl =
    (config.public.supabaseUrl as string) || 'https://eqmketwfpyowaysbhhqg.supabase.co'
  const supabaseKey =
    (config.public.supabaseAnonKey as string) ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxbWtldHdmcHlvd2F5c2JoaHFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NTExNDMsImV4cCI6MjA2ODMyNzE0M30.UDBGvaAP6dt8WwdmABBUOqYstzorPkI42khBrARc53o'

  const supabase = createClient(supabaseUrl, supabaseKey)

  return {
    supabase,
  }
}
