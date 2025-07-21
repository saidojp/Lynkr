// composables/useCollections.ts
import { ref, computed } from 'vue'
import type { Collection, Database } from '~/types'
import { useCollectionsStore } from '~/stores/collections'

// Временно используем прямой Supabase клиент с типизацией
import { createClient } from '@supabase/supabase-js'

export function useCollections() {
  const config = useRuntimeConfig()
  const supabase = createClient<Database>(config.public.supabase.url, config.public.supabase.key)

  const store = useCollectionsStore()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed значения
  const collections = computed(() => store.collections)
  const collectionsTree = computed(() => store.collectionsTree)

  // Базовые CRUD операции
  async function fetchCollections() {
    try {
      isLoading.value = true
      error.value = null

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Пользователь не найден')
      }

      const { data, error: supabaseError } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true })

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      store.setCollections(data || [])
    } catch (err) {
      console.error('Ошибка загрузки коллекций:', err)
      error.value = err instanceof Error ? err.message : 'Неизвестная ошибка'
      // Для отладки используем моковые данные
      store.loadMockData()
    } finally {
      isLoading.value = false
    }
  }

  async function createCollection(data: {
    name: string
    description?: string
    color?: string
    icon?: string
    parent_id?: string
  }) {
    try {
      isLoading.value = true
      error.value = null

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Пользователь не найден')
      }

      // Получаем следующую позицию
      const { count } = await supabase
        .from('collections')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('parent_id', data.parent_id || null)

      const position = (count || 0) + 1

      const newCollection: Database['public']['Tables']['collections']['Insert'] = {
        name: data.name,
        description: data.description || null,
        color: data.color || '#3b82f6',
        icon: data.icon || 'folder',
        parent_id: data.parent_id || null,
        position,
        user_id: user.id,
        is_public: false,
        is_favorite: false,
        default_sort: 'manual',
        default_view: 'grid',
      }

      const { data: result, error: supabaseError } = await supabase
        .from('collections')
        .insert([newCollection])
        .select()
        .single()

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      store.addCollection(result)
      return result
    } catch (err) {
      console.error('Ошибка создания коллекции:', err)
      error.value = err instanceof Error ? err.message : 'Неизвестная ошибка'
      // Для отладки создаем фиктивную коллекцию
      const mockCollection: Collection = {
        id: Date.now().toString(),
        user_id: 'mock-user',
        name: data.name,
        description: data.description || null,
        color: data.color || '#3b82f6',
        icon: data.icon || 'folder',
        parent_id: data.parent_id || null,
        position: store.collections.length + 1,
        is_public: false,
        is_favorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      store.addCollection(mockCollection)
      return mockCollection
    } finally {
      isLoading.value = false
    }
  }

  async function updateCollection(
    id: string,
    updates: Database['public']['Tables']['collections']['Update']
  ) {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: supabaseError } = await supabase
        .from('collections')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      store.updateCollection(data)
      return data
    } catch (err) {
      console.error('Ошибка обновления коллекции:', err)
      error.value = err instanceof Error ? err.message : 'Неизвестная ошибка'
      // Для отладки обновляем в стейте
      const collection = store.getCollectionById(id)
      if (collection) {
        store.updateCollection({ id, ...updates })
      }
      return collection
    } finally {
      isLoading.value = false
    }
  }

  async function deleteCollection(id: string) {
    try {
      isLoading.value = true
      error.value = null

      const { error: supabaseError } = await supabase.from('collections').delete().eq('id', id)

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      store.removeCollection(id)
    } catch (err) {
      console.error('Ошибка удаления коллекции:', err)
      error.value = err instanceof Error ? err.message : 'Неизвестная ошибка'
      // Для отладки удаляем из стейта
      store.removeCollection(id)
    } finally {
      isLoading.value = false
    }
  }

  async function updateCollectionPositions(collections: Array<{ id: string; position: number }>) {
    try {
      isLoading.value = true
      error.value = null

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Пользователь не найден')
      }

      const updates = collections.map(c => ({
        id: c.id,
        position: c.position,
        user_id: user.id,
      }))

      const { error: supabaseError } = await supabase
        .from('collections')
        .upsert(updates, { onConflict: 'id' })

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      // Обновляем позиции в стейте
      collections.forEach(({ id, position }) => {
        const collection = store.getCollectionById(id)
        if (collection) {
          store.updateCollection({ id, position })
        }
      })
    } catch (err) {
      console.error('Ошибка обновления позиций:', err)
      error.value = err instanceof Error ? err.message : 'Неизвестная ошибка'
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    collections,
    collectionsTree,
    isLoading,
    error,

    // Actions
    fetchCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    updateCollectionPositions,
  }
}
