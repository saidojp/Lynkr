// stores/collections.ts
import { defineStore } from 'pinia'
import type { Collection, CollectionTree, CollectionWithCounts } from '../types/database'
import { useCollections } from '../composables/useCollections'

interface CollectionsState {
  collections: Collection[]
  collectionsTree: CollectionTree[]
  collectionsWithCounts: CollectionWithCounts[]
  selectedCollection: Collection | null
  loading: boolean
  error: string | null
  expandedCollections: Set<string>
}

export const useCollectionsStore = defineStore('collections', {
  state: (): CollectionsState => ({
    collections: [],
    collectionsTree: [],
    collectionsWithCounts: [],
    selectedCollection: null,
    loading: false,
    error: null,
    expandedCollections: new Set(),
  }),

  getters: {
    // Получить коллекцию по ID
    getCollectionById:
      state =>
      (id: string): Collection | undefined => {
        return state.collections.find(collection => collection.id === id)
      },

    // Получить дочерние коллекции
    getChildCollections:
      state =>
      (parentId: string | null): Collection[] => {
        return state.collections.filter(collection => collection.parent_id === parentId)
      },

    // Получить корневые коллекции (без родителя)
    getRootCollections: (state): Collection[] => {
      return state.collections.filter(collection => !collection.parent_id)
    },

    // Проверить, есть ли коллекции
    hasCollections: (state): boolean => {
      return state.collections.length > 0
    },

    // Получить количество коллекций
    collectionsCount: (state): number => {
      return state.collections.length
    },

    // Получить избранные коллекции (с избранными ссылками)
    getFavoriteCollections: (state): Collection[] => {
      // Здесь будет логика для получения коллекций с избранными ссылками
      return state.collections.filter(
        collection =>
          // Временно возвращаем все, позже добавим логику избранных ссылок
          true
      )
    },

    // Проверить, развернута ли коллекция
    isCollectionExpanded:
      state =>
      (id: string): boolean => {
        return state.expandedCollections.has(id)
      },

    // Получить путь к коллекции
    getCollectionBreadcrumbs:
      state =>
      (collectionId: string): Collection[] => {
        const breadcrumbs: Collection[] = []
        let currentCollection = state.collections.find(c => c.id === collectionId)

        while (currentCollection) {
          breadcrumbs.unshift(currentCollection)
          currentCollection = currentCollection.parent_id
            ? state.collections.find(c => c.id === currentCollection!.parent_id)
            : undefined
        }

        return breadcrumbs
      },

    // Получить коллекции определенного уровня вложенности
    getCollectionsByLevel:
      state =>
      (level: number): Collection[] => {
        return state.collectionsTree
          .filter(collection => collection.level === level)
          .map(collection => ({
            id: collection.id,
            user_id: collection.user_id,
            name: collection.name,
            description: collection.description,
            color: collection.color,
            icon: collection.icon,
            parent_id: collection.parent_id,
            position: collection.position,
            is_public: collection.is_public,
            is_favorite: collection.is_favorite,
            default_sort: collection.default_sort,
            default_view: collection.default_view,
            created_at: collection.created_at,
            updated_at: collection.updated_at,
          }))
      },
  },

  actions: {
    // Установить коллекции
    setCollections(collections: Collection[]) {
      this.collections = collections.sort((a, b) => a.position - b.position)
      this.error = null
    },

    // Установить древовидную структуру
    setCollectionsTree(tree: CollectionTree[]) {
      this.collectionsTree = tree
    },

    // Установить коллекции с количеством
    setCollectionsWithCounts(collections: CollectionWithCounts[]) {
      this.collectionsWithCounts = collections
    },

    // Добавить коллекцию
    addCollection(collection: Collection) {
      this.collections.push(collection)
      this.collections.sort((a, b) => a.position - b.position)
      this.error = null
    },

    // Обновить коллекцию
    updateCollection(updatedCollection: Collection) {
      const index = this.collections.findIndex(c => c.id === updatedCollection.id)
      if (index !== -1) {
        this.collections[index] = updatedCollection
        this.collections.sort((a, b) => a.position - b.position)
      }

      // Обновляем выбранную коллекцию, если она совпадает
      if (this.selectedCollection?.id === updatedCollection.id) {
        this.selectedCollection = updatedCollection
      }

      this.error = null
    },

    // Удалить коллекцию
    removeCollection(collectionId: string) {
      this.collections = this.collections.filter(c => c.id !== collectionId)

      // Очищаем выбранную коллекцию, если она была удалена
      if (this.selectedCollection?.id === collectionId) {
        this.selectedCollection = null
      }

      // Удаляем из развернутых коллекций
      this.expandedCollections.delete(collectionId)

      this.error = null
    },

    // Выбрать коллекцию
    selectCollection(collection: Collection | null) {
      this.selectedCollection = collection
    },

    // Установить состояние загрузки
    setLoading(loading: boolean) {
      this.loading = loading
    },

    // Установить ошибку
    setError(error: string | null) {
      this.error = error
    },

    // Развернуть/свернуть коллекцию
    toggleCollectionExpanded(collectionId: string) {
      if (this.expandedCollections.has(collectionId)) {
        this.expandedCollections.delete(collectionId)
      } else {
        this.expandedCollections.add(collectionId)
      }
    },

    // Развернуть коллекцию
    expandCollection(collectionId: string) {
      this.expandedCollections.add(collectionId)
    },

    // Свернуть коллекцию
    collapseCollection(collectionId: string) {
      this.expandedCollections.delete(collectionId)
    },

    // Развернуть все коллекции
    expandAllCollections() {
      this.collections.forEach(collection => {
        this.expandedCollections.add(collection.id)
      })
    },

    // Свернуть все коллекции
    collapseAllCollections() {
      this.expandedCollections.clear()
    },

    // Переместить коллекцию (drag & drop)
    moveCollection(collectionId: string, newParentId: string | null, newPosition: number) {
      const collection = this.collections.find(c => c.id === collectionId)
      if (!collection) return

      // Обновляем коллекцию
      collection.parent_id = newParentId
      collection.position = newPosition

      // Пересортировываем коллекции
      this.collections.sort((a, b) => a.position - b.position)
    },

    // Обновить позиции коллекций после drag & drop
    updateCollectionsPositions(
      updates: { id: string; position: number; parent_id?: string | null }[]
    ) {
      updates.forEach(update => {
        const collection = this.collections.find(c => c.id === update.id)
        if (collection) {
          collection.position = update.position
          if (update.parent_id !== undefined) {
            collection.parent_id = update.parent_id
          }
        }
      })

      this.collections.sort((a, b) => a.position - b.position)
    },

    // Очистить все данные
    clearCollections() {
      this.collections = []
      this.collectionsTree = []
      this.collectionsWithCounts = []
      this.selectedCollection = null
      this.expandedCollections.clear()
      this.error = null
    },

    // Обновить счетчики коллекций
    updateCollectionCounts(collectionId: string, linksCount: number, childrenCount?: number) {
      const collection = this.collectionsWithCounts.find(c => c.id === collectionId)
      if (collection) {
        collection.linksCount = linksCount
        if (childrenCount !== undefined) {
          collection.childrenCount = childrenCount
        }
      }
    },

    // Инициализация store (загрузка данных)
    async initialize() {
      this.setLoading(true)
      this.setError(null)

      try {
        const { fetchCollections, getCollectionHierarchy, getCollectionsWithCounts } =
          useCollections()

        // Загружаем коллекции параллельно
        const [collections, tree, collectionsWithCounts] = await Promise.all([
          fetchCollections(),
          getCollectionHierarchy(),
          getCollectionsWithCounts(),
        ])

        this.setCollections(collections)
        this.setCollectionsTree(tree)
        this.setCollectionsWithCounts(collectionsWithCounts)
      } catch (error) {
        console.error('Error initializing collections store:', error)
        this.setError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        this.setLoading(false)
      }
    },

    // Обновление данных
    async refresh() {
      await this.initialize()
    },

    // Создать коллекцию
    async createCollection(collectionData: {
      name: string
      description?: string | null
      color?: string
      icon?: string
      parent_id?: string | null
      is_public?: boolean
      is_favorite?: boolean
      default_sort?: string
      default_view?: string
    }): Promise<Collection> {
      this.setLoading(true)
      this.setError(null)

      try {
        // Временная заглушка без Supabase
        const newCollection: Collection = {
          id: Date.now().toString(),
          user_id: 'temp-user',
          name: collectionData.name,
          description: collectionData.description || null,
          color: collectionData.color || '#9aa0a6',
          icon: collectionData.icon || 'folder',
          parent_id: collectionData.parent_id || null,
          position: this.collections.length + 1,
          is_public: collectionData.is_public || false,
          is_favorite: collectionData.is_favorite || false,
          default_sort: collectionData.default_sort || 'created_desc',
          default_view: collectionData.default_view || 'grid',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        this.addCollection(newCollection)
        return newCollection
      } catch (error) {
        console.error('Error creating collection:', error)
        this.setError(error instanceof Error ? error.message : 'Failed to create collection')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // Обновить коллекцию
    async editCollection(collectionId: string, updates: Partial<Collection>): Promise<Collection> {
      this.setLoading(true)
      this.setError(null)

      try {
        const { updateCollection } = useCollections()
        const updatedCollection = await updateCollection(collectionId, updates)
        this.updateCollection(updatedCollection)
        return updatedCollection
      } catch (error) {
        console.error('Error updating collection:', error)
        this.setError(error instanceof Error ? error.message : 'Failed to update collection')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // Удалить коллекцию
    async deleteCollection(collectionId: string): Promise<void> {
      this.setLoading(true)
      this.setError(null)

      try {
        const { deleteCollection } = useCollections()
        await deleteCollection(collectionId)
        this.removeCollection(collectionId)
      } catch (error) {
        console.error('Error deleting collection:', error)
        this.setError(error instanceof Error ? error.message : 'Failed to delete collection')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // Обновить состояние развернутых коллекций в дереве
    updateCollectionsExpanded(collectionsTree: CollectionTree[]): void {
      collectionsTree.forEach(collection => {
        if (collection.isExpanded) {
          this.expandedCollections.add(collection.id)
        } else {
          this.expandedCollections.delete(collection.id)
        }

        if (collection.children && collection.children.length > 0) {
          this.updateCollectionsExpanded(collection.children)
        }
      })
    },

    // Явный метод для загрузки коллекций
    async fetchCollections(): Promise<Collection[]> {
      this.setLoading(true)
      this.setError(null)

      try {
        const { fetchCollections } = useCollections()
        const collections = await fetchCollections()
        this.setCollections(collections)
        return collections
      } catch (error) {
        console.error('Error fetching collections:', error)
        this.setError(error instanceof Error ? error.message : 'Failed to fetch collections')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // Переключить статус избранного
    async toggleFavorite(collectionId: string): Promise<Collection> {
      const collection = this.collections.find(c => c.id === collectionId)
      if (!collection) {
        throw new Error('Collection not found')
      }

      return await this.editCollection(collectionId, {
        is_favorite: !collection.is_favorite,
      })
    },

    // Переключить статус публичного доступа
    async togglePublic(collectionId: string): Promise<Collection> {
      const collection = this.collections.find(c => c.id === collectionId)
      if (!collection) {
        throw new Error('Collection not found')
      }

      return await this.editCollection(collectionId, {
        is_public: !collection.is_public,
      })
    },

    // Дублировать коллекцию
    async duplicateCollection(collectionId: string): Promise<Collection> {
      this.setLoading(true)
      this.setError(null)

      try {
        const collection = this.collections.find(c => c.id === collectionId)
        if (!collection) {
          throw new Error('Collection not found')
        }

        // Создаем копию коллекции с новым именем
        const duplicatedData = {
          name: `${collection.name} (копия)`,
          description: collection.description,
          color: collection.color,
          icon: collection.icon,
          parent_id: collection.parent_id,
          is_public: collection.is_public,
          is_favorite: false, // копия не добавляется в избранное по умолчанию
          default_sort: collection.default_sort,
          default_view: collection.default_view,
        }

        return await this.createCollection(duplicatedData)
      } catch (error) {
        console.error('Error duplicating collection:', error)
        this.setError(error instanceof Error ? error.message : 'Failed to duplicate collection')
        throw error
      } finally {
        this.setLoading(false)
      }
    },
  },
})
