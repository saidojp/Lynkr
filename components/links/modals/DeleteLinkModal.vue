<template>
  <UiModal :show="show" title="Delete Link" @close="$emit('cancel')" size="md">
    <div class="space-y-4">
      <div class="flex items-start space-x-3">
        <div
          class="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"
        >
          <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-medium text-zinc-900 mb-1">Delete Link</h3>
          <p class="text-sm text-zinc-600">
            Are you sure you want to delete this link? This action cannot be undone.
          </p>
        </div>
      </div>

      <!-- Link preview -->
      <div v-if="link" class="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
        <div class="flex items-center space-x-3">
          <img
            v-if="link.metadata?.favicon"
            :src="link.metadata.favicon"
            :alt="domain"
            class="w-4 h-4 rounded-sm"
          />
          <div class="flex-1 min-w-0">
            <h4 class="font-medium text-sm text-zinc-900 truncate">
              {{ link.title }}
            </h4>
            <p class="text-xs text-zinc-500 truncate">{{ domain }}</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end space-x-3 pt-4">
        <UiButton type="button" variant="outline" @click="$emit('cancel')" :disabled="loading">
          Cancel
        </UiButton>

        <UiButton type="button" variant="destructive" @click="handleDelete" :disabled="loading">
          <span v-if="loading">Deleting...</span>
          <span v-else>Delete Link</span>
        </UiButton>
      </div>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useLinksStore } from '../../../stores/links'
import UiModal from '../../ui/UiModal.vue'
import UiButton from '../../ui/UiButton.vue'
import type { Link } from '../../../types/links'

interface Props {
  show: boolean
  link: Link | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  cancel: []
  success: []
}>()

const linksStore = useLinksStore()
const { loading } = storeToRefs(linksStore)

const domain = computed(() => {
  if (!props.link) return ''
  try {
    return new URL(props.link.url).hostname
  } catch {
    return props.link.url
  }
})

const handleDelete = async () => {
  if (!props.link) return

  const success = await linksStore.deleteLink(props.link.id)

  if (success) {
    emit('success')
  }
}
</script>
