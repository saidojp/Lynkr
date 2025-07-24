<template>
  <UiCard
    class="collection-item relative cursor-pointer group hover:shadow-lg transition-all duration-200"
    @click="$emit('select', collection)"
    :class="{ 'ring-2 ring-zinc-900 ring-offset-2': isSelected }"
  >
    <!-- Статус индикатор -->
    <div
      class="absolute top-3 right-3 w-2 h-2 rounded-full"
      :class="collection.is_public ? 'bg-green-500' : 'bg-red-500'"
    ></div>

    <!-- Цветовая полоска -->
    <div
      class="absolute top-0 left-0 w-full h-1 rounded-t-lg"
      :style="{ backgroundColor: collection.color || '#9aa0a6' }"
    ></div>

    <div class="p-6 pt-7">
      <!-- Header с иконкой и названием -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center space-x-3 flex-1">
          <!-- Иконка коллекции -->
          <div
            class="w-12 h-12 border border-zinc-200 bg-zinc-50 rounded-lg flex items-center justify-center group-hover:bg-zinc-100 transition-colors duration-200"
          >
            <component :is="getIconComponent(collection.icon)" class="w-6 h-6 text-zinc-700" />
          </div>

          <!-- Название и описание -->
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-bold uppercase tracking-wide truncate mb-1">
              {{ collection.name }}
            </h3>
            <p
              v-if="collection.description"
              class="text-sm text-gray-600 line-clamp-2 leading-relaxed"
            >
              {{ collection.description }}
            </p>
          </div>
        </div>

        <!-- Меню действий -->
        <div class="relative">
          <UiButton @click.stop="toggleMenu" variant="ghost" size="sm" class="h-8 w-8 p-0">
            <MoreVertical class="w-4 h-4" />
          </UiButton>

          <!-- Выпадающее меню -->
          <div
            v-if="showMenu"
            class="absolute right-0 top-full mt-2 w-48 bg-white border border-zinc-200 rounded-lg shadow-lg z-10 py-1"
          >
            <button
              @click.stop="editCollection"
              class="w-full px-4 py-2 text-left hover:bg-zinc-50 text-sm flex items-center space-x-2"
            >
              <Edit2 class="w-4 h-4" />
              <span>Редактировать</span>
            </button>
            <button
              @click.stop="duplicateCollection"
              class="w-full px-4 py-2 text-left hover:bg-zinc-50 text-sm flex items-center space-x-2"
            >
              <Copy class="w-4 h-4" />
              <span>Дублировать</span>
            </button>
            <button
              @click.stop="toggleFavorite"
              class="w-full px-4 py-2 text-left hover:bg-zinc-50 text-sm flex items-center space-x-2"
            >
              <Heart
                class="w-4 h-4"
                :class="{ 'fill-red-500 text-red-500': collection.is_favorite }"
              />
              <span>{{ collection.is_favorite ? 'Убрать из избранного' : 'В избранное' }}</span>
            </button>
            <button
              @click.stop="toggleVisibility"
              class="w-full px-4 py-2 text-left hover:bg-zinc-50 text-sm flex items-center space-x-2"
            >
              <component :is="collection.is_public ? Lock : Globe" class="w-4 h-4" />
              <span>{{ collection.is_public ? 'Сделать приватной' : 'Сделать публичной' }}</span>
            </button>
            <button
              @click.stop="deleteCollection"
              class="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 text-sm flex items-center space-x-2"
            >
              <Trash2 class="w-4 h-4" />
              <span>Удалить</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Статистика -->
      <div class="flex items-center justify-between text-sm text-zinc-600">
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-1">
            <Link class="w-4 h-4" />
            <span>{{ collection.links_count || 0 }} ссылок</span>
          </div>

          <div v-if="collection.children_count" class="flex items-center space-x-1">
            <Folder class="w-4 h-4" />
            <span>{{ collection.children_count }} подколлекций</span>
          </div>
        </div>

        <div class="text-zinc-400 text-xs">
          {{ formatDate(collection.updated_at) }}
        </div>
      </div>

      <!-- Теги/метки -->
      <div v-if="collection.tags && collection.tags.length > 0" class="mt-3 flex flex-wrap gap-1">
        <span
          v-for="tag in collection.tags.slice(0, 3)"
          :key="tag"
          class="px-2 py-1 text-xs font-bold bg-gray-200 border border-gray-400 uppercase tracking-wide"
        >
          {{ tag }}
        </span>
        <span
          v-if="collection.tags.length > 3"
          class="px-2 py-1 text-xs font-bold bg-gray-300 border border-gray-400 uppercase tracking-wide"
        >
          +{{ collection.tags.length - 3 }}
        </span>
      </div>

      <!-- Избранное сердечко -->
      <div v-if="collection.is_favorite" class="absolute top-4 right-8 text-red-500">❤️</div>
    </div>

    <!-- Прогресс бар (если есть данные о заполненности) -->
    <div
      v-if="collection.completion_percentage !== undefined"
      class="absolute bottom-0 left-0 w-full h-1 bg-zinc-200 rounded-b-lg"
    >
      <div
        class="h-full bg-zinc-900 transition-all duration-300 rounded-b-lg"
        :style="{ width: `${collection.completion_percentage}%` }"
      ></div>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCollectionsStore } from '../../stores/collections'
import type { Collection } from '../../types/database'
import {
  MoreVertical,
  Edit2,
  Copy,
  Heart,
  Lock,
  Globe,
  Trash2,
  Link,
  Folder,
} from 'lucide-vue-next'

// Props
interface Props {
  collection: Collection
  isSelected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
})

// Store
const collectionsStore = useCollectionsStore()

// Reactive data
const showMenu = ref(false)

// Events
const emit = defineEmits<{
  select: [collection: Collection]
  edit: [collection: Collection]
  delete: [collection: Collection]
  duplicate: [collection: Collection]
}>()

// Computed
const isSelected = computed(() => {
  return collectionsStore.selectedCollection?.id === props.collection.id
})

// Methods
const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const editCollection = () => {
  showMenu.value = false
  emit('edit', props.collection)
}

const deleteCollection = () => {
  showMenu.value = false
  emit('delete', props.collection)
}

const duplicateCollection = async () => {
  showMenu.value = false
  try {
    // TODO: Implement duplication in store
    console.log('Duplicate collection:', props.collection.id)
    emit('duplicate', props.collection)
  } catch (error) {
    console.error('Error duplicating collection:', error)
  }
}

const toggleFavorite = async () => {
  showMenu.value = false
  try {
    // TODO: Implement toggle favorite in store
    console.log('Toggle favorite:', props.collection.id)
    collectionsStore.updateCollection({
      id: props.collection.id,
      is_favorite: !props.collection.is_favorite,
    })
  } catch (error) {
    console.error('Error toggling favorite:', error)
  }
}

const toggleVisibility = async () => {
  showMenu.value = false
  try {
    // TODO: Implement toggle public in store
    console.log('Toggle visibility:', props.collection.id)
    collectionsStore.updateCollection({
      id: props.collection.id,
      is_public: !props.collection.is_public,
    })
  } catch (error) {
    console.error('Error toggling visibility:', error)
  }
}

const getIconComponent = (iconName?: string) => {
  // Возвращаем компонент иконки из lucide-vue-next
  // По умолчанию - folder icon
  if (!iconName) return 'FolderIcon'

  // Преобразуем имя иконки к формату компонента
  const componentName =
    iconName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') + 'Icon'

  return componentName
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Сегодня'
  if (diffDays === 1) return 'Вчера'
  if (diffDays < 7) return `${diffDays} дн. назад`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} нед. назад`
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} мес. назад`

  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Закрытие меню при клике вне
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.collection-item')) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Анимация для появления карточки */
.collection-item {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Кастомная обрезка текста */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Эффект тени в манга стиле */
.collection-item {
  position: relative;
}

.collection-item::before {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  right: -4px;
  bottom: -4px;
  background: rgba(0, 0, 0, 0.1);
  z-index: -1;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.collection-item:hover::before {
  opacity: 1;
}

/* Стилизация скроллбаров для меню */
.collection-item ::-webkit-scrollbar {
  width: 4px;
}

.collection-item ::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.collection-item ::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 0;
}

.collection-item ::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
