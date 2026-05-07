import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useTask, useTasks } from '../hooks/useTasks'
import { useGlobalToast } from '../components/ui'
import { ProfileSkeleton } from '../components/ui/Skeleton'

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
      await updateTask({ id: taskId, data })
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
      <div className="p-8">
        <div className="p-4 bg-red-100 text-red-700 rounded">
          Failed to load task
        </div>
        <button
          onClick={() => navigate('/tasks')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to tasks
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/tasks')}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">Edit Task</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow border">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            {...register('label')}
            defaultValue={task.label}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          {errors.label && (
            <p className="text-red-500 text-sm mt-1">{errors.label.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            {...register('text')}
            rows={4}
            defaultValue={task.text}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          {errors.text && (
            <p className="text-red-500 text-sm mt-1">{errors.text.message}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isUpdating}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isUpdating ? 'Updating...' : 'Update'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/tasks')}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}