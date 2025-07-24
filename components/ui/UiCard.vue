<template>
  <div
    :class="[
      'rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-sm transition-all duration-200',
      className,
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  className?: string
}

defineProps<Props>()
</script>
