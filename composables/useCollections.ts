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

  // Вспомогательная функция для получения текущего пользователя
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
    parent_id?: string
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
      is_public: collectionData.is_public || false,
      is_favorite: collectionData.is_favorite || false,
      default_sort: collectionData.default_sort || 'created_desc',
      default_view: collectionData.default_view || 'grid',
      user_id: user.id,
      position: (count || 0) + 1,
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
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
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

  // Получение коллекций с количеством ссылок
  const getCollectionsWithCounts = async (): Promise<CollectionWithCounts[]> => {
    const user = await getCurrentUser()

    const { data, error } = await supabase
      .from('collections')
      .select(
        `
        *,
        links(count),
        children:collections!parent_id(count)
      `
      )
      .eq('user_id', user.id)
      .order('position', { ascending: true })

    if (error) {
      console.error('Error fetching collections with counts:', error)
      throw error
    }

    return (data || []).map(collection => ({
      ...collection,
      linksCount: collection.links?.[0]?.count || 0,
      childrenCount: collection.children?.[0]?.count || 0,
    }))
  }

  // Изменение позиции коллекции
  const updateCollectionPosition = async (
    collectionId: string,
    newPosition: number,
    newParentId?: string
  ): Promise<void> => {
    const user = await getCurrentUser()

    const { error } = await supabase
      .from('collections')
      .update({
        position: newPosition,
        parent_id: newParentId || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', collectionId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error updating collection position:', error)
      throw error
    }

    // Обновляем позиции других коллекций
    await reorderCollections(newParentId)
  }

  // Переупорядочивание коллекций
  const reorderCollections = async (parentId?: string): Promise<void> => {
    const user = await getCurrentUser()

    const { data: collections, error } = await supabase
      .from('collections')
      .select('id, position')
      .eq('user_id', user.id)
      .eq('parent_id', parentId || null)
      .order('position', { ascending: true })

    if (error || !collections) return

    const updates = collections.map((collection, index) => ({
      id: collection.id,
      position: index + 1,
    }))

    for (const update of updates) {
      await supabase
        .from('collections')
        .update({ position: update.position })
        .eq('id', update.id)
        .eq('user_id', user.id)
    }
  }

  // Перемещение коллекции в другого родителя
  const moveCollectionToParent = async (
    collectionId: string,
    newParentId: string | null
  ): Promise<void> => {
    const user = await getCurrentUser()

    // Получаем новую позицию
    const { count } = await supabase
      .from('collections')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('parent_id', newParentId)

    const newPosition = (count || 0) + 1

    await updateCollectionPosition(collectionId, newPosition, newParentId || undefined)
  }

  // Получение пути к коллекции (breadcrumbs)
  const getCollectionPath = async (collectionId: string): Promise<Collection[]> => {
    const user = await getCurrentUser()
    const path: Collection[] = []
    let currentId: string | null = collectionId

    while (currentId) {
      const { data: collection, error } = (await supabase
        .from('collections')
        .select('*')
        .eq('id', currentId)
        .eq('user_id', user.id)
        .single()) as { data: Collection | null; error: any }

      if (error || !collection) break

      path.unshift(collection)
      currentId = collection.parent_id || null
    }

    return path
  }

  // Проверка глубины вложенности (максимум 3 уровня)
  const checkNestingDepth = async (parentId: string | null): Promise<number> => {
    if (!parentId) return 0

    const user = await getCurrentUser()
    let depth = 0
    let currentParentId: string | null = parentId

    while (currentParentId && depth < 3) {
      const { data: parent, error } = (await supabase
        .from('collections')
        .select('parent_id')
        .eq('id', currentParentId)
        .eq('user_id', user.id)
        .single()) as { data: { parent_id: string | null } | null; error: any }

      if (error || !parent) break

      depth++
      currentParentId = parent.parent_id || null
    }

    return depth
  }

  return {
    fetchCollections,
    createCollection,
    updateCollection,
    deleteCollection,
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
