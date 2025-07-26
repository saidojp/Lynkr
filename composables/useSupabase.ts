import type { Database } from '../types/database'

// Используем встроенный Supabase от Nuxt с типами
export const useSupabase = () => {
  const supabase = useSupabaseClient<Database>()

  return {
    supabase,
  }
}
