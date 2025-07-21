<template>
  <UiModal :show="show" @close="handleClose" :title="'Создать коллекцию'" :size="'large'">
    <CollectionForm
      :parent-id="parentId"
      :is-edit="false"
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
  parentId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  parentId: null,
})

const emit = defineEmits<{
  close: []
  success: [collection: Collection]
}>()

const collectionsStore = useCollectionsStore()

const handleSubmit = async (data: Partial<Collection>) => {
  try {
    if (!data.name) {
      throw new Error('Collection name is required')
    }

    const collectionData = {
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon,
      parent_id: data.parent_id,
      is_public: data.is_public,
      is_favorite: data.is_favorite,
      default_sort: data.default_sort,
      default_view: data.default_view,
    }

    const newCollection = await collectionsStore.createCollection(collectionData)
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
