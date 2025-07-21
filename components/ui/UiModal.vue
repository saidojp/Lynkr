<template>
  <teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none"
    >
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50" @click="handleBackdropClick"></div>

      <!-- Modal -->
      <div class="relative w-auto max-w-3xl mx-auto my-6" :class="modalSizeClasses">
        <div
          class="relative flex flex-col w-full bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none focus:outline-none"
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b-2 border-black">
            <h3 class="text-xl font-black uppercase">
              {{ title }}
            </h3>
            <button
              @click="$emit('close')"
              class="p-2 border-2 border-black bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors"
              type="button"
            >
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="relative p-6 flex-auto">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  show: boolean
  title: string
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  closable: true,
})

const emit = defineEmits<{
  close: []
}>()

// Размеры модального окна
const modalSizeClasses = computed(() => {
  switch (props.size) {
    case 'small':
      return 'max-w-md'
    case 'medium':
      return 'max-w-lg'
    case 'large':
      return 'max-w-2xl'
    case 'xlarge':
      return 'max-w-4xl'
    default:
      return 'max-w-lg'
  }
})

// Обработка клика по backdrop
const handleBackdropClick = () => {
  if (props.closable) {
    emit('close')
  }
}

// Обработка нажатия Escape
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closable && props.show) {
    emit('close')
  }
}

// Добавляем обработчик Escape при монтировании
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
/* Анимации появления */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-content-enter-active,
.modal-content-leave-active {
  transition: all 0.3s ease;
}

.modal-content-enter-from,
.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}
</style>
