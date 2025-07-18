// composables/useCollections.ts
import type { Collection } from '~/types/database'

export const useCollections = () => {
  const { supabase } = useSupabase()
  const user = useSupabaseUser()

  // Получение всех коллекций пользователя
  const getCollections = async (): Promise<Collection[]> => {
    if (!user.value?.id) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', user.value.id)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Получение коллекций с подколлекциями (иерархия)
  const getCollectionsWithHierarchy = async (): Promise<Collection[]> => {
    const collections = await getCollections()

    // Группируем по parent_id
    const collectionMap = new Map<string | null, Collection[]>()

    collections.forEach(collection => {
      const parentId = collection.parent_id
      if (!collectionMap.has(parentId)) {
        collectionMap.set(parentId, [])
      }
      collectionMap.get(parentId)?.push(collection)
    })

    // Возвращаем корневые коллекции
    return collectionMap.get(null) || []
  }

  // Создание новой коллекции
  const createCollection = async (
    collection: Omit<Collection, 'id' | 'created_at' | 'updated_at' | 'user_id'>
  ): Promise<Collection> => {
    if (!user.value?.id) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('collections')
      .insert({
        ...collection,
        user_id: user.value.id,
        position: collection.position || 0,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Обновление коллекции
  const updateCollection = async (
    id: string,
    updates: Partial<Collection>
  ): Promise<Collection> => {
    if (!user.value?.id) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('collections')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.value.id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Удаление коллекции
  const deleteCollection = async (id: string): Promise<void> => {
    if (!user.value?.id) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id)
      .eq('user_id', user.value.id)

    if (error) throw error
  }

  // Получение одной коллекции
  const getCollection = async (id: string): Promise<Collection | null> => {
    if (!user.value?.id) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.value.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  }

  // Перемещение коллекции (изменение позиции)
  const moveCollection = async (id: string, newPosition: number): Promise<void> => {
    await updateCollection(id, { position: newPosition })
  }

  // Получение подколлекций
  const getSubCollections = async (parentId: string): Promise<Collection[]> => {
    if (!user.value?.id) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', user.value.id)
      .eq('parent_id', parentId)
      .order('position', { ascending: true })

    if (error) throw error
    return data || []
  }

  return {
    getCollections,
    getCollectionsWithHierarchy,
    createCollection,
    updateCollection,
    deleteCollection,
    getCollection,
    moveCollection,
    getSubCollections,
  }
}
