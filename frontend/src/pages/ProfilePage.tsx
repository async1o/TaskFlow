import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { usersApi } from '../api'
import { useGlobalToast } from '../components/ui'
import { ProfileSkeleton } from '../components/ui/Skeleton'

const profileSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
})

type ProfileFormData = z.infer<typeof profileSchema>

export function ProfilePage() {
  const navigate = useNavigate()
  const { showToast } = useGlobalToast()
  const { user, logout } = useAuthStore()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    if (user) {
      setValue('username', user.username)
      setValue('email', user.email)
      setValue('password', '')
    }
  }, [user, setValue])

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return
    try {
      await usersApi.update(user.user_id, data)
      showToast('Profile updated successfully', 'success')
      setTimeout(() => logout(), 1000)
    } catch {
      showToast('Failed to update profile', 'error')
    }
  }

  if (!user) {
    return (
      <div className="p-4 md:p-8 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        <ProfileSkeleton />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="mb-4 text-sm text-gray-500">
          User ID: {user.user_id} | Created: {new Date(user.created_at).toLocaleDateString()}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              {...register('username')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              {...register('password')}
              placeholder="Leave empty to keep current password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}