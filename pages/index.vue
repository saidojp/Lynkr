<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="min-h-screen bg-orange-50 flex items-center justify-center p-4">
    <div class="text-center max-w-2xl">
      <!-- Logo/Brand -->
      <div class="mb-8">
        <h1 class="text-6xl font-black uppercase mb-4">
          <span class="text-gray-900">Lynkr</span>
        </h1>
        <p class="text-xl font-mono text-gray-700">
          Your Link Memory - Organize and save your web discoveries
        </p>
      </div>

      <!-- Auth Actions -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <NuxtLink to="/auth/login">
          <UiButton size="lg" class="w-full sm:w-auto"> Login </UiButton>
        </NuxtLink>

        <NuxtLink to="/auth/register">
          <UiButton variant="outline" size="lg" class="w-full sm:w-auto"> Sign Up </UiButton>
        </NuxtLink>
      </div>

      <!-- Features -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div class="p-6 bg-white border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div class="text-3xl mb-4">📁</div>
          <h3 class="font-black uppercase mb-2">Organize</h3>
          <p class="font-mono text-sm text-gray-600">
            Create collections to organize your links by topic, project, or any way you like
          </p>
        </div>

        <div class="p-6 bg-white border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div class="text-3xl mb-4">🔖</div>
          <h3 class="font-black uppercase mb-2">Save</h3>
          <p class="font-mono text-sm text-gray-600">
            Quickly save links with descriptions and tags for easy retrieval later
          </p>
        </div>

        <div class="p-6 bg-white border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div class="text-3xl mb-4">🎨</div>
          <h3 class="font-black uppercase mb-2">Customize</h3>
          <p class="font-mono text-sm text-gray-600">
            Personalize your collections with colors, icons, and custom organization
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Lynkr - Your Link Memory',
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
