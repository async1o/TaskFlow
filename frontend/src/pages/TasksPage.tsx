import { Link, useNavigate } from 'react-router-dom'
import { useTasks } from '../hooks/useTasks'
import { useGlobalToast } from '../components/ui'

export function TasksPage() {
  const navigate = useNavigate()
  const { showToast } = useGlobalToast()
  const { tasks, isLoading, error, deleteTask, isDeleting } = useTasks()

  const handleDelete = async (taskId: number) => {
    try {
      await deleteTask(taskId)
      showToast('Task deleted', 'success')
    } catch {
      showToast('Failed to delete task', 'error')
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tasks</h1>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-zinc-200/70">
              <div className="h-5 w-40 bg-zinc-200 rounded-lg animate-pulse mb-3" />
              <div className="h-4 w-full bg-zinc-200 rounded-lg animate-pulse mb-2" />
              <div className="h-4 w-56 bg-zinc-200 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
          Failed to load tasks
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-zinc-800">Tasks</h1>
        </div>
        <Link
          to="/tasks/new"
          className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all duration-200 active:scale-[0.97]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Task
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-zinc-200/70">
          <div className="text-4xl mb-4 opacity-30">📋</div>
          <p className="text-lg text-zinc-500 mb-4">No tasks yet</p>
          <Link
            to="/tasks/new"
            className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create your first task
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isCompleted = task.status === 'completed'
            return (
              <div
                key={task.task_id}
                className={`bg-white rounded-xl shadow-sm border border-zinc-200/70 border-l-4 p-5 transition-all duration-200 hover:shadow-md ${
                  isCompleted ? 'border-l-sky-500' : 'border-l-emerald-500'
                }`}
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="text-sm">{isCompleted ? '✅' : '🔵'}</span>
                      <h3
                        className={`font-semibold text-lg truncate ${
                          isCompleted ? 'line-through text-zinc-400' : 'text-zinc-800'
                        }`}
                      >
                        {task.label}
                      </h3>
                    </div>
                    <p className="text-zinc-600 mt-1 line-clamp-2 text-sm">{task.text}</p>
                    <p className="text-xs text-zinc-400 mt-2">
                      {task.assignee_name || task.creator_name} &middot;{' '}
                      {new Date(task.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      to={`/tasks/${task.task_id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(task.task_id)}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors font-medium disabled:opacity-50"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
