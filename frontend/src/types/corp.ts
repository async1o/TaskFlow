export interface Corp {
  corp_id: number
  name: string
  owner_id: number
  created_at: string
  updated_at: string
}

export interface CorpFormData {
  name: string
}

export interface CorpAddMemberData {
  user_id: number
}
