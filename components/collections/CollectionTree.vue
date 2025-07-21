<template>
  <div class="collection-tree">
    <!-- Заголовок с действиями -->
    <div class="flex items-center justify-between p-4 border-b-2 border-black">
      <h2 class="font-bold text-lg uppercase tracking-wide">Коллекции</h2>

      <div class="flex items-center space-x-2">
        <!-- Кнопка создания новой коллекции -->
        <button
          @click="$emit('create-collection')"
          class="w-8 h-8 border-2 border-black bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors duration-150"
          title="Создать коллекцию"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
        </button>

        <!-- Кнопка развернуть/свернуть все -->
        <button
          @click="toggleAllExpanded"
          class="w-8 h-8 border-2 border-black bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors duration-150"
          :title="allExpanded ? 'Свернуть все' : 'Развернуть все'"
        >
          <svg
            class="w-4 h-4 transition-transform duration-200"
            :class="{ 'rotate-180': allExpanded }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </button>

        <!-- Кнопка настроек -->
        <button
          @click="$emit('open-settings')"
          class="w-8 h-8 border-2 border-black bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors duration-150"
          title="Настройки коллекций"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            ></path>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            ></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Поиск по коллекциям -->
    <div class="p-4 border-b-2 border-black">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск коллекций..."
          class="w-full p-3 pr-10 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
        />
        <svg
          class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>
    </div>

    <!-- Статистика -->
    <div class="p-4 border-b-2 border-black bg-gray-50">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <div class="font-bold text-lg">{{ totalCollections }}</div>
          <div class="text-xs text-gray-600 uppercase">Коллекций</div>
        </div>
        <div>
          <div class="font-bold text-lg">{{ totalLinks }}</div>
          <div class="text-xs text-gray-600 uppercase">Ссылок</div>
        </div>
        <div>
          <div class="font-bold text-lg">{{ favoriteCollections }}</div>
          <div class="text-xs text-gray-600 uppercase">Избранных</div>
        </div>
      </div>
    </div>

    <!-- Дерево коллекций -->
    <div class="flex-1 overflow-y-auto">
      <!-- Загрузка -->
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        <p class="mt-2 text-sm text-gray-600">Загрузка коллекций...</p>
      </div>

      <!-- Пустое состояние -->
      <div v-else-if="!loading && filteredCollections.length === 0" class="p-8 text-center">
        <div
          class="w-16 h-16 mx-auto mb-4 border-2 border-black bg-gray-100 flex items-center justify-center"
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

        <button
          v-if="!searchQuery"
          @click="$emit('create-collection')"
          class="px-4 py-2 border-2 border-black bg-white text-sm font-bold uppercase hover:bg-black hover:text-white transition-colors duration-150"
        >
          Создать коллекцию
        </button>
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
    <div class="p-4 border-t-2 border-black bg-gray-50">
      <div class="flex items-center justify-between text-xs text-gray-600">
        <span>Обновлено: {{ lastUpdated }}</span>

        <div class="flex items-center space-x-2">
          <button
            @click="refreshCollections"
            class="px-2 py-1 border border-black text-xs uppercase hover:bg-black hover:text-white transition-colors duration-150"
          >
            Обновить
          </button>

          <button
            @click="$emit('import-collections')"
            class="px-2 py-1 border border-black text-xs uppercase hover:bg-black hover:text-white transition-colors duration-150"
          >
            Импорт
          </button>
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
  collectionsStore.updateCollectionsExpanded(collectionsTree.value)
}

const refreshCollections = async () => {
  await collectionsStore.fetchCollections()
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
