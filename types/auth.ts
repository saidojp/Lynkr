// types/auth.ts

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  emailConfirmed: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}
