export interface User {
  user_id: number
  username: string
  email: string
  created_at: string
  updated_at: string
}

export interface UserUpdateData {
  username: string
  email: string
  password: string
}