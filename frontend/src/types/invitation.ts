export interface Invitation {
  invitation_id: number
  corp_id: number
  sender_id: number
  recipient_id: number
  recipient_username: string
  corp_name: string
  status: string
  created_at: string
}

export interface InviteSendData {
  username: string
}
