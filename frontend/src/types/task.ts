export interface Task {
  task_id: number
  label: string
  text: string
  owner_id: number
  owner_name: string
  created_at: string
  updated_at: string
}

export interface TaskFormData {
  label: string
  text: string
}