import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useTask, useTasks } from '../hooks/useTasks'
import { usersApi } from '../api'
import { useGlobalToast } from '../components/ui'
import { ProfileSkeleton } from '../components/ui/Skeleton'
import type { User } from '../types'

const taskSchema = z.object({
  label: z.string().min(1, 'Title is required'),
  text: z.string().min(1, 'Description is required'),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskDetailPageProps {
  taskId: number
}

export function TaskDetailPage({ taskId }: TaskDetailPageProps) {
  const navigate = useNavigate()
  const { showToast } = useGlobalToast()
  const { task, isLoading, error } = useTask(taskId)
  const { updateTask, isUpdating } = useTasks()
  const [users, setUsers] = useState<User[]>([])
  const [assigneeId, setAssigneeId] = useState('')

  useEffect(() => {
    usersApi.getAll().then(setUsers).catch(() => {})
  }, [])

  useEffect(() => {
    if (task) setAssigneeId(task.assignee_id ? String(task.assignee_id) : '')
  }, [task])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: task ? { label: task.label, text: task.text } : undefined,
  })

  const onSubmit = async (data: TaskFormData) => {
    try {
      await updateTask({
        id: taskId,
        data: { ...data, assignee_id: assigneeId ? Number(assigneeId) : null },
      })
      showToast('Task updated successfully', 'success')
      navigate('/tasks')
    } catch {
      showToast('Failed to update task', 'error')
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Task</h1>
        <ProfileSkeleton />
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="p-4 md:p-8 max-w-xl mx-auto">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm" role="alert">
          Failed to load task
        </div>
        <button
          onClick={() => navigate('/tasks')}
          className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          &larr; Back to tasks
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-zinc-800">Edit Task</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200/70 border-l-4 border-l-indigo-500 p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label htmlFor="label" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Title
            </label>
            <input
              id="label"
              type="text"
              {...register('label')}
              defaultValue={task.label}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 transition-all duration-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 hover:border-zinc-400"
            />
            {errors.label && (
              <p className="text-rose-500 text-sm mt-1" role="alert">{errors.label.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="text" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Description
            </label>
            <textarea
              id="text"
              {...register('text')}
              rows={4}
              defaultValue={task.text}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 transition-all duration-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 hover:border-zinc-400 resize-y"
            />
            {errors.text && (
              <p className="text-rose-500 text-sm mt-1" role="alert">{errors.text.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="assignee" className="block text-sm font-medium text-zinc-700 mb-1.5">
              Assign to
            </label>
            <select
              id="assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 transition-all duration-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 hover:border-zinc-400"
            >
              <option value="">Not assigned</option>
              {users.map((u) => (
                <option key={u.user_id} value={u.user_id}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              {isUpdating ? (
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
              onClick={() => navigate('/tasks')}
              className="inline-flex items-center justify-center gap-2 bg-zinc-200 text-zinc-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-300 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
