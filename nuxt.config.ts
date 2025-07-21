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

  modules: ['@nuxt/eslint', '@pinia/nuxt', '@unocss/nuxt', '@vueuse/nuxt'],

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
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  },
})
