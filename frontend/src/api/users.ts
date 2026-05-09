import { api } from '../lib/api'
import type { User, UserUpdateData } from '../types'

export const usersApi = {
  getAll: async (limit = 100, offset = 0): Promise<User[]> => {
    const response = await api.get<User[]>('/users', { params: { limit, offset } })
    return response.data
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`)
    return response.data
  },

  update: async (id: number, data: UserUpdateData): Promise<User> => {
    const response = await api.put<User>('/users', data, { params: { user_id: id } })
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete('/users', { params: { user_id: id } })
  },

  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<User>('/users/avatar', formData)
    return response.data
  },
}