import { defineStore } from 'pinia'
import { useSupabase } from '../composables/useSupabase'
import type { Collection, CollectionTree, CollectionWithCounts } from '../types'

export interface CollectionsState {
  collections: Collection[]
  selectedCollection: Collection | null
  loading: boolean
  error: string | null
  expandedCollections: Set<string>
}

export const useCollectionsStore = defineStore('collections', {
  state: (): CollectionsState => ({
    collections: [],
    selectedCollection: null,
    loading: false,
    error: null,
    expandedCollections: new Set<string>(),
  }),

  getters: {
    // Получить коллекцию по ID
    getCollectionById:
      state =>
      (id: string): Collection | undefined => {
        return state.collections.find(collection => collection.id === id)
      },

    // Получить родительские коллекции
    getParentCollections: state => {
      return state.collections.filter(collection => !collection.parent_id)
    },

    // Получить дочерние коллекции
    getChildCollections:
      state =>
      (parentId: string): Collection[] => {
        return state.collections.filter(collection => collection.parent_id === parentId)
      },

    // Построить дерево коллекций
    collectionsTree: (state): CollectionTree[] => {
      const buildTree = (parentId: string | null = null, level: number = 0): CollectionTree[] => {
        return state.collections
          .filter(collection => collection.parent_id === parentId)
          .sort((a, b) => a.position - b.position)
          .map(collection => ({
            ...collection,
            children: buildTree(collection.id, level + 1),
            level,
            isExpanded: state.expandedCollections.has(collection.id),
            linksCount: 0, // TODO: подсчитать ссылки
            childrenCount: state.collections.filter(c => c.parent_id === collection.id).length,
          }))
      }
      return buildTree()
    },

    // Проверить, есть ли коллекции
    hasCollections: (state): boolean => {
      return state.collections.length > 0
    },

    // Получить коллекции с counts
    collectionsWithCounts: (state): CollectionWithCounts[] => {
      return state.collections.map(collection => ({
        ...collection,
        linksCount: 0, // TODO: подсчитать реальные ссылки
        childrenCount: state.collections.filter(c => c.parent_id === collection.id).length,
      }))
    },

    // Получить хлебные крошки для коллекции
    getCollectionBreadcrumbs:
      state =>
      (collectionId: string): Collection[] => {
        const breadcrumbs: Collection[] = []
        let current = state.collections.find(c => c.id === collectionId)

        while (current) {
          breadcrumbs.unshift(current)
          if (current.parent_id) {
            current = state.collections.find(c => c.id === current!.parent_id)
          } else {
            break
          }
        }

        return breadcrumbs
      },
  },

  actions: {
    // Загрузить коллекции из Supabase
    async fetchCollections() {
      const { supabase } = useSupabase()
      this.loading = true
      this.error = null

      try {
        const { data, error } = await supabase
          .from('collections')
          .select('*')
          .order('position', { ascending: true })

        if (error) throw error

        this.collections = data || []
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch collections'
        console.error('Error fetching collections:', err)
      } finally {
        this.loading = false
      }
    },

    // Создать новую коллекцию
    async createCollection(
      collectionData: Omit<Collection, 'id' | 'user_id' | 'created_at' | 'updated_at'>
    ) {
      const { supabase } = useSupabase()
      this.loading = true
      this.error = null

      try {
        // Получить следующую позицию
        const { data: positionData } = await supabase
          .from('collections')
          .select('position')
          .eq('parent_id', collectionData.parent_id || null)
          .order('position', { ascending: false })
          .limit(1)

        const nextPosition = positionData?.[0]?.position ? positionData[0].position + 1 : 1

        const { data, error } = await supabase
          .from('collections')
          .insert([
            {
              ...collectionData,
              position: nextPosition,
            },
          ])
          .select()
          .single()

        if (error) throw error

        const newCollection = data as Collection
        this.collections.push(newCollection)
        return newCollection
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to create collection'
        console.error('Error creating collection:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    // Обновить коллекцию
    async updateCollection(
      id: string,
      updates: Partial<Omit<Collection, 'id' | 'user_id' | 'created_at'>>
    ) {
      const { supabase } = useSupabase()
      this.loading = true
      this.error = null

      try {
        const { data, error } = await supabase
          .from('collections')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        const updatedCollection = data as Collection
        const index = this.collections.findIndex(c => c.id === id)
        if (index !== -1) {
          this.collections[index] = updatedCollection
        }

        return updatedCollection
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to update collection'
        console.error('Error updating collection:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    // Удалить коллекцию
    async deleteCollection(id: string) {
      const { supabase } = useSupabase()
      this.loading = true
      this.error = null

      try {
        const { error } = await supabase.from('collections').delete().eq('id', id)

        if (error) throw error

        this.collections = this.collections.filter(c => c.id !== id)

        // Если удаленная коллекция была выбранной, сбросить выбор
        if (this.selectedCollection?.id === id) {
          this.selectedCollection = null
        }

        return true
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to delete collection'
        console.error('Error deleting collection:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    // Изменить порядок коллекций
    async reorderCollections(collectionIds: string[], parentId?: string) {
      const { supabase } = useSupabase()
      this.loading = true
      this.error = null

      try {
        const updates = collectionIds.map((id, index) => ({
          id,
          position: index + 1,
          updated_at: new Date().toISOString(),
        }))

        const { error } = await supabase.from('collections').upsert(updates)

        if (error) throw error

        // Обновить локальное состояние
        collectionIds.forEach((id, index) => {
          const collection = this.collections.find(c => c.id === id)
          if (collection) {
            collection.position = index + 1
          }
        })

        // Пересортировать коллекции
        this.collections.sort((a, b) => a.position - b.position)
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to reorder collections'
        console.error('Error reordering collections:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    // Установить коллекции (для совместимости)
    setCollections(collections: Collection[]) {
      this.collections = collections
    },

    // Добавить коллекцию (для совместимости)
    addCollection(collection: Collection) {
      this.collections.push(collection)
    },

    // Установить выбранную коллекцию
    setSelectedCollection(collection: Collection | null) {
      this.selectedCollection = collection
    },

    // Переключить раскрытие коллекции
    toggleCollectionExpansion(id: string) {
      if (this.expandedCollections.has(id)) {
        this.expandedCollections.delete(id)
      } else {
        this.expandedCollections.add(id)
      }
    },

    // Загрузить моковые данные (для тестирования)
    loadMockData() {
      const mockCollections: Collection[] = [
        {
          id: '1',
          user_id: 'mock-user',
          name: 'Работа',
          description: 'Рабочие ресурсы и документы',
          color: '#3b82f6',
          icon: 'briefcase',
          parent_id: null,
          position: 1,
          is_public: false,
          is_favorite: false,
          default_sort: 'manual',
          default_view: 'grid',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          user_id: 'mock-user',
          name: 'Проекты',
          description: 'Проекты и идеи',
          color: '#10b981',
          icon: 'code',
          parent_id: '1',
          position: 1,
          is_public: false,
          is_favorite: false,
          default_sort: 'manual',
          default_view: 'grid',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          user_id: 'mock-user',
          name: 'Личное',
          description: 'Личные ссылки и заметки',
          color: '#f59e0b',
          icon: 'user',
          parent_id: null,
          position: 2,
          is_public: false,
          is_favorite: true,
          default_sort: 'manual',
          default_view: 'list',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]

      this.setCollections(mockCollections)
    },

    // Установить состояние загрузки
    setLoading(loading: boolean) {
      this.loading = loading
    },

    // Установить ошибку
    setError(error: string | null) {
      this.error = error
    },
  },
})
