<template>
  <div class="app-container">
    <!-- Здесь будут отображаться все страницы с их лейаутами -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// Глобальные настройки приложения
import { useHead } from '#app'
// Импортируем CSS файл напрямую
import './assets/css/main.css'

// Настройка мета-тегов для всего приложения
useHead({
  titleTemplate: titleChunk => {
    return titleChunk ? `${titleChunk} - Lynkr` : 'Lynkr - Управление коллекциями ссылок'
  },
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    {
      name: 'description',
      content: 'Lynkr - современное приложение для организации и управления коллекциями ссылок',
    },
    { name: 'format-detection', content: 'telephone=no' },
  ],
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
})
</script>

<style>
/* Глобальные стили */
html,
body {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
}

/* Убираем стандартные отступы */
* {
  box-sizing: border-box;
}

/* Стили для режима manga/brutalist */
:root {
  --primary-color: #000000;
  --secondary-color: #ffffff;
  --accent-color: #9aa0a6;
  --border-width: 2px;
  --border-radius: 0px;
  --shadow-offset: 4px;
}

/* Глобальные утилиты */
.manga-border {
  border: var(--border-width) solid var(--primary-color);
}

.manga-shadow {
  box-shadow: var(--shadow-offset) var(--shadow-offset) 0px 0px var(--primary-color);
}

.manga-hover {
  transition: all 0.15s ease-in-out;
}

.manga-hover:hover {
  transform: translate(-1px, -1px);
  box-shadow: calc(var(--shadow-offset) + 2px) calc(var(--shadow-offset) + 2px) 0px 0px
    var(--primary-color);
}

/* Анимации переходов между страницами */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* Стили для скроллбаров в manga стиле */
::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  background: var(--secondary-color);
  border: var(--border-width) solid var(--primary-color);
}

::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border: 1px solid var(--secondary-color);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--accent-color);
}
</style>
