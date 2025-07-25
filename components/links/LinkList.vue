<template>
  <div class="space-y-6">
    <!-- Заголовок и фильтры -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-xl font-semibold text-zinc-900">
          {{ title }}
        </h2>
        <p v-if="description" class="text-sm text-zinc-600 mt-1">
          {{ description }}
        </p>
      </div>

      <!-- Действия -->
      <div class="flex items-center space-x-3">
        <!-- Поиск -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search links..."
            class="pl-8 pr-4 py-2 w-64 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
          />
          <svg
            class="absolute left-2.5 top-2.5 w-4 h-4 text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <!-- Вид -->
        <div class="flex border border-zinc-300 rounded-md">
          <button
            @click="viewSettings.view_type = 'grid'"
            class="p-2 border-r border-zinc-300 last:border-r-0"
            :class="{
              'bg-zinc-900 text-white': viewSettings.view_type === 'grid',
              'bg-white text-zinc-600 hover:bg-zinc-50': viewSettings.view_type !== 'grid',
            }"
            title="Grid view"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
          <button
            @click="viewSettings.view_type = 'list'"
            class="p-2 border-r border-zinc-300 last:border-r-0"
            :class="{
              'bg-zinc-900 text-white': viewSettings.view_type === 'list',
              'bg-white text-zinc-600 hover:bg-zinc-50': viewSettings.view_type !== 'list',
            }"
            title="List view"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <button
            @click="viewSettings.view_type = 'compact'"
            class="p-2"
            :class="{
              'bg-zinc-900 text-white': viewSettings.view_type === 'compact',
              'bg-white text-zinc-600 hover:bg-zinc-50': viewSettings.view_type !== 'compact',
            }"
            title="Compact view"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M3 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>

        <!-- Добавить ссылку -->
        <UiButton @click="$emit('add-link')">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Link
        </UiButton>
      </div>
    </div>

    <!-- Фильтры -->
    <div
      v-if="showFilters"
      class="flex flex-wrap items-center gap-3 p-4 bg-zinc-50 border border-zinc-200 rounded-lg"
    >
      <!-- Избранное -->
      <button
        @click="toggleFavoriteFilter"
        class="px-3 py-1 rounded-full text-sm transition-colors"
        :class="{
          'bg-rose-500 text-white': filters.is_favorite === true,
          'bg-zinc-200 text-zinc-700 hover:bg-zinc-300': filters.is_favorite !== true,
        }"
      >
        <svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
        Favorites
      </button>

      <!-- Сортировка -->
      <select
        v-model="sortField"
        class="px-3 py-1 border border-zinc-300 rounded-md text-sm bg-white"
      >
        <option value="created_at">Date Added</option>
        <option value="title">Title</option>
        <option value="visit_count">Most Visited</option>
        <option value="last_visited_at">Last Visited</option>
      </select>

      <button
        @click="toggleSortDirection"
        class="p-1 border border-zinc-300 rounded-md bg-white hover:bg-zinc-50"
      >
        <svg
          class="w-4 h-4 transition-transform"
          :class="{ 'rotate-180': sortDirection === 'desc' }"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <!-- Очистить фильтры -->
      <button
        v-if="hasActiveFilters"
        @click="clearFilters"
        class="px-3 py-1 text-sm text-zinc-600 hover:text-zinc-900"
      >
        Clear filters
      </button>
    </div>

    <!-- Список ссылок -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-6 h-6 border border-zinc-300 border-t-zinc-600 rounded-full animate-spin"></div>
      <span class="ml-3 text-sm text-zinc-600">Loading links...</span>
    </div>

    <div v-else-if="filteredLinks.length === 0" class="text-center py-12">
      <svg
        class="w-12 h-12 text-zinc-400 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
      <h3 class="text-lg font-medium text-zinc-900 mb-2">No links found</h3>
      <p class="text-zinc-600 mb-4">
        {{ searchQuery ? 'Try adjusting your search terms.' : 'Start by adding your first link.' }}
      </p>
      <UiButton @click="$emit('add-link')">Add Your First Link</UiButton>
    </div>

    <!-- Grid View -->
    <div
      v-else-if="viewSettings.view_type === 'grid'"
      class="grid gap-4"
      :class="{
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': viewSettings.cards_per_row === 3,
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4': viewSettings.cards_per_row === 4,
        'grid-cols-1 sm:grid-cols-2': viewSettings.cards_per_row === 2,
      }"
    >
      <LinkCard
        v-for="link in filteredLinks"
        :key="link.id"
        :link="link"
        :view-settings="viewSettings"
        :is-selected="selectedLinks.includes(link.id)"
        @click="handleLinkClick"
        @toggle-favorite="toggleFavorite(link.id)"
        @menu="event => showLinkMenu(event, link)"
        @context-menu="event => showLinkMenu(event, link)"
      />
    </div>

    <!-- List View -->
    <div v-else-if="viewSettings.view_type === 'list'" class="space-y-2">
      <LinkListItem
        v-for="link in filteredLinks"
        :key="link.id"
        :link="link"
        :view-settings="viewSettings"
        :is-selected="selectedLinks.includes(link.id)"
        @click="handleLinkClick"
        @toggle-favorite="toggleFavorite(link.id)"
        @menu="event => showLinkMenu(event, link)"
        @context-menu="event => showLinkMenu(event, link)"
      />
    </div>

    <!-- Compact View -->
    <div v-else class="space-y-1">
      <LinkCompactItem
        v-for="link in filteredLinks"
        :key="link.id"
        :link="link"
        :view-settings="viewSettings"
        :is-selected="selectedLinks.includes(link.id)"
        @click="handleLinkClick"
        @toggle-favorite="toggleFavorite(link.id)"
        @menu="event => showLinkMenu(event, link)"
        @context-menu="event => showLinkMenu(event, link)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useLinksStore } from '../../stores/links'
import LinkCard from './LinkCard.vue'
import LinkListItem from './LinkListItem.vue'
import LinkCompactItem from './LinkCompactItem.vue'
import UiButton from '../ui/UiButton.vue'
import type { Link, LinkViewSettings } from '../../types/links'

interface Props {
  title?: string
  description?: string
  collectionId?: string
  showFilters?: boolean
  initialViewSettings?: Partial<LinkViewSettings>
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Links',
  description: '',
  collectionId: '',
  showFilters: true,
  initialViewSettings: () => ({}),
})

const emit = defineEmits<{
  'add-link': []
  'link-click': [link: Link]
  'link-menu': [event: MouseEvent, link: Link]
}>()

const linksStore = useLinksStore()
const { filteredLinks, loading, filters } = storeToRefs(linksStore)

const searchQuery = ref('')
const selectedLinks = ref<string[]>([])
const sortField = ref<'created_at' | 'title' | 'visit_count' | 'last_visited_at'>('created_at')
const sortDirection = ref<'asc' | 'desc'>('desc')

const viewSettings = ref<LinkViewSettings>({
  view_type: 'grid',
  cards_per_row: 3,
  show_description: true,
  show_metadata: true,
  show_tags: true,
  show_visit_count: true,
  ...props.initialViewSettings,
})

const hasActiveFilters = computed(() => {
  return (
    searchQuery.value ||
    filters.value.is_favorite !== undefined ||
    (filters.value.tags && filters.value.tags.length > 0)
  )
})

// Методы
const handleLinkClick = (link: Link) => {
  // Увеличиваем счетчик посещений
  linksStore.incrementVisitCount(link.id)

  // Открываем ссылку в новой вкладке
  window.open(link.url, '_blank')

  emit('link-click', link)
}

const toggleFavorite = async (linkId: string) => {
  await linksStore.toggleFavorite(linkId)
}

const showLinkMenu = (event: MouseEvent, link: Link) => {
  emit('link-menu', event, link)
}

const toggleFavoriteFilter = () => {
  const newValue = filters.value.is_favorite === true ? undefined : true
  linksStore.setFilters({ is_favorite: newValue })
}

const toggleSortDirection = () => {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  updateSorting()
}

const updateSorting = () => {
  linksStore.setSorting({
    field: sortField.value,
    direction: sortDirection.value,
  })
}

const clearFilters = () => {
  searchQuery.value = ''
  linksStore.clearFilters()
}

// Watchers
watch(searchQuery, newValue => {
  linksStore.setFilters({ search: newValue || undefined })
})

watch(sortField, () => {
  updateSorting()
})

// Инициализация
updateSorting()
</script>
