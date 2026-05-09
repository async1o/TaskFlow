import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useGlobalToast } from '../components/ui'

const registerSchema = z
  .object({
    username: z.string().min(2, 'Username must be at least 2 characters'),
    email: z.string().email('Invalid email'),
    password: z.string().min(4, 'Password must be at least 4 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const { showToast } = useGlobalToast()
  const { register: registerUser, isLoading, error, clearError } = useAuthStore()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
      })
      showToast('Registration successful', 'success')
      navigate('/')
    } catch {
      showToast('Registration failed', 'error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-amber-50 p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white text-2xl font-bold mb-4 shadow-lg shadow-indigo-200">
            TF
          </div>
          <h1 className="text-2xl font-bold text-zinc-800">Create account</h1>
          <p className="text-zinc-500 mt-1">Get started with TaskFlow</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200/70">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2.5" role="alert">
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="flex-1">{error}</span>
              <button onClick={clearError} className="underline font-medium shrink-0">Dismiss</button>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
                placeholder="Your username"
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
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-rose-500 text-sm mt-1" role="alert">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 transition-all duration-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 hover:border-zinc-400"
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="text-rose-500 text-sm mt-1" role="alert">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700 mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword')}
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 transition-all duration-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 hover:border-zinc-400"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="text-rose-500 text-sm mt-1" role="alert">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
