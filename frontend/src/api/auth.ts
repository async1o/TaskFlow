import { api } from '../lib/api'
import type { LoginRequest, RegisterRequest, TokenResponse, User } from '../types'

export const authApi = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/users/login', data)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<number> => {
    const response = await api.post<number>('/users', data)
    return response.data
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/users/me')
    return response.data
  },
}