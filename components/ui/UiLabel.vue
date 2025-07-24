<template>
  <label :class="['text-sm font-medium leading-none', className]">
    <slot />
  </label>
</template>

<script setup lang="ts">
interface Props {
  className?: string
}

defineProps<Props>()
</script>
