// middleware/auth.ts
export default defineNuxtRouteMiddleware(to => {
  // В middleware мы не можем использовать composables напрямую
  // Проверяем авторизацию через cookie или другой способ
  // Временно отключаем middleware до полной настройки Supabase
  return
})
