<!-- Simple collections page without complex dependencies that cause errors -->
<template>
  <div class="collections-page">
    <div class="container">
      <header class="page-header manga-border manga-shadow">
        <h1 class="page-title">Collections</h1>
        <p class="page-description">Simple collections page.</p>
      </header>

      <div class="content">
        <div class="placeholder-message manga-border manga-shadow">
          <div class="icon">📁</div>
          <h2>Collections</h2>
          <p>Collections functionality coming soon.</p>

          <div class="actions">
            <NuxtLink to="/" class="btn btn-primary manga-hover"> Back to Home </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Collections',
})
</script>

<style scoped>
.collections-page {
  min-height: 100vh;
  background-color: var(--secondary-color);
  padding: 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 4rem;
  padding: 2rem;
  background-color: var(--secondary-color);
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--primary-color);
  text-transform: uppercase;
}

.page-description {
  font-size: 1.2rem;
  color: var(--accent-color);
  max-width: 600px;
  margin: 0 auto;
}

.content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.placeholder-message {
  text-align: center;
  padding: 3rem;
  background-color: var(--secondary-color);
  max-width: 800px;
  margin: 0 auto;
}

.icon {
  font-size: 4rem;
  margin-bottom: 2rem;
}

.placeholder-message h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
  text-transform: uppercase;
}

.placeholder-message p {
  font-size: 1.1rem;
  color: var(--accent-color);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.actions {
  margin: 2rem 0;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-block;
  padding: 0.75rem 2rem;
  text-decoration: none;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: var(--primary-color);
  color: var(--secondary-color);
  border: var(--border-width) solid var(--primary-color);
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .placeholder-message {
    padding: 2rem 1rem;
  }

  .actions {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>
