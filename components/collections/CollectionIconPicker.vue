<template>
  <div class="space-y-4">
    <!-- Предварительный просмотр выбранной иконки -->
    <div class="flex items-center space-x-3">
      <div class="w-8 h-8 border-2 border-black bg-white flex items-center justify-center">
        <component :is="getIconComponent(currentIcon)" class="w-5 h-5" />
      </div>
      <span class="text-sm font-medium uppercase">{{ getIconName(currentIcon) }}</span>
    </div>

    <!-- Поиск иконок -->
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Поиск иконки..."
        class="w-full p-3 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm pr-10"
      />
      <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
        <Search class="w-4 h-4 text-gray-500" />
      </div>
    </div>

    <!-- Сетка иконок -->
    <div
      class="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto border-2 border-black bg-gray-50 p-3"
    >
      <button
        v-for="iconKey in filteredIcons"
        :key="iconKey"
        type="button"
        @click="selectIcon(iconKey)"
        class="w-10 h-10 border-2 border-black bg-white flex items-center justify-center transition-all duration-150 hover:scale-105 hover:shadow-md group relative"
        :class="{
          'bg-black text-white': currentIcon === iconKey,
          'hover:bg-gray-100': currentIcon !== iconKey,
        }"
        :title="getIconName(iconKey)"
      >
        <component :is="getIconComponent(iconKey)" class="w-4 h-4" />

        <!-- Tooltip -->
        <div
          class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-10 pointer-events-none"
        >
          {{ getIconName(iconKey) }}
        </div>
      </button>
    </div>

    <!-- Категории иконок -->
    <div class="space-y-2">
      <label class="block text-xs font-medium uppercase">Категории</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="category in iconCategories"
          :key="category.key"
          type="button"
          @click="filterByCategory(category.key)"
          class="px-3 py-1 border-2 border-black bg-white text-xs font-medium uppercase transition-colors duration-150 hover:bg-gray-100"
          :class="{
            'bg-black text-white': selectedCategory === category.key,
          }"
        >
          {{ category.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { COLLECTION_ICONS, ICON_NAMES } from '../../utils/constants'
import {
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
  Search,
} from 'lucide-vue-next'

interface Props {
  currentIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentIcon: 'folder',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Поиск и фильтрация
const searchQuery = ref('')
const selectedCategory = ref('all')

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

// Категории иконок
const iconCategories = [
  { key: 'all', label: 'Все' },
  { key: 'general', label: 'Общие' },
  { key: 'content', label: 'Контент' },
  { key: 'work', label: 'Работа' },
  { key: 'personal', label: 'Личное' },
]

// Категоризация иконок
const iconsByCategory = {
  general: ['folder', 'folder-open', 'star', 'bookmark', 'tag', 'archive', 'settings'],
  content: ['book', 'music', 'image', 'video', 'code'],
  work: ['briefcase', 'globe', 'lock'],
  personal: ['heart', 'coffee', 'home', 'user', 'gamepad2', 'shopping-cart'],
}

// Фильтрованные иконки
const filteredIcons = computed(() => {
  let icons = COLLECTION_ICONS

  // Фильтрация по категории
  if (selectedCategory.value !== 'all') {
    icons = iconsByCategory[selectedCategory.value as keyof typeof iconsByCategory] || []
  }

  // Фильтрация по поиску
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    icons = icons.filter(iconKey => {
      const name = getIconName(iconKey).toLowerCase()
      return name.includes(query) || iconKey.toLowerCase().includes(query)
    })
  }

  return icons
})

// Получить компонент иконки
const getIconComponent = (iconKey: string) => {
  return iconComponents[iconKey as keyof typeof iconComponents] || Folder
}

// Получить название иконки
const getIconName = (iconKey: string): string => {
  return ICON_NAMES[iconKey as keyof typeof ICON_NAMES] || iconKey
}

// Выбрать иконку
const selectIcon = (iconKey: string) => {
  emit('update:modelValue', iconKey)
}

// Фильтровать по категории
const filterByCategory = (category: string) => {
  selectedCategory.value = category
  searchQuery.value = ''
}

// Отслеживание изменений текущей иконки
watch(
  () => props.currentIcon,
  () => {
    // Можно добавить дополнительную логику при изменении иконки
  }
)
</script>

<style scoped>
/* Кастомизация скроллбара для сетки иконок */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #000;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #333;
}
</style>
