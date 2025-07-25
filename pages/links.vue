<template>
  <div class="min-h-screen bg-zinc-50">
    <!-- Навигация -->
    <LayoutHeader />

    <div class="flex">
      <!-- Сайдбар -->
      <LayoutSidebar />

      <!-- Основной контент -->
      <main class="flex-1 p-6">
        <div class="max-w-7xl mx-auto">
          <!-- Заголовок страницы -->
          <div class="mb-6">
            <h1 class="text-2xl font-bold text-zinc-900 mb-2">Links</h1>
            <p class="text-zinc-600">Manage and organize your saved links</p>
          </div>

          <!-- Список ссылок -->
          <LinkList
            title="All Links"
            description="Browse and manage all your saved links"
            :collection-id="selectedCollectionId"
            @add-link="showAddLinkModal = true"
            @link-click="handleLinkClick"
            @link-menu="handleLinkMenu"
          />
        </div>
      </main>
    </div>

    <!-- Модальные окна -->
    <AddEditLinkModal
      :show="showAddLinkModal"
      :collection-id="selectedCollectionId"
      @close="showAddLinkModal = false"
      @success="handleLinkAdded"
    />

    <AddEditLinkModal
      :show="showEditLinkModal"
      :link="selectedLink"
      :is-edit="true"
      @close="closeEditModal"
      @success="handleLinkUpdated"
    />

    <DeleteLinkModal
      :show="showDeleteLinkModal"
      :link="selectedLink"
      @cancel="showDeleteLinkModal = false"
      @success="handleLinkDeleted"
    />

    <!-- Контекстное меню -->
    <div
      v-if="contextMenu.show"
      class="fixed z-50 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 min-w-[160px]"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      @click.stop
    >
      <button
        @click="openLink"
        class="w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 flex items-center space-x-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
        <span>Open Link</span>
      </button>

      <button
        @click="copyLink"
        class="w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 flex items-center space-x-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <span>Copy URL</span>
      </button>

      <button
        @click="toggleFavorite"
        class="w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 flex items-center space-x-2"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
        <span>{{ selectedLink?.is_favorite ? 'Remove from Favorites' : 'Add to Favorites' }}</span>
      </button>

      <hr class="my-1 border-zinc-200" />

      <button
        @click="editLink"
        class="w-full px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 flex items-center space-x-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        <span>Edit Link</span>
      </button>

      <button
        @click="deleteLink"
        class="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        <span>Delete Link</span>
      </button>
    </div>

    <!-- Backdrop для закрытия меню -->
    <div v-if="contextMenu.show" class="fixed inset-0 z-40" @click="closeContextMenu"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useLinksStore } from '../stores/links'
import { useCollectionsStore } from '../stores/collections'
import LayoutHeader from '../components/layout/LayoutHeader.vue'
import LayoutSidebar from '../components/layout/LayoutSidebar.vue'
import LinkList from '../components/links/LinkList.vue'
import AddEditLinkModal from '../components/links/modals/AddEditLinkModal.vue'
import DeleteLinkModal from '../components/links/modals/DeleteLinkModal.vue'
import type { Link } from '../types/links'

// Заголовок страницы
useHead({
  title: 'Links - Lynkr',
})

const linksStore = useLinksStore()
const collectionsStore = useCollectionsStore()

// Состояние
const showAddLinkModal = ref(false)
const showEditLinkModal = ref(false)
const showDeleteLinkModal = ref(false)
const selectedLink = ref<Link | null>(null)
const selectedCollectionId = ref<string>('')

// Контекстное меню
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
})

// Методы
const handleLinkClick = (link: Link) => {
  // Логика уже в LinkList компоненте
}

const handleLinkMenu = (event: MouseEvent, link: Link) => {
  selectedLink.value = link
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
  }
}

const closeContextMenu = () => {
  contextMenu.value.show = false
  selectedLink.value = null
}

const openLink = () => {
  if (selectedLink.value) {
    window.open(selectedLink.value.url, '_blank')
    linksStore.incrementVisitCount(selectedLink.value.id)
  }
  closeContextMenu()
}

const copyLink = async () => {
  if (selectedLink.value) {
    try {
      await navigator.clipboard.writeText(selectedLink.value.url)
      // Можно добавить уведомление об успехе
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }
  closeContextMenu()
}

const toggleFavorite = async () => {
  if (selectedLink.value) {
    await linksStore.toggleFavorite(selectedLink.value.id)
  }
  closeContextMenu()
}

const editLink = () => {
  showEditLinkModal.value = true
  closeContextMenu()
}

const deleteLink = () => {
  showDeleteLinkModal.value = true
  closeContextMenu()
}

const closeEditModal = () => {
  showEditLinkModal.value = false
  selectedLink.value = null
}

const handleLinkAdded = (link: Link) => {
  // Ссылка уже добавлена в store
  console.log('Link added:', link)
}

const handleLinkUpdated = (link: Link) => {
  selectedLink.value = null
  console.log('Link updated:', link)
}

const handleLinkDeleted = () => {
  showDeleteLinkModal.value = false
  selectedLink.value = null
  console.log('Link deleted')
}

// Закрытие контекстного меню по Escape
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeContextMenu()
  }
}

// Lifecycle
onMounted(async () => {
  // Загружаем ссылки и коллекции
  await Promise.all([linksStore.fetchLinks(), collectionsStore.loadMockData()])

  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>
