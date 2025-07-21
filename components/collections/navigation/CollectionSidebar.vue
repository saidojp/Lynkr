<template>
  <aside class="w-80 border-r-2 border-black bg-white flex flex-col h-full">
    <!-- Заголовок сайдбара -->
    <div class="p-4 border-b-2 border-black bg-gray-50">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold uppercase">Коллекции</h2>
        <div class="flex items-center space-x-2">
          <!-- Кнопка создания коллекции -->
          <button
            @click="$emit('create-collection')"
            class="p-2 border-2 border-black bg-black text-white hover:bg-gray-800 transition-colors duration-150"
            title="Создать коллекцию"
          >
            <Plus class="w-4 h-4" />
          </button>

          <!-- Кнопка развернуть/свернуть все -->
          <button
            @click="toggleAllCollections"
            class="p-2 border-2 border-black bg-white hover:bg-gray-100 transition-colors duration-150"
            :title="allExpanded ? 'Свернуть все' : 'Развернуть все'"
          >
            <component :is="allExpanded ? 'ChevronsDown' : 'ChevronsUp'" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Поиск коллекций -->
      <div class="mt-3 relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск коллекций..."
          class="w-full pl-10 pr-4 py-2 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
        />
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />

        <!-- Очистить поиск -->
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Фильтры -->
      <div class="mt-3 flex flex-wrap gap-2">
        <button
          v-for="filter in filters"
          :key="filter.key"
          @click="toggleFilter(filter.key)"
          class="px-2 py-1 border-2 border-black bg-white text-xs font-medium uppercase transition-colors duration-150"
          :class="{
            'bg-black text-white': activeFilters.includes(filter.key),
            'hover:bg-gray-100': !activeFilters.includes(filter.key),
          }"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Дерево коллекций -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="loading" class="p-4 text-center">
        <div class="inline-flex items-center space-x-2">
          <div
            class="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full"
          ></div>
          <span class="text-sm">Загрузка...</span>
        </div>
      </div>

      <div v-else-if="error" class="p-4">
        <div class="border-2 border-red-500 bg-red-50 p-3 text-center">
          <AlertCircle class="w-5 h-5 text-red-500 mx-auto mb-2" />
          <p class="text-sm text-red-700">{{ error }}</p>
          <button
            @click="$emit('retry')"
            class="mt-2 px-3 py-1 border-2 border-red-500 bg-white text-xs font-medium uppercase hover:bg-red-50"
          >
            Повторить
          </button>
        </div>
      </div>

      <div v-else-if="filteredCollections.length === 0" class="p-4 text-center">
        <div class="text-gray-500">
          <Folder class="w-8 h-8 mx-auto mb-2" />
          <p class="text-sm">
            {{ searchQuery ? 'Коллекции не найдены' : 'Нет коллекций' }}
          </p>
          <button
            v-if="!searchQuery"
            @click="$emit('create-collection')"
            class="mt-2 px-3 py-1 border-2 border-black bg-black text-white text-xs font-medium uppercase hover:bg-gray-800"
          >
            Создать первую коллекцию
          </button>
        </div>
      </div>

      <!-- Рекурсивный компонент дерева -->
      <CollectionTreeNode
        v-for="collection in filteredCollections"
        :key="collection.id"
        :collection="collection"
        :level="0"
        :selected-id="selectedCollectionId"
        :expanded-ids="expandedIds"
        :search-query="searchQuery"
        @select="$emit('select-collection', $event)"
        @toggle-expand="toggleExpand"
        @edit="$emit('edit-collection', $event)"
        @delete="$emit('delete-collection', $event)"
        @create-subcollection="$emit('create-subcollection', $event)"
      />
    </div>

    <!-- Статистика внизу -->
    <div class="p-4 border-t-2 border-black bg-gray-50">
      <div class="grid grid-cols-3 gap-3 text-center">
        <div>
          <div class="text-sm font-bold">{{ collectionsCount }}</div>
          <div class="text-xs text-gray-600">Коллекций</div>
        </div>
        <div>
          <div class="text-sm font-bold">{{ favoriteCollectionsCount }}</div>
          <div class="text-xs text-gray-600">Избранных</div>
        </div>
        <div>
          <div class="text-sm font-bold">{{ publicCollectionsCount }}</div>
          <div class="text-xs text-gray-600">Публичных</div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCollectionsStore } from '../../../stores/collections'
import CollectionTreeNode from './CollectionTreeNode.vue'
import type { Collection, CollectionTree } from '../../../types'
import { Plus, Search, X, ChevronsUp, ChevronsDown, Folder, AlertCircle } from 'lucide-vue-next'

interface Props {
  selectedCollectionId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  selectedCollectionId: null,
})

const emit = defineEmits<{
  'create-collection': []
  'create-subcollection': [parentId: string]
  'select-collection': [collectionId: string]
  'edit-collection': [collection: Collection]
  'delete-collection': [collection: Collection]
  retry: []
}>()

const collectionsStore = useCollectionsStore()
const { collectionsTree, loading, error, expandedCollections } = storeToRefs(collectionsStore)

const searchQuery = ref('')
const activeFilters = ref<string[]>([])

// Фильтры для коллекций
const filters = [
  { key: 'favorite', label: 'Избранные' },
  { key: 'public', label: 'Публичные' },
  { key: 'private', label: 'Приватные' },
  { key: 'empty', label: 'Пустые' },
]

// Развернутые коллекции (для управления состоянием)
const expandedIds = computed(() => Array.from(expandedCollections.value))

// Все коллекции развернуты?
const allExpanded = computed(() => {
  const allCollectionIds = getAllCollectionIds(collectionsTree.value)
  return (
    allCollectionIds.length > 0 && allCollectionIds.every(id => expandedCollections.value.has(id))
  )
})

// Отфильтрованные коллекции
const filteredCollections = computed((): CollectionTree[] => {
  let filtered = collectionsTree.value

  // Фильтрация по поиску
  if (searchQuery.value) {
    filtered = filterBySearch(filtered, searchQuery.value.toLowerCase())
  }

  // Фильтрация по активным фильтрам
  if (activeFilters.value.length > 0) {
    filtered = filterByActiveFilters(filtered, activeFilters.value)
  }

  return filtered
})

// Статистика
const collectionsCount = computed(() => collectionsStore.collectionsCount)
const favoriteCollectionsCount = computed(
  () => collectionsStore.collections.filter(c => c.is_favorite).length
)
const publicCollectionsCount = computed(
  () => collectionsStore.collections.filter(c => c.is_public).length
)

// Получить все ID коллекций из дерева
const getAllCollectionIds = (collections: CollectionTree[]): string[] => {
  const ids: string[] = []

  const traverse = (nodes: CollectionTree[]) => {
    nodes.forEach(node => {
      ids.push(node.id)
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    })
  }

  traverse(collections)
  return ids
}

// Фильтрация по поиску
const filterBySearch = (collections: CollectionTree[], query: string): CollectionTree[] => {
  const filtered: CollectionTree[] = []

  const matches = (collection: CollectionTree): boolean => {
    const nameMatch = collection.name.toLowerCase().includes(query)
    const descriptionMatch = collection.description?.toLowerCase().includes(query) || false
    return nameMatch || descriptionMatch
  }

  const traverse = (nodes: CollectionTree[]): CollectionTree[] => {
    const result: CollectionTree[] = []

    nodes.forEach(node => {
      const matchesSearch = matches(node)
      const filteredChildren = node.children ? traverse(node.children) : []

      if (matchesSearch || filteredChildren.length > 0) {
        result.push({
          ...node,
          children: filteredChildren,
        })
      }
    })

    return result
  }

  return traverse(collections)
}

// Фильтрация по активным фильтрам
const filterByActiveFilters = (
  collections: CollectionTree[],
  filters: string[]
): CollectionTree[] => {
  const checkFilter = (collection: CollectionTree, filter: string): boolean => {
    switch (filter) {
      case 'favorite':
        return collection.is_favorite
      case 'public':
        return collection.is_public
      case 'private':
        return !collection.is_public
      case 'empty':
        // Здесь нужна логика проверки пустоты (количество ссылок)
        return true // Временно
      default:
        return true
    }
  }

  const traverse = (nodes: CollectionTree[]): CollectionTree[] => {
    const result: CollectionTree[] = []

    nodes.forEach(node => {
      const matchesFilters = filters.every(filter => checkFilter(node, filter))
      const filteredChildren = node.children ? traverse(node.children) : []

      if (matchesFilters || filteredChildren.length > 0) {
        result.push({
          ...node,
          children: filteredChildren,
        })
      }
    })

    return result
  }

  return traverse(collections)
}

// Переключить фильтр
const toggleFilter = (filterKey: string) => {
  const index = activeFilters.value.indexOf(filterKey)
  if (index > -1) {
    activeFilters.value.splice(index, 1)
  } else {
    activeFilters.value.push(filterKey)
  }
}

// Переключить разворот коллекции
const toggleExpand = (collectionId: string) => {
  collectionsStore.toggleCollectionExpanded(collectionId)
}

// Развернуть/свернуть все коллекции
const toggleAllCollections = () => {
  if (allExpanded.value) {
    collectionsStore.collapseAllCollections()
  } else {
    collectionsStore.expandAllCollections()
  }
}
</script>

<style scoped>
/* Кастомный скроллбар */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #666;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #333;
}

/* Анимации */
button {
  transition: all 0.15s ease-in-out;
}

button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

/* Стили для поиска */
input:focus {
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}
</style>
