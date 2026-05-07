import { Link, useNavigate } from 'react-router-dom'
import { useTasks } from '../hooks/useTasks'
import { useGlobalToast } from '../components/ui'
import { TasksListSkeleton } from '../components/ui/Skeleton'

export function TasksPage() {
  const navigate = useNavigate()
  const { showToast } = useGlobalToast()
  const { tasks, isLoading, error, deleteTask, isDeleting } = useTasks()

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tasks</h1>
        </div>
        <TasksListSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="p-4 bg-red-100 text-red-700 rounded">
          Failed to load tasks
        </div>
      </div>
    )
  }

  const handleDelete = async (taskId: number) => {
    try {
      await deleteTask(taskId)
      showToast('Task deleted', 'success')
    } catch {
      showToast('Failed to delete task', 'error')
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold">Tasks</h1>
        </div>
        <Link
          to="/tasks/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
        >
          Create Task
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center text-gray-500 py-12 bg-white rounded-lg border">
          <p className="text-lg mb-4">No tasks yet</p>
          <Link
            to="/tasks/new"
            className="text-blue-600 hover:underline"
          >
            Create your first task
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.task_id} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{task.label}</h3>
                  <p className="text-gray-600 mt-1">{task.text}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {task.owner_name} • {new Date(task.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    to={`/tasks/${task.task_id}`}
                    className="text-blue-600 hover:underline px-2 py-1"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(task.task_id)}
                    disabled={isDeleting}
                    className="text-red-600 hover:underline px-2 py-1 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}