<template>
  <textarea
    :class="[
      'flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm',
      'ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none',
      'focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
      'resize-none',
      error && 'border-red-500 focus-visible:ring-red-400',
      className,
    ]"
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    v-bind="$attrs"
  ></textarea>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string
  error?: boolean
  className?: string
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
