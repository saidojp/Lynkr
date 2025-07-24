<template>
  <button
    :class="[
      'inline-flex items-center justify-center font-medium transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
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
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  disabled: false,
  className: '',
})

const sizeClasses = computed(() => {
  const sizes = {
    default: 'h-10 px-4 py-2 text-sm rounded-md',
    sm: 'h-9 px-3 text-xs rounded-md',
    lg: 'h-11 px-8 text-base rounded-md',
    icon: 'h-10 w-10 rounded-md',
  }
  return sizes[props.size]
})

const variantClasses = computed(() => {
  const variants = {
    default: 'bg-zinc-900 text-zinc-50 hover:bg-zinc-800 shadow hover:shadow-md',
    destructive: 'bg-red-500 text-zinc-50 hover:bg-red-600 shadow hover:shadow-md',
    outline: 'border border-zinc-200 bg-white hover:bg-zinc-100 hover:text-zinc-900',
    secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200',
    ghost: 'hover:bg-zinc-100 hover:text-zinc-900',
    link: 'text-zinc-900 underline-offset-4 hover:underline',
  }
  return variants[props.variant]
})
</script>
