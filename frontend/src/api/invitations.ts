import { api } from '../lib/api'
import type { Invitation, InviteSendData } from '../types'

export const invitationsApi = {
  sendInvite: async (corpId: number, data: InviteSendData): Promise<{ invitation_id: number; message: string }> => {
    const response = await api.post(`/corps/${corpId}/invite`, data)
    return response.data
  },

  getPending: async (): Promise<Invitation[]> => {
    const response = await api.get<Invitation[]>('/invitations/pending')
    return response.data
  },

  getPendingForCorp: async (corpId: number): Promise<Invitation[]> => {
    const response = await api.get<Invitation[]>(`/corps/${corpId}/invitations/pending`)
    return response.data
  },

  accept: async (invitationId: number): Promise<void> => {
    await api.post(`/invitations/${invitationId}/accept`)
  },

  reject: async (invitationId: number): Promise<void> => {
    await api.post(`/invitations/${invitationId}/reject`)
  },
}
