<template>
  <input
    :class="[
      'flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm',
      'ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium',
      'placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2',
      'focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed',
      'disabled:opacity-50 transition-all duration-200',
      error && 'border-red-500 focus-visible:ring-red-400',
      className,
    ]"
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string | number
  error?: boolean
  className?: string
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
