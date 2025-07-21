<script>
export default defineNuxtRouteMiddleware(() => {
  return navigateTo('/auth/login', { redirectCode: 301 })
})
</script>
