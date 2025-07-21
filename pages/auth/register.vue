<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="register-container">
    <div class="register-card manga-border manga-shadow">
      <h1 class="register-title">Create Account</h1>
      <p class="register-message">
        This is a placeholder registration page. User registration will be implemented later.
      </p>
      <div class="register-actions">
        <NuxtLink to="/auth/login" class="manga-button manga-border manga-hover mr-4">
          Go to Login
        </NuxtLink>
        <NuxtLink to="/" class="manga-button manga-border manga-hover"> Return to Home </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// This is a placeholder registration page
// Auth functionality will be implemented in a later phase
definePageMeta({
  layout: 'auth',
})

useHead({
  title: 'Create Account',
})
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--secondary-color);
}

.register-card {
  width: 100%;
  max-width: 480px;
  padding: 2rem;
  background-color: var(--secondary-color);
}

.register-title {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 2rem;
  text-align: center;
}

.register-message {
  margin-bottom: 2rem;
  text-align: center;
}

.register-actions {
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

.mr-4 {
  margin-right: 1rem;
}
</style>
