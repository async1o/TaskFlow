export interface Task {
  task_id: number
  label: string
  text: string
  status: string
  owner_id: number
  owner_name: string
  owner_avatar: string | null
  creator_id: number
  creator_name: string
  creator_avatar: string | null
  assignee_id: number | null
  assignee_name: string | null
  assignee_avatar: string | null
  created_at: string
  updated_at: string
}

export interface TaskFormData {
  label: string
  text: string
  assignee_id?: number | null
}