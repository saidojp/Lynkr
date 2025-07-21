<template>
  <UiModal :show="show" @close="handleClose" :title="'Удалить коллекцию'" :size="'medium'">
    <div class="space-y-6">
      <!-- Предупреждение -->
      <div class="border-2 border-red-500 bg-red-50 p-4">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <AlertTriangle class="w-5 h-5 text-red-500" />
          </div>
          <div class="flex-1">
            <h3 class="text-sm font-bold text-red-800 uppercase">Внимание!</h3>
            <p class="text-sm text-red-700 mt-1">
              Это действие нельзя будет отменить. Коллекция и все её содержимое будут удалены
              навсегда.
            </p>
          </div>
        </div>
      </div>

      <!-- Информация о коллекции -->
      <div v-if="collection" class="space-y-3">
        <div class="flex items-center space-x-3 p-3 bg-gray-50 border-2 border-gray-200">
          <!-- Иконка коллекции -->
          <div
            class="w-8 h-8 border-2 border-black bg-white flex items-center justify-center"
            :style="{ borderLeftColor: collection.color, borderLeftWidth: '4px' }"
          >
            <component :is="getIconComponent(collection.icon)" class="w-4 h-4" />
          </div>

          <!-- Информация -->
          <div class="flex-1">
            <div class="flex items-center space-x-2">
              <span class="font-bold text-sm uppercase">{{ collection.name }}</span>
              <span v-if="collection.is_public" class="text-xs text-green-600">🌐</span>
              <span v-if="collection.is_favorite" class="text-xs text-red-500">❤️</span>
            </div>
            <p v-if="collection.description" class="text-xs text-gray-600 mt-1">
              {{ collection.description }}
            </p>
          </div>
        </div>

        <!-- Статистика -->
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center p-3 bg-gray-50 border-2 border-gray-200">
            <div class="text-lg font-bold">{{ linksCount || 0 }}</div>
            <div class="text-xs text-gray-600 uppercase">Ссылок</div>
          </div>
          <div class="text-center p-3 bg-gray-50 border-2 border-gray-200">
            <div class="text-lg font-bold">{{ childrenCount || 0 }}</div>
            <div class="text-xs text-gray-600 uppercase">Подколлекций</div>
          </div>
        </div>

        <!-- Дополнительное предупреждение при наличии содержимого -->
        <div
          v-if="(linksCount || 0) > 0 || (childrenCount || 0) > 0"
          class="border-2 border-yellow-500 bg-yellow-50 p-3"
        >
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <AlertTriangle class="w-4 h-4 text-yellow-600" />
            </div>
            <div class="text-sm text-yellow-800">
              <strong>Коллекция не пуста!</strong>
              <template v-if="(linksCount || 0) > 0">
                В ней {{ linksCount }}
                {{ linksCount === 1 ? 'ссылка' : linksCount < 5 ? 'ссылки' : 'ссылок' }}.
              </template>
              <template v-if="(childrenCount || 0) > 0">
                У неё {{ childrenCount }}
                {{
                  childrenCount === 1
                    ? 'подколлекция'
                    : childrenCount < 5
                      ? 'подколлекции'
                      : 'подколлекций'
                }}.
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Подтверждение -->
      <div class="space-y-3">
        <label class="block text-sm font-medium uppercase">
          Для подтверждения введите название коллекции:
        </label>
        <input
          v-model="confirmationName"
          type="text"
          :placeholder="collection?.name || ''"
          class="w-full p-3 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          :class="{ 'border-red-500': showConfirmationError }"
        />
        <p v-if="showConfirmationError" class="text-red-500 text-xs">Название не совпадает</p>
      </div>

      <!-- Кнопки действий -->
      <div class="flex items-center justify-end space-x-3 pt-6">
        <button
          type="button"
          @click="handleClose"
          class="px-6 py-3 border-2 border-black bg-white text-sm font-bold uppercase hover:bg-gray-100 transition-colors duration-150"
        >
          Отмена
        </button>

        <button
          type="button"
          @click="handleDelete"
          :disabled="!canDelete || loading"
          class="px-6 py-3 border-2 border-red-500 bg-red-500 text-white text-sm font-bold uppercase hover:bg-red-600 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Удаление...</span>
          <span v-else>Удалить навсегда</span>
        </button>
      </div>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCollectionsStore } from '../../../stores/collections'
import UiModal from '../../ui/UiModal.vue'
import type { Collection } from '../../../types'
import { AlertTriangle } from 'lucide-vue-next'
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
} from 'lucide-vue-next'

interface Props {
  show: boolean
  collection: Collection | null
  linksCount?: number
  childrenCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  linksCount: 0,
  childrenCount: 0,
})

const emit = defineEmits<{
  close: []
  success: [collectionId: string]
}>()

const collectionsStore = useCollectionsStore()

const confirmationName = ref('')
const showConfirmationError = ref(false)
const loading = ref(false)

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

// Можно ли удалить коллекцию
const canDelete = computed(() => {
  return props.collection && confirmationName.value.trim() === props.collection.name.trim()
})

// Получить компонент иконки
const getIconComponent = (iconName?: string) => {
  return iconComponents[iconName as keyof typeof iconComponents] || Folder
}

// Удалить коллекцию
const handleDelete = async () => {
  if (!props.collection || !canDelete.value) {
    showConfirmationError.value = true
    return
  }

  loading.value = true

  try {
    await collectionsStore.deleteCollection(props.collection.id)
    emit('success', props.collection.id)
    handleClose()
  } catch (error) {
    console.error('Error deleting collection:', error)
    // Здесь можно показать уведомление об ошибке
  } finally {
    loading.value = false
  }
}

// Закрыть модальное окно
const handleClose = () => {
  confirmationName.value = ''
  showConfirmationError.value = false
  emit('close')
}
</script>
