<template>
  <UiModal :show="show" @close="handleClose" :title="'Создать коллекцию'" size="lg">
    <CollectionForm
      :parent-id="parentId"
      :is-edit="false"
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
  parentId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  parentId: null,
})

const emit = defineEmits<{
  close: []
  success: [collection: Collection]
}>()

const { createCollection } = useCollections()

const handleSubmit = async (data: Partial<Collection>) => {
  try {
    if (!data.name) {
      throw new Error('Collection name is required')
    }

    const collectionData = {
      name: data.name,
      description: data.description,
      icon: data.icon,
      parent_id: data.parent_id || props.parentId,
    }

    const newCollection = await createCollection(collectionData)
    emit('success', newCollection)
    handleClose()
  } catch (error) {
    console.error('Error creating collection:', error)
    // Здесь можно показать уведомление об ошибке
  }
}

const handleClose = () => {
  emit('close')
}
</script>
