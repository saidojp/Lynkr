<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="login-container">
    <div class="login-card manga-border manga-shadow">
      <h1 class="login-title">Lynkr Login</h1>
      <p class="login-message">
        This is a placeholder login page. Authentication functionality will be implemented later.
      </p>
      <div class="login-actions">
        <NuxtLink to="/" class="manga-button manga-border manga-hover"> Return to Home </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// This is a placeholder login page
// Auth functionality will be implemented in a later phase
definePageMeta({
  layout: 'auth',
})

useHead({
  title: 'Login',
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--secondary-color);
}

.login-card {
  width: 100%;
  max-width: 480px;
  padding: 2rem;
  background-color: var(--secondary-color);
}

.login-title {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 2rem;
  text-align: center;
}

.login-message {
  margin-bottom: 2rem;
  text-align: center;
}

.login-actions {
  display: flex;
  justify-content: center;
}

.manga-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: var(--secondary-color);
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}
</style>
