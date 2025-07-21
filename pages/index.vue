<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="home-container">
    <div class="hero-section">
      <h1 class="hero-title">Welcome to <span class="brand">Lynkr</span></h1>
      <p class="hero-subtitle">Organize and manage your collections with ease</p>

      <div class="hero-actions">
        <NuxtLink to="/collections" class="manga-button manga-border manga-hover">
          Browse Collections
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Home',
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: var(--secondary-color);
}

.hero-section {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.brand {
  font-weight: 700;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: var(--accent-color);
}

.hero-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.manga-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: var(--secondary-color);
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}

.mr-4 {
  margin-right: 1rem;
}

.mt-8 {
  margin-top: 2rem;
}
</style>
