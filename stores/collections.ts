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
  },
})
