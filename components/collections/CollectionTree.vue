<template>
  <div class="collection-tree">
    <!-- Заголовок с действиями -->
    <div class="flex items-center justify-between p-4 border-b border-zinc-200">
      <h2 class="font-semibold text-lg text-zinc-900">Collections</h2>

      <div class="flex items-center space-x-2">
        <!-- Кнопка создания новой коллекции -->
        <UiButton
          variant="outline"
          size="icon"
          @click="$emit('create-collection')"
          title="Create Collection"
        >
          <Plus class="w-4 h-4" />
        </UiButton>

        <!-- Кнопка развернуть/свернуть все -->
        <UiButton
          variant="outline"
          size="icon"
          @click="toggleAllExpanded"
          :title="allExpanded ? 'Collapse All' : 'Expand All'"
        >
          <ChevronDown
            class="w-4 h-4 transition-transform duration-200"
            :class="{ 'rotate-180': allExpanded }"
          />
        </UiButton>

        <!-- Кнопка настроек -->
        <UiButton
          variant="outline"
          size="icon"
          @click="$emit('open-settings')"
          title="Collection Settings"
        >
          >
          <Settings class="w-4 h-4" />
        </UiButton>
      </div>
    </div>

    <!-- Поиск по коллекциям -->
    <div class="p-4 border-b border-zinc-200">
      <div class="relative">
        <UiInput
          v-model="searchQuery"
          type="text"
          placeholder="Search collections..."
          class="pl-10"
        />
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
      </div>
    </div>

    <!-- Статистика -->
    <div class="p-4 border-b border-zinc-200 bg-zinc-50">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <div class="font-semibold text-lg text-zinc-900">{{ totalCollections }}</div>
          <div class="text-xs text-zinc-600">Collections</div>
        </div>
        <div>
          <div class="font-semibold text-lg text-zinc-900">{{ totalLinks }}</div>
          <div class="text-xs text-zinc-600">Links</div>
        </div>
        <div>
          <div class="font-semibold text-lg text-zinc-900">{{ favoriteCollections }}</div>
          <div class="text-xs text-zinc-600">Favorites</div>
        </div>
      </div>
    </div>

    <!-- Дерево коллекций -->
    <div class="flex-1 overflow-y-auto">
      <!-- Загрузка -->
      <div v-if="loading" class="p-8 text-center">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"
        ></div>
        <p class="mt-2 text-sm text-zinc-600">Загрузка коллекций...</p>
      </div>

      <!-- Пустое состояние -->
      <div v-else-if="!loading && filteredCollections.length === 0" class="p-8 text-center">
        <div
          class="w-16 h-16 mx-auto mb-4 border border-zinc-200 bg-zinc-50 rounded-lg flex items-center justify-center"
        >
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
            ></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5h8"></path>
          </svg>
        </div>

        <h3 class="font-bold text-sm uppercase mb-2">
          {{ searchQuery ? 'Коллекции не найдены' : 'Нет коллекций' }}
        </h3>

        <p class="text-xs text-gray-600 mb-4">
          {{
            searchQuery
              ? 'Попробуйте изменить поисковый запрос'
              : 'Создайте свою первую коллекцию для организации ссылок'
          }}
        </p>

        <UiButton v-if="!searchQuery" @click="$emit('create-collection')" variant="default">
          Создать коллекцию
        </UiButton>
      </div>

      <!-- Список коллекций -->
      <div v-else class="py-2">
        <CollectionTreeNode
          v-for="collection in filteredCollections"
          :key="collection.id"
          :collection="collection"
          :level="0"
          :selected-id="selectedCollectionId"
          :expanded-ids="Array.from(collectionsStore.expandedCollections)"
          :search-query="searchQuery"
          :links-count="collection.linksCount"
          @select="handleSelect"
          @toggle-expand="toggleCollectionExpanded"
          @edit="handleEdit"
          @delete="handleDelete"
          @export="handleExport"
          @add-child="handleAddChild"
          @toggle-favorite="handleToggleFavorite"
          @toggle-public="handleTogglePublic"
        />
      </div>
    </div>

    <!-- Футер с дополнительными действиями -->
    <div class="p-4 border-t border-zinc-200 bg-zinc-50">
      <div class="flex items-center justify-between text-xs text-zinc-600">
        <span>Updated: {{ lastUpdated }}</span>

        <div class="flex items-center space-x-2">
          <UiButton variant="outline" size="sm" @click="refreshCollections"> Refresh </UiButton>

          <UiButton variant="outline" size="sm" @click="$emit('import-collections')">
            Import
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCollectionsStore } from '../../stores/collections'
import CollectionTreeNode from './navigation/CollectionTreeNode.vue'
import UiButton from '../ui/UiButton.vue'
import UiInput from '../ui/UiInput.vue'
import { Plus, ChevronDown, Settings, Search } from 'lucide-vue-next'
import type { Collection, CollectionTree } from '../../types/database'

interface Props {
  selectedCollectionId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  selectedCollectionId: null,
})

const emit = defineEmits<{
  'create-collection': []
  'select-collection': [collection: CollectionTree]
  'edit-collection': [collection: CollectionTree]
  'delete-collection': [collection: CollectionTree]
  'duplicate-collection': [collection: CollectionTree]
  'export-collection': [collection: CollectionTree]
  'add-child-collection': [parentCollection: CollectionTree]
  'toggle-favorite': [collection: CollectionTree]
  'toggle-public': [collection: CollectionTree]
  'open-settings': []
  'import-collections': []
}>()

const collectionsStore = useCollectionsStore()
const { collectionsTree, loading } = storeToRefs(collectionsStore)

const searchQuery = ref('')
const allExpanded = ref(false)

// Вычисляемые свойства
const filteredCollections = computed(() => {
  if (!searchQuery.value.trim()) {
    return collectionsTree.value
  }

  const filterCollections = (collections: CollectionTree[]): CollectionTree[] => {
    return collections
      .filter(collection => {
        const matchesSearch =
          collection.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          collection.description?.toLowerCase().includes(searchQuery.value.toLowerCase())

        const hasMatchingChildren =
          collection.children &&
          collection.children.length > 0 &&
          filterCollections(collection.children).length > 0

        return matchesSearch || hasMatchingChildren
      })
      .map(collection => ({
        ...collection,
        children: collection.children ? filterCollections(collection.children) : [],
        isExpanded: searchQuery.value.trim() ? true : collection.isExpanded, // Автоматически разворачиваем при поиске
      }))
  }

  return filterCollections(collectionsTree.value)
})

const totalCollections = computed(() => {
  const countCollections = (collections: CollectionTree[]): number => {
    return collections.reduce((total, collection) => {
      return total + 1 + (collection.children ? countCollections(collection.children) : 0)
    }, 0)
  }
  return countCollections(collectionsTree.value)
})

const totalLinks = computed(() => {
  const countLinks = (collections: CollectionTree[]): number => {
    return collections.reduce((total, collection) => {
      return (
        total +
        (collection.linksCount || 0) +
        (collection.children ? countLinks(collection.children) : 0)
      )
    }, 0)
  }
  return countLinks(collectionsTree.value)
})

const favoriteCollections = computed(() => {
  const countFavorites = (collections: CollectionTree[]): number => {
    return collections.reduce((total, collection) => {
      return (
        total +
        (collection.is_favorite ? 1 : 0) +
        (collection.children ? countFavorites(collection.children) : 0)
      )
    }, 0)
  }
  return countFavorites(collectionsTree.value)
})

const lastUpdated = computed(() => {
  const now = new Date()
  return now.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
})

// Методы
const toggleAllExpanded = () => {
  allExpanded.value = !allExpanded.value

  const updateExpanded = (collections: CollectionTree[]) => {
    collections.forEach(collection => {
      collection.isExpanded = allExpanded.value
      if (collection.children) {
        updateExpanded(collection.children)
      }
    })
  }

  updateExpanded(collectionsTree.value)
  // Обновляем статус развернутых коллекций в store
  // TODO: Implement updateCollectionsExpanded in store if needed
}

const refreshCollections = async () => {
  // TODO: Implement fetchCollections in store
  console.log('Refresh collections')
}

// Обработчики событий
const handleSelect = (collectionId: string) => {
  const collection = findCollectionById(collectionsTree.value, collectionId)
  if (collection) {
    emit('select-collection', collection)
  }
}

const handleEdit = (collection: Collection) => {
  const fullCollection = findCollectionById(collectionsTree.value, collection.id)
  if (fullCollection) {
    emit('edit-collection', fullCollection)
  }
}

const handleDelete = (collection: Collection) => {
  const fullCollection = findCollectionById(collectionsTree.value, collection.id)
  if (fullCollection) {
    emit('delete-collection', fullCollection)
  }
}

// Вспомогательная функция для поиска коллекции по id
const findCollectionById = (collections: CollectionTree[], id: string): CollectionTree | null => {
  for (const collection of collections) {
    if (collection.id === id) {
      return collection
    }
    if (collection.children && collection.children.length > 0) {
      const found = findCollectionById(collection.children, id)
      if (found) {
        return found
      }
    }
  }
  return null
}

// Переключение раскрытия коллекции
const toggleCollectionExpanded = (collectionId: string) => {
  collectionsStore.toggleCollectionExpanded(collectionId)
}

const handleExport = (collection: CollectionTree) => {
  emit('export-collection', collection)
}

const handleAddChild = (parentCollection: CollectionTree) => {
  emit('add-child-collection', parentCollection)
}

const handleToggleFavorite = async (collection: CollectionTree) => {
  await collectionsStore.toggleFavorite(collection.id)
  emit('toggle-favorite', collection)
}

const handleTogglePublic = async (collection: CollectionTree) => {
  await collectionsStore.togglePublic(collection.id)
  emit('toggle-public', collection)
}

// Отслеживание изменений поискового запроса
watch(searchQuery, newQuery => {
  // Если есть поисковый запрос, автоматически разворачиваем все узлы
  if (newQuery.trim()) {
    const expandAll = (collections: CollectionTree[]) => {
      collections.forEach(collection => {
        collection.isExpanded = true
        if (collection.children) {
          expandAll(collection.children)
        }
      })
    }
    expandAll(collectionsTree.value)
  }
})

// Инициализация при монтировании
onMounted(async () => {
  if (collectionsTree.value.length === 0) {
    await collectionsStore.fetchCollections()
  }
})
</script>
