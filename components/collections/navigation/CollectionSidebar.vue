<template>
  <aside class="w-80 bg-white border border-zinc-200 rounded-lg flex flex-col h-fit">
    <!-- Заголовок сайдбара -->
    <div class="p-6 border-b border-zinc-200">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-zinc-900">Collections</h2>
        <div class="flex items-center space-x-2">
          <!-- Кнопка создания коллекции -->
          <UiButton
            variant="ghost"
            size="icon"
            @click="$emit('create-collection')"
            title="Create collection"
          >
            <Plus class="w-4 h-4" />
          </UiButton>

          <!-- Кнопка развернуть/свернуть все -->
          <UiButton
            variant="ghost"
            size="icon"
            @click="toggleAllCollections"
            :title="allExpanded ? 'Collapse all' : 'Expand all'"
          >
            <component :is="allExpanded ? 'ChevronsDown' : 'ChevronsUp'" class="w-4 h-4" />
          </UiButton>
        </div>
      </div>

      <!-- Поиск коллекций -->
      <div class="mt-4 relative">
        <UiInput v-model="searchQuery" placeholder="Search collections..." class="pl-10" />
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />

        <!-- Очистить поиск -->
        <UiButton
          v-if="searchQuery"
          variant="ghost"
          size="icon"
          @click="searchQuery = ''"
          class="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
        >
          <X class="w-4 h-4" />
        </UiButton>
      </div>

      <!-- Фильтры -->
      <div class="mt-4 flex flex-wrap gap-2">
        <UiButton
          v-for="filter in filters"
          :key="filter.key"
          variant="outline"
          size="sm"
          @click="toggleFilter(filter.key)"
          :class="{
            'bg-zinc-900 text-white border-zinc-900': activeFilters.includes(filter.key),
          }"
        >
          {{ filter.label }}
        </UiButton>
      </div>
    </div>

    <!-- Дерево коллекций -->
    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="loading" class="text-center py-8">
        <div class="inline-flex items-center space-x-2">
          <div
            class="animate-spin w-4 h-4 border-2 border-zinc-300 border-t-zinc-900 rounded-full"
          ></div>
          <span class="text-sm text-zinc-500">Loading...</span>
        </div>
      </div>

      <div v-else-if="error" class="p-4 border border-red-200 bg-red-50 rounded-lg">
        <AlertCircle class="w-5 h-5 text-red-500 mx-auto mb-2" />
        <p class="text-sm text-red-700">{{ error }}</p>
        <UiButton variant="outline" size="sm" @click="$emit('retry')" class="mt-2">
          Retry
        </UiButton>
      </div>

      <div v-else-if="filteredCollections.length === 0" class="p-4 text-center">
        <div class="text-zinc-500">
          <Folder class="w-8 h-8 mx-auto mb-2" />
          <p class="text-sm">
            {{ searchQuery ? 'No collections found' : 'No collections' }}
          </p>
          <UiButton v-if="!searchQuery" @click="$emit('create-collection')" size="sm" class="mt-2">
            Create first collection
          </UiButton>
        </div>
      </div>

      <!-- Рекурсивный компонент дерева -->
      <div v-else class="space-y-1">
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
    </div>

    <!-- Статистика внизу -->
    <div class="p-6 border-t border-zinc-200 bg-zinc-50/50">
      <div class="grid grid-cols-3 gap-3 text-center">
        <div>
          <div class="text-lg font-semibold text-zinc-900">{{ collectionsCount }}</div>
          <div class="text-xs text-zinc-500">Collections</div>
        </div>
        <div>
          <div class="text-lg font-semibold text-zinc-900">{{ favoriteCollectionsCount }}</div>
          <div class="text-xs text-zinc-500">Favorites</div>
        </div>
        <div>
          <div class="text-lg font-semibold text-zinc-900">{{ publicCollectionsCount }}</div>
          <div class="text-xs text-zinc-500">Public</div>
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
import UiButton from '../../ui/UiButton.vue'
import UiInput from '../../ui/UiInput.vue'
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
  { key: 'favorite', label: 'Favorites' },
  { key: 'public', label: 'Public' },
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
const collectionsCount = computed(() => collectionsStore.collections.length)
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
  collectionsStore.toggleCollectionExpansion(collectionId)
}

// Развернуть/свернуть все коллекции
const toggleAllCollections = () => {
  // Простая реализация без специальных методов store
  if (allExpanded.value) {
    // Свернуть все
    collectionsTree.value.forEach(collection => {
      getAllCollectionIds([collection]).forEach(id => {
        if (expandedCollections.value.has(id)) {
          collectionsStore.toggleCollectionExpansion(id)
        }
      })
    })
  } else {
    // Развернуть все
    collectionsTree.value.forEach(collection => {
      getAllCollectionIds([collection]).forEach(id => {
        if (!expandedCollections.value.has(id)) {
          collectionsStore.toggleCollectionExpansion(id)
        }
      })
    })
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
