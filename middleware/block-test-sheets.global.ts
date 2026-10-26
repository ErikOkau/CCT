export default defineNuxtRouteMiddleware(to => {
  if (to.path !== '/test-sheets') return
  if (import.meta.dev) return
  return navigateTo('/')
})
