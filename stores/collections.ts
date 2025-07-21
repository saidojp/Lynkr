// stores/collections.ts
import { defineStore } from 'pinia'
import type { Collection, CollectionTree, CollectionWithCounts } from '../types/database'

interface CollectionsState {
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
    // Установить коллекции
    setCollections(collections: Collection[]) {
      this.collections = collections
    },

    // Добавить коллекцию
    addCollection(collection: Collection) {
      this.collections.push(collection)
    },

    // Обновить коллекцию
    updateCollection(updates: Partial<Collection> & { id: string }) {
      const index = this.collections.findIndex(c => c.id === updates.id)
      if (index !== -1) {
        this.collections[index] = { ...this.collections[index], ...updates }
      }
    },

    // Удалить коллекцию
    removeCollection(id: string) {
      this.collections = this.collections.filter(c => c.id !== id)
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

    // Загрузить моковые данные
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
