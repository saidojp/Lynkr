<template>
  <div class="space-y-4">
    <!-- Предварительный просмотр выбранной иконки -->
    <div class="flex items-center space-x-3">
      <div class="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center">
        <component :is="getIconComponent(currentIcon)" class="w-5 h-5 text-zinc-600" />
      </div>
      <span class="text-sm font-medium text-zinc-900">{{ getIconName(currentIcon) }}</span>
    </div>

    <!-- Поиск иконок -->
    <div class="relative">
      <UiInput v-model="searchQuery" placeholder="Search icons..." class="pl-10" />
      <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
    </div>

    <!-- Сетка иконок -->
    <div
      class="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto bg-zinc-50 border border-zinc-200 rounded-lg p-3"
    >
      <UiButton
        v-for="iconKey in filteredIcons"
        :key="iconKey"
        variant="ghost"
        size="icon"
        @click="selectIcon(iconKey)"
        class="relative group"
        :class="{
          'bg-zinc-900 text-white hover:bg-zinc-800': currentIcon === iconKey,
          'hover:bg-zinc-100': currentIcon !== iconKey,
        }"
        :title="getIconName(iconKey)"
      >
        <component :is="getIconComponent(iconKey)" class="w-4 h-4" />

        <!-- Tooltip -->
        <div
          class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-zinc-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-10 pointer-events-none"
        >
          {{ getIconName(iconKey) }}
        </div>
      </UiButton>
    </div>

    <!-- Категории иконок -->
    <div class="space-y-2">
      <UiLabel class="text-xs text-zinc-500 uppercase tracking-wide">Categories</UiLabel>
      <div class="flex flex-wrap gap-2">
        <UiButton
          v-for="category in iconCategories"
          :key="category.key"
          variant="outline"
          size="sm"
          @click="filterByCategory(category.key)"
          :class="{
            'bg-zinc-900 text-white border-zinc-900': selectedCategory === category.key,
          }"
        >
          {{ category.label }}
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { COLLECTION_ICONS, type IconKey } from '../../utils/icons'
import UiButton from '../ui/UiButton.vue'
import UiInput from '../ui/UiInput.vue'
import UiLabel from '../ui/UiLabel.vue'
import { Search } from 'lucide-vue-next'

interface Props {
  currentIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentIcon: 'folder',
})

const emit = defineEmits<{
  'update:icon': [icon: string]
}>()

const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)

// Категории иконок
const iconCategories = [
  { key: null, label: 'All' },
  { key: 'general', label: 'General' },
  { key: 'work', label: 'Work' },
  { key: 'media', label: 'Media' },
  { key: 'lifestyle', label: 'Lifestyle' },
]

// Все доступные иконки
const availableIcons = computed(() => Object.keys(COLLECTION_ICONS) as IconKey[])

// Фильтрация иконок по поиску и категории
const filteredIcons = computed(() => {
  let icons = availableIcons.value

  // Фильтр по поиску
  if (searchQuery.value.trim()) {
    icons = icons.filter(iconKey =>
      COLLECTION_ICONS[iconKey].label.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Фильтр по категории
  if (selectedCategory.value) {
    switch (selectedCategory.value) {
      case 'general':
        icons = icons.filter(key =>
          ['folder', 'folder-open', 'star', 'heart', 'bookmark'].includes(key)
        )
        break
      case 'work':
        icons = icons.filter(key => ['briefcase', 'settings', 'code', 'calendar'].includes(key))
        break
      case 'media':
        icons = icons.filter(key =>
          ['music', 'image', 'video', 'camera', 'headphones'].includes(key)
        )
        break
      case 'lifestyle':
        icons = icons.filter(key => ['home', 'coffee', 'car', 'plane', 'gift'].includes(key))
        break
    }
  }

  return icons
})

// Получить компонент иконки
const getIconComponent = (iconKey: string) => {
  return COLLECTION_ICONS[iconKey as IconKey]?.component || COLLECTION_ICONS.folder.component
}

// Получить имя иконки
const getIconName = (iconKey: string) => {
  return COLLECTION_ICONS[iconKey as IconKey]?.label || 'Folder'
}

// Выбрать иконку
const selectIcon = (iconKey: string) => {
  emit('update:icon', iconKey)
}

// Фильтр по категории
const filterByCategory = (categoryKey: string | null) => {
  selectedCategory.value = categoryKey
}

// Сброс поиска при изменении категории
watch(selectedCategory, () => {
  searchQuery.value = ''
})
</script>
