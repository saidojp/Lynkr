// composables/useAuth.ts
import type { User } from '@supabase/supabase-js'
import type { AuthUser, LoginCredentials, RegisterCredentials } from '../types/auth'

export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Состояние загрузки
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Очистка ошибок
  const clearError = () => {
    error.value = null
  }

  // Регистрация пользователя
  const register = async (credentials: RegisterCredentials): Promise<AuthUser | null> => {
    loading.value = true
    error.value = null

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            first_name: credentials.firstName,
            last_name: credentials.lastName,
          },
        },
      })

      if (authError) {
        error.value = authError.message
        return null
      }

      if (data.user) {
        return {
          id: data.user.id,
          email: data.user.email!,
          firstName: credentials.firstName,
          lastName: credentials.lastName,
          emailConfirmed: data.user.email_confirmed_at !== null,
          createdAt: data.user.created_at,
          updatedAt: data.user.updated_at,
        }
      }

      return null
    } catch (err: any) {
      error.value = err.message || 'Registration failed'
      return null
    } finally {
      loading.value = false
    }
  }

  // Вход пользователя
  const login = async (credentials: LoginCredentials): Promise<AuthUser | null> => {
    loading.value = true
    error.value = null

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (authError) {
        error.value = authError.message
        return null
      }

      if (data.user) {
        await navigateTo('/dashboard')
        return {
          id: data.user.id,
          email: data.user.email!,
          firstName: data.user.user_metadata?.first_name || '',
          lastName: data.user.user_metadata?.last_name || '',
          emailConfirmed: data.user.email_confirmed_at !== null,
          createdAt: data.user.created_at,
          updatedAt: data.user.updated_at,
        }
      }

      return null
    } catch (err: any) {
      error.value = err.message || 'Login failed'
      return null
    } finally {
      loading.value = false
    }
  }

  // Выход пользователя
  const logout = async (): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const { error: authError } = await supabase.auth.signOut()

      if (authError) {
        error.value = authError.message
        return false
      }

      await navigateTo('/auth/login')
      return true
    } catch (err: any) {
      error.value = err.message || 'Logout failed'
      return false
    } finally {
      loading.value = false
    }
  }

  // Получение текущего пользователя
  const getCurrentUser = (): Ref<User | null> => {
    return user
  }

  // Проверка авторизации
  const isAuthenticated = computed(() => !!user.value)

  // Обновление профиля пользователя
  const updateProfile = async (updates: {
    firstName?: string
    lastName?: string
    email?: string
  }): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const { data, error: authError } = await supabase.auth.updateUser({
        email: updates.email,
        data: {
          first_name: updates.firstName,
          last_name: updates.lastName,
        },
      })

      if (authError) {
        error.value = authError.message
        return false
      }

      return true
    } catch (err: any) {
      error.value = err.message || 'Profile update failed'
      return false
    } finally {
      loading.value = false
    }
  }

  // Сброс пароля
  const resetPassword = async (email: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (authError) {
        error.value = authError.message
        return false
      }

      return true
    } catch (err: any) {
      error.value = err.message || 'Password reset failed'
      return false
    } finally {
      loading.value = false
    }
  }

  // Обновление пароля
  const updatePassword = async (password: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const { error: authError } = await supabase.auth.updateUser({
        password,
      })

      if (authError) {
        error.value = authError.message
        return false
      }

      return true
    } catch (err: any) {
      error.value = err.message || 'Password update failed'
      return false
    } finally {
      loading.value = false
    }
  }

  // Подтверждение email
  const confirmEmail = async (token: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const { error: authError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup',
      })

      if (authError) {
        error.value = authError.message
        return false
      }

      return true
    } catch (err: any) {
      error.value = err.message || 'Email confirmation failed'
      return false
    } finally {
      loading.value = false
    }
  }

  // Повторная отправка подтверждения
  const resendConfirmation = async (email: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const { error: authError } = await supabase.auth.resend({
        type: 'signup',
        email,
      })

      if (authError) {
        error.value = authError.message
        return false
      }

      return true
    } catch (err: any) {
      error.value = err.message || 'Resend confirmation failed'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    user: getCurrentUser(),
    loading: readonly(loading),
    error: readonly(error),
    isAuthenticated,

    // Actions
    register,
    login,
    logout,
    updateProfile,
    resetPassword,
    updatePassword,
    confirmEmail,
    resendConfirmation,
    clearError,
  }
}
