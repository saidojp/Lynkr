<template>
  <button
    :class="[
      'inline-flex items-center justify-center font-medium transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      sizeClasses,
      variantClasses,
      className,
    ]"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  className: '',
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg',
  }
  return sizes[props.size]
})

const variantClasses = computed(() => {
  const variants = {
    primary: 'bg-primary-900 hover:bg-primary-800 text-white focus:ring-primary-500',
    secondary: 'bg-primary-100 hover:bg-primary-200 text-primary-900 focus:ring-primary-500',
    ghost: 'hover:bg-primary-100 text-primary-900 focus:ring-primary-500',
    outline:
      'border border-primary-300 hover:bg-primary-50 text-primary-900 focus:ring-primary-500',
  }
  return variants[props.variant]
})
</script>
