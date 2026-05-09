import { api } from '../lib/api'

export interface NotificationItem {
  id: string
  type: string
  message: string
  related_id: number | null
  read: boolean
  created_at: string
  notification_id?: number
  invitation_id?: number
}

export const notificationsApi = {
  getAll: async (): Promise<NotificationItem[]> => {
    const response = await api.get<NotificationItem[]>('/notifications')
    return response.data
  },

  markRead: async (notificationId: number): Promise<void> => {
    await api.post(`/notifications/${notificationId}/read`)
  },
}
