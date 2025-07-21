<template>
  <nav class="flex items-center space-x-2 py-3" aria-label="Навигация по коллекциям">
    <!-- Домашняя страница -->
    <button
      @click="$emit('navigate', null)"
      class="flex items-center space-x-2 px-3 py-2 border-2 border-black bg-white text-sm font-medium uppercase hover:bg-gray-100 transition-colors duration-150"
      :class="{ 'bg-black text-white': !currentCollectionId }"
    >
      <Home class="w-4 h-4" />
      <span>Главная</span>
    </button>

    <!-- Разделитель -->
    <ChevronRight v-if="breadcrumbs.length > 0" class="w-4 h-4 text-gray-500" />

    <!-- Хлебные крошки -->
    <template v-for="(breadcrumb, index) in breadcrumbs" :key="breadcrumb.id">
      <button
        @click="$emit('navigate', breadcrumb.id)"
        class="flex items-center space-x-2 px-3 py-2 border-2 border-black bg-white text-sm font-medium uppercase hover:bg-gray-100 transition-colors duration-150 max-w-xs"
        :class="{
          'bg-black text-white': currentCollectionId === breadcrumb.id,
          truncate: breadcrumb.name.length > 20,
        }"
        :title="breadcrumb.name"
      >
        <!-- Иконка коллекции -->
        <div
          class="w-4 h-4 border-l-2 flex items-center justify-center"
          :style="{ borderLeftColor: breadcrumb.color || '#9aa0a6' }"
        >
          <component :is="getIconComponent(breadcrumb.icon)" class="w-3 h-3" />
        </div>

        <span class="truncate">{{ breadcrumb.name }}</span>
      </button>

      <!-- Разделитель между крошками -->
      <ChevronRight v-if="index < breadcrumbs.length - 1" class="w-4 h-4 text-gray-500" />
    </template>

    <!-- Действия -->
    <div class="flex items-center space-x-2 ml-auto">
      <!-- Кнопка "Наверх" если не на главной -->
      <button
        v-if="breadcrumbs.length > 0"
        @click="goUp"
        class="p-2 border-2 border-black bg-white text-sm hover:bg-gray-100 transition-colors duration-150"
        title="Вверх на один уровень"
      >
        <ArrowUp class="w-4 h-4" />
      </button>

      <!-- Кнопка создания подколлекции -->
      <button
        @click="$emit('create-subcollection', currentCollectionId)"
        class="flex items-center space-x-2 px-3 py-2 border-2 border-black bg-black text-white text-sm font-medium uppercase hover:bg-gray-800 transition-colors duration-150"
      >
        <Plus class="w-4 h-4" />
        <span>Создать</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCollectionsStore } from '../../../stores/collections'
import type { Collection } from '../../../types'
import {
  Home,
  ChevronRight,
  ArrowUp,
  Plus,
  Folder,
  FolderOpen,
  Star,
  Heart,
  Bookmark,
  Tag,
  Archive,
  Globe,
  Lock,
  Coffee,
  Briefcase,
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

interface Props {
  currentCollectionId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  currentCollectionId: null,
})

const emit = defineEmits<{
  navigate: [collectionId: string | null]
  'create-subcollection': [parentId: string | null]
}>()

const collectionsStore = useCollectionsStore()

// Компоненты иконок
const iconComponents = {
  folder: Folder,
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

// Хлебные крошки для текущей коллекции
const breadcrumbs = computed((): Collection[] => {
  if (!props.currentCollectionId) return []
  return collectionsStore.getCollectionBreadcrumbs(props.currentCollectionId)
})

// Получить компонент иконки
const getIconComponent = (iconName?: string) => {
  return iconComponents[iconName as keyof typeof iconComponents] || Folder
}

// Подняться на уровень вверх
const goUp = () => {
  if (breadcrumbs.value.length === 0) return

  if (breadcrumbs.value.length === 1) {
    // Если мы на первом уровне, идем на главную
    emit('navigate', null)
  } else {
    // Иначе идем к родительской коллекции
    const parentBreadcrumb = breadcrumbs.value[breadcrumbs.value.length - 2]
    emit('navigate', parentBreadcrumb.id)
  }
}
</script>

<style scoped>
/* Анимация появления хлебных крошек */
nav {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hover эффекты для кнопок */
button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}
</style>
