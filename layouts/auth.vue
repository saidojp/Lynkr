<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="min-h-screen bg-zinc-50 flex flex-col">
    <!-- Header -->
    <div class="p-6">
      <NuxtLink
        to="/"
        class="text-2xl font-bold text-zinc-900 hover:text-zinc-700 transition-colors"
      >
        Lynkr
      </NuxtLink>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex items-center justify-center p-4">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
// Simple auth layout with shadcn/ui styling
</script>
