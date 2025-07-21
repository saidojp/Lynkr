// stores/auth.ts
import { defineStore } from 'pinia'
import type { AuthUser, LoginCredentials, RegisterCredentials } from '../types/auth'

interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: state => !!state.user,
    isLoading: state => state.loading,
    hasError: state => !!state.error,
  },

  actions: {
    // Установить пользователя
    setUser(user: AuthUser | null) {
      this.user = user
      this.error = null
    },

    // Установить состояние загрузки
    setLoading(loading: boolean) {
      this.loading = loading
    },

    // Установить ошибку
    setError(error: string | null) {
      this.error = error
    },

    // Очистить ошибку
    clearError() {
      this.error = null
    },

    // Очистить состояние при выходе
    clearAuth() {
      this.user = null
      this.error = null
      this.loading = false
    },
  },
})
