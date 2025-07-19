<template>
  <div class="collection-list">
    <!-- Header с кнопкой создания -->
    <div class="flex items-center justify-between mb-6 p-4 border-b-2 border-black">
      <h2 class="text-2xl font-bold tracking-wide uppercase">
        Коллекции
        <span class="text-sm font-normal opacity-60">({{ collections.length }})</span>
      </h2>
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-black text-white font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors duration-200 border-2 border-black hover:shadow-lg hover:transform hover:scale-105 active:scale-95 transition-all"
      >
        + Создать
      </button>
    </div>

    <!-- Фильтры и поиск -->
    <div class="mb-6 space-y-4">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск коллекций..."
          class="w-full p-3 pl-10 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium placeholder-gray-500"
        />
        <div class="absolute left-3 top-1/2 transform -translate-y-1/2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
      </div>

      <div class="flex space-x-2">
        <button
          v-for="filter in filters"
          :key="filter.key"
          @click="toggleFilter(filter.key)"
          :class="[
            'px-3 py-1 border-2 border-black font-bold uppercase text-sm tracking-wide transition-all duration-200',
            activeFilters.includes(filter.key)
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-gray-100',
          ]"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Loading состояние -->
    <div v-if="loading" class="space-y-4">
      <div
        v-for="i in 3"
        :key="i"
        class="h-24 bg-gray-100 border-2 border-black animate-pulse"
      ></div>
    </div>

    <!-- Пустое состояние -->
    <div v-else-if="filteredCollections.length === 0" class="text-center py-12">
      <div class="mb-4">
        <svg
          class="w-16 h-16 mx-auto opacity-30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          ></path>
        </svg>
      </div>
      <h3 class="text-xl font-bold mb-2 uppercase tracking-wide">Коллекций не найдено</h3>
      <p class="text-gray-600 mb-4">
        {{
          searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Создайте свою первую коллекцию'
        }}
      </p>
      <button
        v-if="!searchQuery"
        @click="openCreateModal"
        class="px-6 py-2 bg-black text-white font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors duration-200 border-2 border-black"
      >
        Создать коллекцию
      </button>
    </div>

    <!-- Список коллекций -->
    <div v-else class="space-y-4">
      <TransitionGroup name="collection-list" tag="div">
        <CollectionItem
          v-for="collection in filteredCollections"
          :key="collection.id"
          :collection="collection"
          @edit="openEditModal"
          @delete="openDeleteModal"
          @select="selectCollection"
        />
      </TransitionGroup>
    </div>

    <!-- Пагинация -->
    <div v-if="totalPages > 1" class="flex justify-center mt-8 space-x-2">
      <button
        v-for="page in displayedPages"
        :key="page"
        @click="currentPage = page"
        :class="[
          'px-3 py-2 border-2 border-black font-bold transition-all duration-200',
          page === currentPage
            ? 'bg-black text-white'
            : 'bg-white text-black hover:bg-gray-100 hover:transform hover:scale-105',
        ]"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCollectionsStore } from '@/stores/collections'
import CollectionItem from './CollectionItem.vue'
import type { Collection } from '@/types/database'

// Store
const collectionsStore = useCollectionsStore()
const { collections, loading } = storeToRefs(collectionsStore)

// Реактивные данные
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(12)
const activeFilters = ref<string[]>([])

// Фильтры
const filters = [
  { key: 'all', label: 'Все' },
  { key: 'public', label: 'Публичные' },
  { key: 'private', label: 'Приватные' },
  { key: 'recent', label: 'Недавние' },
  { key: 'favorites', label: 'Избранные' },
]

// Вычисляемые свойства
const filteredCollections = computed(() => {
  let filtered = collections.value

  // Поиск
  if (searchQuery.value) {
    filtered = filtered.filter(
      collection =>
        collection.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        collection.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Фильтры
  if (activeFilters.value.length > 0 && !activeFilters.value.includes('all')) {
    filtered = filtered.filter(collection => {
      return activeFilters.value.some(filter => {
        switch (filter) {
          case 'public':
            return collection.is_public
          case 'private':
            return !collection.is_public
          case 'recent':
            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)
            return new Date(collection.created_at) > weekAgo
          case 'favorites':
            return collection.is_favorite
          default:
            return true
        }
      })
    })
  }

  // Пагинация
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filtered.slice(start, end)
})

const totalPages = computed(() => {
  const total = collections.value.length
  return Math.ceil(total / itemsPerPage.value)
})

const displayedPages = computed(() => {
  const pages = []
  const maxVisible = 5
  const half = Math.floor(maxVisible / 2)

  let start = Math.max(1, currentPage.value - half)
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Методы
const toggleFilter = (filterKey: string) => {
  if (filterKey === 'all') {
    activeFilters.value = ['all']
  } else {
    const index = activeFilters.value.indexOf(filterKey)
    if (index === -1) {
      activeFilters.value = activeFilters.value.filter(f => f !== 'all')
      activeFilters.value.push(filterKey)
    } else {
      activeFilters.value.splice(index, 1)
    }

    if (activeFilters.value.length === 0) {
      activeFilters.value = ['all']
    }
  }
  currentPage.value = 1
}

const openCreateModal = () => {
  // Emit событие для открытия модального окна создания
  emit('openCreateModal')
}

const openEditModal = (collection: Collection) => {
  emit('openEditModal', collection)
}

const openDeleteModal = (collection: Collection) => {
  emit('openDeleteModal', collection)
}

const selectCollection = (collection: Collection) => {
  collectionsStore.selectCollection(collection)
  emit('selectCollection', collection)
}

// События
const emit = defineEmits<{
  openCreateModal: []
  openEditModal: [collection: Collection]
  openDeleteModal: [collection: Collection]
  selectCollection: [collection: Collection]
}>()

// Инициализация
onMounted(async () => {
  if (collections.value.length === 0) {
    await collectionsStore.fetchCollections()
  }
  activeFilters.value = ['all']
})
</script>

<style scoped>
/* Анимации для списка коллекций */
.collection-list-enter-active,
.collection-list-leave-active {
  transition: all 0.3s ease;
}

.collection-list-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.collection-list-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.collection-list-move {
  transition: transform 0.3s ease;
}

/* Манга стиль эффекты */
.collection-list {
  font-family:
    'Inter',
    system-ui,
    -apple-system,
    sans-serif;
}

/* Кастомные скроллбары */
.collection-list::-webkit-scrollbar {
  width: 8px;
}

.collection-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border: 1px solid #000;
}

.collection-list::-webkit-scrollbar-thumb {
  background: #000;
  border-radius: 0;
}

.collection-list::-webkit-scrollbar-thumb:hover {
  background: #333;
}
</style>
