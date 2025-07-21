<template>
  <div class="flex items-center space-x-1" @click.stop>
    <!-- Меню действий -->
    <div class="relative" ref="menuRef">
      <button
        @click="toggleMenu"
        class="p-1 rounded hover:bg-gray-200 transition-colors duration-150"
        :class="{ 'hover:bg-gray-600': isSelected }"
        title="Действия"
      >
        <MoreVertical class="w-3 h-3" />
      </button>

      <!-- Выпадающее меню -->
      <div
        v-if="showMenu"
        class="absolute right-0 top-full mt-1 w-48 bg-white border-2 border-black shadow-lg z-50"
        @click.stop
      >
        <div class="py-1">
          <!-- Редактировать -->
          <button
            @click="handleEdit"
            class="flex items-center space-x-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors duration-150"
          >
            <Edit2 class="w-4 h-4" />
            <span>Редактировать</span>
          </button>

          <!-- Создать подколлекцию -->
          <button
            @click="handleCreateSubcollection"
            class="flex items-center space-x-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors duration-150"
          >
            <FolderPlus class="w-4 h-4" />
            <span>Создать подколлекцию</span>
          </button>

          <!-- Разделитель -->
          <div class="border-t border-gray-200 my-1"></div>

          <!-- Переключить избранное -->
          <button
            @click="handleToggleFavorite"
            class="flex items-center space-x-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors duration-150"
          >
            <component :is="collection.is_favorite ? 'HeartOff' : 'Heart'" class="w-4 h-4" />
            <span>{{
              collection.is_favorite ? 'Убрать из избранного' : 'Добавить в избранное'
            }}</span>
          </button>

          <!-- Переключить видимость -->
          <button
            @click="handleToggleVisibility"
            class="flex items-center space-x-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors duration-150"
          >
            <component :is="collection.is_public ? 'EyeOff' : 'Eye'" class="w-4 h-4" />
            <span>{{ collection.is_public ? 'Сделать приватной' : 'Сделать публичной' }}</span>
          </button>

          <!-- Дублировать -->
          <button
            @click="handleDuplicate"
            class="flex items-center space-x-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors duration-150"
          >
            <Copy class="w-4 h-4" />
            <span>Дублировать</span>
          </button>

          <!-- Экспорт -->
          <button
            @click="handleExport"
            class="flex items-center space-x-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors duration-150"
          >
            <Download class="w-4 h-4" />
            <span>Экспорт</span>
          </button>

          <!-- Разделитель -->
          <div class="border-t border-gray-200 my-1"></div>

          <!-- Удалить -->
          <button
            @click="handleDelete"
            class="flex items-center space-x-2 w-full px-3 py-2 text-sm text-left hover:bg-red-50 hover:text-red-700 transition-colors duration-150 text-red-600"
          >
            <Trash2 class="w-4 h-4" />
            <span>Удалить</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useCollectionsStore } from '../../../stores/collections'
import type { Collection } from '../../../types'
import {
  MoreVertical,
  Edit2,
  FolderPlus,
  Heart,
  HeartOff,
  Eye,
  EyeOff,
  Copy,
  Download,
  Trash2,
} from 'lucide-vue-next'

interface Props {
  collection: Collection
  isSelected: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: []
  delete: []
  'create-subcollection': []
}>()

const collectionsStore = useCollectionsStore()

const showMenu = ref(false)
const menuRef = ref<HTMLElement>()

// Переключить меню
const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

// Закрыть меню при клике вне
const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    showMenu.value = false
  }
}

// Обработчики действий
const handleEdit = () => {
  emit('edit')
  showMenu.value = false
}

const handleCreateSubcollection = () => {
  emit('create-subcollection')
  showMenu.value = false
}

const handleDelete = () => {
  emit('delete')
  showMenu.value = false
}

const handleToggleFavorite = async () => {
  try {
    await collectionsStore.editCollection(props.collection.id, {
      is_favorite: !props.collection.is_favorite,
    })
    showMenu.value = false
  } catch (error) {
    console.error('Error toggling favorite:', error)
  }
}

const handleToggleVisibility = async () => {
  try {
    await collectionsStore.editCollection(props.collection.id, {
      is_public: !props.collection.is_public,
    })
    showMenu.value = false
  } catch (error) {
    console.error('Error toggling visibility:', error)
  }
}

const handleDuplicate = async () => {
  try {
    await collectionsStore.createCollection({
      name: `${props.collection.name} (копия)`,
      description: props.collection.description,
      color: props.collection.color,
      icon: props.collection.icon,
      parent_id: props.collection.parent_id,
    })
    showMenu.value = false
  } catch (error) {
    console.error('Error duplicating collection:', error)
  }
}

const handleExport = () => {
  // TODO: Реализовать экспорт коллекции
  console.log('Export collection:', props.collection.id)
  showMenu.value = false
}

// Подписка на события для закрытия меню
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Анимация появления меню */
.absolute {
  animation: slideDown 0.1s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Стили для кнопок меню */
button:hover {
  transform: none; /* Отключаем общий hover эффект для кнопок в меню */
}

/* Высокий z-index для меню */
.z-50 {
  z-index: 50;
}
</style>
