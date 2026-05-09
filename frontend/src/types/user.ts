export interface User {
  user_id: number
  username: string
  email: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface UserUpdateData {
  username: string
  email: string
  password?: string
}