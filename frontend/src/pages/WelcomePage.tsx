import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { tasksApi } from '../api'
import { Avatar } from '../components/ui/Avatar'
import type { Task } from '../types'

function getStartOfWeek(): Date {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday
}

export function WelcomePage() {
  const { user } = useAuthStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tasksApi
      .getAll()
      .then(setTasks)
      .finally(() => setLoading(false))
  }, [])

  const weekStart = getStartOfWeek()
  const newTasks = tasks.filter((t) => new Date(t.created_at) >= weekStart)
  const completedThisWeek = tasks.filter(
    (t) => t.status === 'completed' && new Date(t.updated_at) >= weekStart,
  )

  return (
    <div className="p-4 md:p-10 max-w-3xl mx-auto animate-fade-in">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-5">
          <div className="relative">
            <Avatar src={user?.avatar_url} name={user?.username} size="lg" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-emerald-500 to-amber-500 bg-clip-text text-transparent text-balance">
          Welcome back, {user?.username || 'User'}
        </h1>
        <p className="text-zinc-500 mt-2 text-lg">Here's your week at a glance</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200/70">
              <div className="h-10 w-10 bg-zinc-200 rounded-xl animate-pulse mb-4" />
              <div className="h-9 w-16 bg-zinc-200 rounded-lg animate-pulse mb-3" />
              <div className="h-4 w-32 bg-zinc-200 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <Link
            to="/tasks/new"
            className="group bg-white p-8 rounded-2xl shadow-sm border border-zinc-200/70 hover:shadow-md hover:border-indigo-300 transition-all duration-200 text-center"
          >
            <div className="text-3xl mb-3">📋</div>
            <p className="text-4xl font-bold text-indigo-600 tabular-nums">{newTasks.length}</p>
            <p className="text-sm text-zinc-500 mt-2">New Tasks This Week</p>
          </Link>
          <Link
            to="/tasks"
            className="group bg-white p-8 rounded-2xl shadow-sm border border-zinc-200/70 hover:shadow-md hover:border-emerald-300 transition-all duration-200 text-center"
          >
            <div className="text-3xl mb-3">✅</div>
            <p className="text-4xl font-bold text-emerald-600 tabular-nums">
              {completedThisWeek.length}
            </p>
            <p className="text-sm text-zinc-500 mt-2">Completed This Week</p>
          </Link>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/70 p-6 md:p-8">
        <h2 className="text-lg font-semibold text-zinc-700 text-center mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/tasks"
            className="flex flex-col items-center gap-2 p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 border border-indigo-200/50 hover:border-indigo-300 transition-all duration-200 active:scale-[0.98]"
          >
            <span className="text-2xl">📋</span>
            <span className="font-medium text-indigo-700 text-sm">All Tasks</span>
          </Link>
          <Link
            to="/tasks/new"
            className="flex flex-col items-center gap-2 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 border border-emerald-200/50 hover:border-emerald-300 transition-all duration-200 active:scale-[0.98]"
          >
            <span className="text-2xl">➕</span>
            <span className="font-medium text-emerald-700 text-sm">New Task</span>
          </Link>
          <Link
            to="/corps"
            className="flex flex-col items-center gap-2 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 border border-amber-200/50 hover:border-amber-300 transition-all duration-200 active:scale-[0.98]"
          >
            <span className="text-2xl">🏢</span>
            <span className="font-medium text-amber-700 text-sm">Corporations</span>
          </Link>
          <Link
            to="/profile"
            className="flex flex-col items-center gap-2 p-4 bg-rose-50 rounded-xl hover:bg-rose-100 border border-rose-200/50 hover:border-rose-300 transition-all duration-200 active:scale-[0.98]"
          >
            <span className="text-2xl">👤</span>
            <span className="font-medium text-rose-700 text-sm">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
