<template>
  <UiModal
    :show="show"
    :title="isEdit ? 'Edit Link' : 'Add New Link'"
    @close="$emit('close')"
    size="lg"
  >
    <LinkForm
      :link="link"
      :collection-id="collectionId"
      :is-edit="isEdit"
      @submit="handleSubmit"
      @cancel="$emit('close')"
    />
  </UiModal>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useLinksStore } from '../../../stores/links'
import LinkForm from '../LinkForm.vue'
import UiModal from '../../ui/UiModal.vue'
import type { Link, CreateLinkData } from '../../../types/links'

interface Props {
  show: boolean
  link?: Link | null
  collectionId?: string | null
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  link: null,
  collectionId: null,
  isEdit: false,
})

const emit = defineEmits<{
  close: []
  success: [link: Link]
}>()

const linksStore = useLinksStore()
const { loading } = storeToRefs(linksStore)

const handleSubmit = async (data: CreateLinkData | (CreateLinkData & { id: string })) => {
  try {
    let result: Link | null = null

    if (props.isEdit && 'id' in data) {
      result = await linksStore.updateLink(data)
    } else {
      result = await linksStore.createLink(data as CreateLinkData)
    }

    if (result) {
      emit('success', result)
      emit('close')
    }
  } catch (error) {
    console.error('Error saving link:', error)
  }
}
</script>
