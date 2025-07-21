<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Заголовок -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold uppercase mb-4">Dashboard</h1>
        <p class="text-gray-600 max-w-2xl mx-auto">
          Добро пожаловать в систему управления коллекциями. Здесь вы можете организовать свои
          ссылки и закладки.
        </p>
      </div>

      <!-- Быстрые действия -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <!-- Коллекции -->
        <NuxtLink
          to="/collections"
          class="p-6 border-2 border-black bg-white hover:bg-gray-50 transition-colors duration-150 group"
        >
          <div class="flex items-center space-x-4">
            <div
              class="w-12 h-12 border-2 border-black bg-black text-white flex items-center justify-center group-hover:bg-gray-800"
            >
              <Folder class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-lg font-bold uppercase">Коллекции</h3>
              <p class="text-sm text-gray-600">Управление коллекциями</p>
            </div>
          </div>
          <div class="mt-4 text-2xl font-bold">{{ collectionsCount }}</div>
        </NuxtLink>

        <!-- Ссылки (заглушка) -->
        <div class="p-6 border-2 border-gray-300 bg-gray-50">
          <div class="flex items-center space-x-4">
            <div
              class="w-12 h-12 border-2 border-gray-300 bg-gray-300 text-gray-500 flex items-center justify-center"
            >
              <Link class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-lg font-bold uppercase text-gray-500">Ссылки</h3>
              <p class="text-sm text-gray-500">Скоро будет доступно</p>
            </div>
          </div>
          <div class="mt-4 text-2xl font-bold text-gray-500">0</div>
        </div>

        <!-- Теги (заглушка) -->
        <div class="p-6 border-2 border-gray-300 bg-gray-50">
          <div class="flex items-center space-x-4">
            <div
              class="w-12 h-12 border-2 border-gray-300 bg-gray-300 text-gray-500 flex items-center justify-center"
            >
              <Tag class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-lg font-bold uppercase text-gray-500">Теги</h3>
              <p class="text-sm text-gray-500">Скоро будет доступно</p>
            </div>
          </div>
          <div class="mt-4 text-2xl font-bold text-gray-500">0</div>
        </div>
      </div>

      <!-- Последние коллекции -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold uppercase">Последние коллекции</h2>
          <NuxtLink
            to="/collections"
            class="px-4 py-2 border-2 border-black bg-white text-sm font-bold uppercase hover:bg-gray-100"
          >
            Показать все
          </NuxtLink>
        </div>

        <!-- Загрузка -->
        <div v-if="loading" class="text-center py-8">
          <div class="inline-flex items-center space-x-2">
            <div
              class="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full"
            ></div>
            <span>Загрузка...</span>
          </div>
        </div>

        <!-- Последние коллекции -->
        <div
          v-else-if="recentCollections.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div
            v-for="collection in recentCollections"
            :key="collection.id"
            class="p-4 border-2 border-black bg-white hover:bg-gray-50 cursor-pointer transition-colors duration-150"
            @click="$router.push('/collections')"
          >
            <div class="flex items-center space-x-3">
              <div
                class="w-8 h-8 border-2 border-black bg-white flex items-center justify-center"
                :style="{ borderLeftColor: collection.color, borderLeftWidth: '4px' }"
              >
                <component :is="getIconComponent(collection.icon)" class="w-4 h-4" />
              </div>
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <h3 class="font-bold text-sm uppercase">{{ collection.name }}</h3>
                  <span v-if="collection.is_public" class="text-xs">🌐</span>
                  <span v-if="collection.is_favorite" class="text-xs">❤️</span>
                </div>
                <p v-if="collection.description" class="text-xs text-gray-600 mt-1 truncate">
                  {{ collection.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Пустое состояние -->
        <div v-else class="text-center py-8">
          <Folder class="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-bold text-gray-600 mb-2">Коллекций пока нет</h3>
          <p class="text-gray-500 mb-4">Создайте первую коллекцию для организации ваших ссылок</p>
          <NuxtLink
            to="/collections"
            class="inline-flex items-center space-x-2 px-4 py-2 bg-black text-white border-2 border-black font-medium uppercase hover:bg-gray-800"
          >
            <Plus class="w-4 h-4" />
            <span>Создать коллекцию</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCollectionsStore } from '../stores/collections'
import { Folder, Link, Tag, Plus } from 'lucide-vue-next'
import {
  Folder as FolderIcon,
  FolderOpen,
  Star,
  Heart,
  Bookmark,
  Archive,
  Globe,
  Lock,
  Coffee,
  Briefcase,
  Home,
  User,
  Settings,
  Book,
  Music,
  Image,
  Video,
  Code,
  Gamepad2,
  ShoppingCart,
} from 'lucide-vue-next'

// Store
const collectionsStore = useCollectionsStore()
const { collections, loading } = storeToRefs(collectionsStore)

// Компоненты иконок
const iconComponents = {
  folder: FolderIcon,
  'folder-open': FolderOpen,
  star: Star,
  heart: Heart,
  bookmark: Bookmark,
  tag: Tag,
  archive: Archive,
  globe: Globe,
  lock: Lock,
  coffee: Coffee,
  briefcase: Briefcase,
  home: Home,
  user: User,
  settings: Settings,
  book: Book,
  music: Music,
  image: Image,
  video: Video,
  code: Code,
  gamepad2: Gamepad2,
  'shopping-cart': ShoppingCart,
}

// Вычисляемые свойства
const collectionsCount = computed(() => collectionsStore.collectionsCount)

const recentCollections = computed(() => {
  return [...collections.value]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6)
})

// Получить компонент иконки
const getIconComponent = (iconName?: string) => {
  return iconComponents[iconName as keyof typeof iconComponents] || FolderIcon
}

// Инициализация
onMounted(async () => {
  try {
    await collectionsStore.initialize()
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
})
</script>
