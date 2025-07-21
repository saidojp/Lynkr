// composables/useCollections.ts
import { createClient } from '@supabase/supabase-js'
import { useRuntimeConfig } from 'nuxt/app'
import { useCollectionsStore } from '../stores/collections'
import type { Collection, CollectionTree, CollectionWithCounts } from '../types/database'

export const useCollections = () => {
  const config = useRuntimeConfig()
  const supabase = createClient(
    config.public.supabaseUrl as string,
    config.public.supabaseAnonKey as string
  )
  const collectionsStore = useCollectionsStore()

  // Получение текущего пользователя
  const getCurrentUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user) {
      throw new Error('User not authenticated')
    }
    return user
  }

  // Получение всех коллекций пользователя
  const fetchCollections = async (): Promise<Collection[]> => {
    const user = await getCurrentUser()

    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', user.id)
      .order('position', { ascending: true })

    if (error) {
      console.error('Error fetching collections:', error)
      throw error
    }

    collectionsStore.setCollections(data || [])
    return data || []
  }

  // Создание новой коллекции
  const createCollection = async (collectionData: {
    name: string
    description?: string
    color?: string
    icon?: string
    parent_id?: string | null
    is_public?: boolean
    is_favorite?: boolean
    default_sort?: string
    default_view?: string
  }): Promise<Collection> => {
    const user = await getCurrentUser()

    // Получаем позицию для новой коллекции
    const { count } = await supabase
      .from('collections')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('parent_id', collectionData.parent_id || null)

    const newCollection = {
      name: collectionData.name,
      description: collectionData.description || null,
      color: collectionData.color || '#9aa0a6',
      icon: collectionData.icon || 'folder',
      parent_id: collectionData.parent_id || null,
      position: (count || 0) + 1,
      user_id: user.id,
    }

    const { data, error } = await supabase
      .from('collections')
      .insert([newCollection])
      .select()
      .single()

    if (error) {
      console.error('Error creating collection:', error)
      throw error
    }

    collectionsStore.addCollection(data)
    return data
  }

  // Обновление коллекции
  const updateCollection = async (
    id: string,
    updates: Partial<Collection>
  ): Promise<Collection> => {
    const user = await getCurrentUser()

    const { data, error } = await supabase
      .from('collections')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating collection:', error)
      throw error
    }

    collectionsStore.updateCollection(data)
    return data
  }

  // Удаление коллекции
  const deleteCollection = async (id: string): Promise<void> => {
    const user = await getCurrentUser()

    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting collection:', error)
      throw error
    }

    collectionsStore.removeCollection(id)
  }

  // Получение коллекции по ID
  const getCollectionById = async (id: string): Promise<Collection | null> => {
    const user = await getCurrentUser()

    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching collection:', error)
      return null
    }

    return data
  }

  // Обновление позиции коллекций (для drag & drop)
  const updateCollectionsOrder = async (
    collections: { id: string; position: number }[]
  ): Promise<void> => {
    const user = await getCurrentUser()

    const { error } = await supabase.from('collections').upsert(
      collections.map(c => ({
        id: c.id,
        position: c.position,
        user_id: user.id,
      }))
    )

    if (error) {
      console.error('Error updating collections order:', error)
      throw error
    }

    // Обновляем локальные данные
    await fetchCollections()
  }

  // Получение иерархии коллекций
  const getCollectionHierarchy = async (): Promise<CollectionTree[]> => {
    const collections = await fetchCollections()
    return buildCollectionTree(collections)
  }

  // Построение древовидной структуры
  const buildCollectionTree = (
    collections: Collection[],
    parentId: string | null = null,
    level: number = 0
  ): CollectionTree[] => {
    return collections
      .filter(collection => collection.parent_id === parentId)
      .map(collection => ({
        ...collection,
        children: buildCollectionTree(collections, collection.id, level + 1),
        level,
        isExpanded: false,
      }))
      .sort((a, b) => a.position - b.position)
  }

  // Получение коллекций с количеством ссылок - заглушка
  const getCollectionsWithCounts = async (): Promise<CollectionWithCounts[]> => {
    return []
  }

  // Изменение позиции коллекции - заглушка
  const updateCollectionPosition = async (
    collectionId: string,
    newPosition: number,
    newParentId?: string
  ): Promise<void> => {
    // Заглушка - используем метод store для обновления позиций
    collectionsStore.updateCollectionsPositions([
      {
        id: collectionId,
        position: newPosition,
        parent_id: newParentId || null,
      },
    ])
  }

  // Переупорядочивание коллекций - заглушка
  const reorderCollections = async (parentId?: string): Promise<void> => {
    // Заглушка
  }

  // Перемещение коллекции в другого родителя - заглушка
  const moveCollectionToParent = async (
    collectionId: string,
    newParentId: string | null
  ): Promise<void> => {
    await updateCollectionPosition(collectionId, 1, newParentId || undefined)
  }

  // Получение пути к коллекции (breadcrumbs) - заглушка
  const getCollectionPath = async (collectionId: string): Promise<Collection[]> => {
    return []
  }

  // Проверка глубины вложенности - заглушка
  const checkNestingDepth = async (parentId: string | null): Promise<number> => {
    return 0
  }

  return {
    // Основные методы
    getCurrentUser,
    fetchCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    getCollectionById,
    updateCollectionsOrder,

    // Дополнительные методы
    getCollectionHierarchy,
    buildCollectionTree,
    getCollectionsWithCounts,
    updateCollectionPosition,
    reorderCollections,
    moveCollectionToParent,
    getCollectionPath,
    checkNestingDepth,
  }
}
