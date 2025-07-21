<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="auth-layout">
    <div class="auth-branding">
      <NuxtLink to="/" class="auth-logo">LYNKR</NuxtLink>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
// Simple auth layout
// Will be expanded in a future phase
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  background-color: var(--secondary-color);
}

.auth-branding {
  position: absolute;
  top: 2rem;
  left: 2rem;
}

.auth-logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  text-decoration: none;
}
</style>
