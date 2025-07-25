<template>
  <div class="relative">
    <UiButton
      variant="ghost"
      size="icon"
      class="h-6 w-6"
      :class="{ 'hover:bg-zinc-700': isSelected }"
      @click.stop.prevent="toggleMenu"
      title="Actions"
    >
      <MoreVertical class="w-4 h-4" />
    </UiButton>

    <teleport to="body">
      <transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="isOpen"
          ref="menuRef"
          class="fixed z-50 w-48 bg-white rounded-md shadow-lg border border-zinc-200 focus:outline-none"
          :style="menuStyle"
        >
          <div class="py-1">
            <button
              @click="handleEdit"
              class="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 flex items-center gap-2"
            >
              <Pencil class="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              @click="handleCreateSubcollection"
              class="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 flex items-center gap-2"
            >
              <FolderPlus class="w-4 h-4" />
              <span>Add sub-collection</span>
            </button>
            <div class="border-t border-zinc-100 my-1"></div>
            <button
              @click="handleDelete"
              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 class="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import type { Collection } from '../../../types'
import UiButton from '../../ui/UiButton.vue'
import { MoreVertical, Pencil, Trash2, FolderPlus } from 'lucide-vue-next'

const props = defineProps<{
  collection: Collection
  isSelected: boolean
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  'create-subcollection': []
}>()

const isOpen = ref(false)
const menuRef = ref<HTMLDivElement | null>(null)
const menuStyle = ref({})
const triggerButton = ref<HTMLElement | null>(null)

const toggleMenu = async (event: MouseEvent) => {
  triggerButton.value = event.currentTarget as HTMLElement
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    await nextTick()
    positionMenu()
  }
}

const positionMenu = () => {
  if (!triggerButton.value || !menuRef.value) return

  const triggerRect = triggerButton.value.getBoundingClientRect()
  const menuHeight = menuRef.value.offsetHeight
  const menuWidth = menuRef.value.offsetWidth

  let top = triggerRect.bottom + window.scrollY + 4
  // Если меню не помещается снизу, показать его сверху
  if (top + menuHeight > window.innerHeight) {
    top = triggerRect.top + window.scrollY - menuHeight - 4
  }

  // Позиционируем меню слева от кнопки
  let left = triggerRect.left + window.scrollX - menuWidth + triggerRect.width

  menuStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
}

const handleClickOutside = (event: MouseEvent) => {
  // Не закрывать, если клик был по кнопке-триггеру
  if (triggerButton.value?.contains(event.target as Node)) {
    return
  }
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
})

const handleEdit = () => {
  emit('edit')
  isOpen.value = false
}
const handleDelete = () => {
  emit('delete')
  isOpen.value = false
}
const handleCreateSubcollection = () => {
  emit('create-subcollection')
  isOpen.value = false
}
</script>
