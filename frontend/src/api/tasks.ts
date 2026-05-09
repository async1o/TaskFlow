import { api } from '../lib/api'
import type { Task, TaskFormData } from '../types'

export const tasksApi = {
  getAll: async (limit = 100, offset = 0): Promise<Task[]> => {
    const response = await api.get<Task[]>('/tasks', { params: { limit, offset } })
    return response.data
  },

  getById: async (id: number): Promise<Task> => {
    const response = await api.get<Task>(`/tasks/${id}`)
    return response.data
  },

  create: async (data: TaskFormData): Promise<number> => {
    const response = await api.post<number>('/tasks', data)
    return response.data
  },

  update: async (id: number, data: TaskFormData): Promise<Task> => {
    const response = await api.put<Task>('/tasks', data, { params: { task_id: id } })
    return response.data
  },

  complete: async (id: number, status = 'completed'): Promise<Task> => {
    const response = await api.patch<Task>(`/tasks/${id}/complete`, { status })
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete('/tasks', { params: { task_id: id } })
  },
}