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
import { useCollections } from '../../../composables/useCollections'
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

const { updateCollection } = useCollections()

const handleSubmit = async (data: Partial<Collection>) => {
  if (!props.collection) return

  try {
    const updatedCollection = await updateCollection(props.collection.id, data)
    if (updatedCollection) {
      emit('success', updatedCollection)
    }
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
