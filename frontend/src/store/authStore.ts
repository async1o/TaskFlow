import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginRequest, RegisterRequest } from '../types'
import { authApi } from '../api'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  clearError: () => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (data: LoginRequest) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.login(data)
          localStorage.setItem('token', response.access_token)
          set({ token: response.access_token, isAuthenticated: true })
          await get().initialize()
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Login failed'
          set({ error: message })
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null })
        try {
          await authApi.register(data)
          await get().login({ email: data.email, password: data.password })
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Registration failed'
          set({ error: message })
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        set({ token: null, user: null, isAuthenticated: false })
      },

      clearError: () => set({ error: null }),

      initialize: async () => {
        const token = get().token
        if (!token) return
        try {
          const user = await authApi.getMe()
          set({ user })
          localStorage.setItem('user', JSON.stringify(user))
        } catch {
          get().logout()
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)