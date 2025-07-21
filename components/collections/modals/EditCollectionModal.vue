<template>
  <UiModal :show="show" @close="handleClose" :title="'Редактировать коллекцию'" :size="'large'">
    <CollectionForm
      :collection="collection"
      :is-edit="true"
      @submit="handleSubmit"
      @cancel="handleClose"
    />
  </UiModal>
</template>

<script setup lang="ts">
import { useCollectionsStore } from '../../../stores/collections'
import CollectionForm from '../CollectionForm.vue'
import UiModal from '../../ui/UiModal.vue'
import type { Collection } from '../../../types'

interface Props {
  show: boolean
  collection: Collection | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  success: [collection: Collection]
}>()

const collectionsStore = useCollectionsStore()

const handleSubmit = async (data: Partial<Collection>) => {
  if (!props.collection) return

  try {
    const updatedCollection = await collectionsStore.editCollection(props.collection.id, data)
    emit('success', updatedCollection)
    handleClose()
  } catch (error) {
    console.error('Error updating collection:', error)
    // Здесь можно показать уведомление об ошибке
  }
}

const handleClose = () => {
  emit('close')
}
</script>
