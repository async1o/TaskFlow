import { api } from '../lib/api'
import type { Corp, CorpFormData } from '../types'

export const corpsApi = {
  getAll: async (limit = 100, offset = 0): Promise<Corp[]> => {
    const response = await api.get<Corp[]>('/corps', { params: { limit, offset } })
    return response.data
  },

  getById: async (id: number): Promise<Corp> => {
    const response = await api.get<Corp>(`/corps/${id}`)
    return response.data
  },

  create: async (data: CorpFormData): Promise<number> => {
    const response = await api.post<number>('/corps', data)
    return response.data
  },

  update: async (id: number, data: Partial<CorpFormData>): Promise<Corp> => {
    const response = await api.put<Corp>(`/corps/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/corps/${id}`)
  },

  getMembers: async (corpId: number): Promise<number[]> => {
    const response = await api.get<number[]>(`/corps/${corpId}/members`)
    return response.data
  },

  addMember: async (corpId: number, userId: number): Promise<void> => {
    await api.post(`/corps/${corpId}/members`, { user_id: userId })
  },

  removeMember: async (corpId: number, userId: number): Promise<void> => {
    await api.delete(`/corps/${corpId}/members/${userId}`)
  },
}
