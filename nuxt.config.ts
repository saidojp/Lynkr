// https://nuxt.com/docs/api/configuration/nuxt-config
// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },

  // TypeScript конфигурация
  typescript: {
    typeCheck: true,
    strict: true,
  },

  css: ['@unocss/reset/tailwind.css'],

  modules: ['@nuxt/eslint', '@pinia/nuxt', '@unocss/nuxt', '@vueuse/nuxt', '@nuxtjs/supabase'],

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
