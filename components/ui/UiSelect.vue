<template>
  <select
    :class="[
      'flex h-10 w-full items-center justify-between rounded-md border border-zinc-200',
      'bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500',
      'focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
      className,
    ]"
    :value="modelValue"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    v-bind="$attrs"
  >
    <slot />
  </select>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string | number
  className?: string
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
