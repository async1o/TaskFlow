import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { usersApi } from '../api'
import { useGlobalToast } from '../components/ui'
import { AvatarUpload } from '../components/ui/AvatarUpload'
import { ProfileSkeleton } from '../components/ui/Skeleton'
import type { UserUpdateData } from '../types'

function buildUpdatePayload(data: ProfileFormData): UserUpdateData {
  const payload: UserUpdateData = { username: data.username, email: data.email }
  if (data.password) payload.password = data.password
  return payload
}

const profileSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().optional(),
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
      const updated = await usersApi.update(user.user_id, buildUpdatePayload(data))
      if (data.password) {
        showToast('Profile updated — please log in again', 'success')
        setTimeout(() => logout(), 1000)
      } else {
        useAuthStore.setState({ user: { ...updated } })
        localStorage.setItem('user', JSON.stringify(updated))
        showToast('Profile updated', 'success')
      }
    } catch {
      showToast('Failed to update profile', 'error')
    }
  }

  const handleDelete = async () => {
    if (!user) return
    if (!confirm('Are you sure you want to delete your profile? This cannot be undone.')) return
    try {
      await usersApi.delete(user.user_id)
      showToast('Profile deleted', 'success')
      logout()
    } catch {
      showToast('Failed to delete profile', 'error')
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
    <div className="p-4 md:p-8 max-w-xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-zinc-800">Profile</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200/70 border-l-4 border-l-emerald-500 p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-400">
            <span className="tabular-nums">ID {user.user_id}</span> &middot;{' '}
            Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        <div className="pb-6 border-b border-zinc-100">
          <AvatarUpload
            currentUrl={user.avatar_url}
            userName={user.username}
            onUpload={async (file) => {
              const updated = await usersApi.uploadAvatar(file)
              showToast('Avatar updated', 'success')
              useAuthStore.setState({ user: { ...user, avatar_url: updated.avatar_url } })
              localStorage.setItem(
                'user',
                JSON.stringify({ ...user, avatar_url: updated.avatar_url }),
              )
            }}
            onError={(msg) => showToast(msg, 'error')}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              spellCheck={false}
              {...register('username')}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 transition-all duration-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 hover:border-zinc-400"
            />
            {errors.username && (
              <p className="text-rose-500 text-sm mt-1" role="alert">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              spellCheck={false}
              {...register('email')}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 transition-all duration-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 hover:border-zinc-400"
            />
            {errors.email && (
              <p className="text-rose-500 text-sm mt-1" role="alert">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1.5">
              New Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              placeholder="Leave empty to keep current password"
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 transition-all duration-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 hover:border-zinc-400"
            />
            {errors.password && (
              <p className="text-rose-500 text-sm mt-1" role="alert">{errors.password.message}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving…
                </>
              ) : (
                'Save Changes'
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="inline-flex items-center justify-center gap-2 bg-rose-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-rose-700 transition-all duration-200 active:scale-[0.97]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center justify-center gap-2 bg-zinc-200 text-zinc-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-300 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
