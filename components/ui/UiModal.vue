<template>
  <teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none"
    >
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="handleBackdropClick"></div>

      <!-- Modal -->
      <div class="relative w-auto max-w-lg mx-auto my-6 animate-in fade-in-0 zoom-in-95" :class="modalSizeClasses">
        <div
          class="relative flex flex-col w-full bg-white border border-zinc-200 rounded-lg shadow-lg outline-none focus:outline-none"
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-zinc-200">
            <h3 class="text-lg font-semibold text-zinc-900">
              {{ title }}
            </h3>
            <button
              v-if="closable"
              @click="$emit('close')"
              class="rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 disabled:pointer-events-none"
              type="button"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span class="sr-only">Close</span>
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
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true,
})

const emit = defineEmits<{
  close: []
}>()

// Размеры модального окна
const modalSizeClasses = computed(() => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }
  return sizes[props.size]
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
  transform: scale(0.95) translateY(-20px);
}
</style>
