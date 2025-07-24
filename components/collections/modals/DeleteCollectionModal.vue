<template>
  <UiModal :show="show" @close="handleClose" :title="'Delete Collection'" :size="'md'">
    <div class="space-y-6">
      <!-- Предупреждение -->
      <div class="border border-red-300 bg-red-50 p-4 rounded-lg">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <AlertTriangle class="w-5 h-5 text-red-500" />
          </div>
          <div class="flex-1">
            <h3 class="text-sm font-semibold text-red-800">Warning!</h3>
            <p class="text-sm text-red-700 mt-1">
              This action cannot be undone. The collection and all its contents will be permanently
              deleted.
            </p>
          </div>
        </div>
      </div>

      <!-- Информация о коллекции -->
      <div v-if="collection" class="space-y-3">
        <UiCard class="p-3">
          <!-- Иконка коллекции -->
          <div class="flex items-center space-x-3">
            <div
              class="w-8 h-8 border border-zinc-300 bg-white rounded-md flex items-center justify-center"
              :style="{ borderLeftColor: collection.color, borderLeftWidth: '3px' }"
            >
              <component :is="getIconComponent(collection.icon)" class="w-4 h-4 text-zinc-600" />
            </div>

            <!-- Информация -->
            <div class="flex-1">
              <div class="flex items-center space-x-2">
                <span class="font-semibold text-sm text-zinc-900">{{ collection.name }}</span>
                <span v-if="collection.is_public" class="text-xs text-emerald-600">🌐</span>
                <span v-if="collection.is_favorite" class="text-xs text-rose-500">❤️</span>
              </div>
              <p v-if="collection.description" class="text-xs text-zinc-600 mt-1">
                {{ collection.description }}
              </p>
            </div>
          </div>
        </UiCard>

        <!-- Статистика -->
        <div class="grid grid-cols-2 gap-4">
          <UiCard class="text-center p-3">
            <div class="text-lg font-semibold text-zinc-900">{{ linksCount || 0 }}</div>
            <div class="text-xs text-zinc-600">Links</div>
          </UiCard>
          <UiCard class="text-center p-3">
            <div class="text-lg font-semibold text-zinc-900">{{ childrenCount || 0 }}</div>
            <div class="text-xs text-zinc-600">Subcollections</div>
          </UiCard>
        </div>

        <!-- Дополнительное предупреждение при наличии содержимого -->
        <div
          v-if="(linksCount || 0) > 0 || (childrenCount || 0) > 0"
          class="border border-yellow-300 bg-yellow-50 p-3 rounded-lg"
        >
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <AlertTriangle class="w-4 h-4 text-yellow-600" />
            </div>
            <div class="text-sm text-yellow-800">
              <strong>Collection is not empty!</strong>
              <template v-if="(linksCount || 0) > 0">
                It contains {{ linksCount }} {{ linksCount === 1 ? 'link' : 'links' }}.
              </template>
              <template v-if="(childrenCount || 0) > 0">
                It has {{ childrenCount }}
                {{ childrenCount === 1 ? 'subcollection' : 'subcollections' }}.
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Подтверждение -->
      <div class="space-y-3">
        <label class="block text-sm font-medium text-zinc-900">
          To confirm, enter the collection name:
        </label>
        <UiInput
          v-model="confirmationName"
          type="text"
          :placeholder="collection?.name || ''"
          :class="{ 'border-red-300 focus:border-red-500': showConfirmationError }"
        />
        <p v-if="showConfirmationError" class="text-red-600 text-xs">Name does not match</p>
      </div>

      <!-- Кнопки действий -->
      <div class="flex items-center justify-end space-x-3 pt-6">
        <UiButton variant="outline" @click="handleClose"> Cancel </UiButton>

        <UiButton variant="destructive" @click="handleDelete" :disabled="!canDelete || loading">
          <span v-if="loading">Deleting...</span>
          <span v-else>Delete Forever</span>
        </UiButton>
      </div>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCollections } from '../../../composables/useCollections'
import UiModal from '../../ui/UiModal.vue'
import UiButton from '../../ui/UiButton.vue'
import UiInput from '../../ui/UiInput.vue'
import UiCard from '../../ui/UiCard.vue'
import { COLLECTION_ICONS, type IconKey } from '../../../utils/icons'
import type { Collection } from '../../../types'
import { AlertTriangle } from 'lucide-vue-next'

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

const { deleteCollection } = useCollections()

const confirmationName = ref('')
const showConfirmationError = ref(false)
const loading = ref(false)

// Можно ли удалить коллекцию
const canDelete = computed(() => {
  return props.collection && confirmationName.value.trim() === props.collection.name.trim()
})

// Получить компонент иконки
const getIconComponent = (iconName?: string) => {
  return COLLECTION_ICONS[iconName as IconKey]?.component || COLLECTION_ICONS.folder.component
}

// Удалить коллекцию
const handleDelete = async () => {
  if (!props.collection || !canDelete.value) {
    showConfirmationError.value = true
    return
  }

  loading.value = true

  try {
    await deleteCollection(props.collection.id)
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
