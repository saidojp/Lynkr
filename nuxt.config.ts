// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-07-21',

  // TypeScript конфигурация
  typescript: {
    typeCheck: false,
    strict: false,
  },

  // Use UnoCSS reset only, removing Tailwind reset to avoid conflicts
  css: ['@unocss/reset/tailwind-compat.css', '~/assets/css/main.css'],

  modules: ['@nuxt/eslint', '@pinia/nuxt', '@unocss/nuxt', '@vueuse/nuxt', '@nuxtjs/supabase'],

  // Конфигурация Supabase
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
    redirectOptions: {
      login: '/auth/login',
      callback: '/dashboard',
      exclude: ['/', '/auth/login', '/auth/register'],
    },
  },

  // Настройки приложения
  app: {
    head: {
      title: 'Lynkr - Your Link Memory',
      meta: [
        {
          name: 'description',
          content: 'Minimalist link saving and organization app',
        },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },

  // Настройки рантайма
  runtimeConfig: {
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL,
    },
  },
})
