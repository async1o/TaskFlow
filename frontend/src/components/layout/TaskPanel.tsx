import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useTask, useTasks } from '../../hooks/useTasks'
import { tasksApi } from '../../api'
import { useGlobalToast } from '../../components/ui'
import { Avatar } from '../../components/ui/Avatar'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { useAuthStore } from '../../store/authStore'

interface TaskPanelProps {
  taskId: number
  onTaskUpdate?: () => void
}

export function TaskPanel({ taskId, onTaskUpdate }: TaskPanelProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { task, isLoading, error } = useTask(taskId)
  const { deleteTask } = useTasks()
  const { showToast } = useGlobalToast()
  const { user } = useAuthStore()

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return
    try {
      await deleteTask(taskId)
      showToast('Task deleted', 'success')
      navigate('/tasks')
    } catch {
      showToast('Failed to delete task', 'error')
    }
  }

  const handleComplete = async () => {
    try {
      await tasksApi.complete(taskId, 'completed')
      showToast('Task completed', 'success')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      if (onTaskUpdate) onTaskUpdate()
    } catch {
      showToast('Failed to update task', 'error')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200/70 p-8 space-y-5">
          <div className="h-8 w-48 bg-zinc-200 rounded-lg animate-pulse" />
          <div className="h-4 w-full bg-zinc-200 rounded-lg animate-pulse" />
          <div className="h-4 w-3/4 bg-zinc-200 rounded-lg animate-pulse" />
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="h-16 bg-zinc-100 rounded-lg animate-pulse" />
            <div className="h-16 bg-zinc-100 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200/70 p-8 text-center">
          <div className="text-3xl mb-3 opacity-30">📋</div>
          <p className="text-zinc-500 mb-4">Failed to load task</p>
          <button
            onClick={() => navigate('/tasks')}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Back to tasks
          </button>
        </div>
      </div>
    )
  }

  const canEdit = user
    ? task.owner_id === user.user_id || task.assignee_id === user.user_id
    : false

  const accentBorder =
    task.status === 'completed' ? 'border-l-sky-500' : 'border-l-emerald-500'

  return (
    <div className="p-6 animate-fade-in">
      <button
        onClick={() => navigate('/tasks')}
        className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 mb-6 transition-colors text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div
        className={`bg-white rounded-xl shadow-sm border border-zinc-200/70 border-l-4 ${accentBorder} overflow-hidden`}
      >
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-zinc-800">{task.label}</h2>
              <StatusBadge status={task.status} />
            </div>
            <div className="flex gap-2 shrink-0">
              {canEdit && task.status !== 'completed' && (
                <button
                  onClick={handleComplete}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all duration-200 active:scale-[0.97]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Complete
                </button>
              )}
              {canEdit && (
                <button
                  onClick={() => navigate(`/tasks/${task.task_id}/edit`)}
                  className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all duration-200 active:scale-[0.97]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              )}
              {canEdit && (
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 bg-rose-600 text-white px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-rose-700 transition-all duration-200 active:scale-[0.97]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              )}
            </div>
          </div>

          <p className="text-zinc-600 whitespace-pre-wrap leading-relaxed">{task.text}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
            <div className="flex items-center gap-3.5 p-4 bg-indigo-50/80 rounded-xl">
              <Avatar src={task.creator_avatar} name={task.creator_name} size="md" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                  Creator
                </p>
                <p className="font-medium text-zinc-800">{task.creator_name}</p>
              </div>
            </div>
            {task.assignee_id ? (
              <div className="flex items-center gap-3.5 p-4 bg-emerald-50/80 rounded-xl">
                <Avatar src={task.assignee_avatar} name={task.assignee_name || undefined} size="md" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
                    Assignee
                  </p>
                  <p className="font-medium text-zinc-800">{task.assignee_name}</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-zinc-400 pt-4 border-t border-zinc-100">
            <span>Created {new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span>Updated {new Date(task.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
