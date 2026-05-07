import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const { token, user, isAuthenticated, isLoading, error, login, register, logout, clearError, initialize } = useAuthStore()

  useEffect(() => {
    if (token && !user) {
      initialize()
    }
  }, [token, user, initialize])

  return {
    token,
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  }
}