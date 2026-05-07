import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useTasks } from '../hooks/useTasks'
import { useGlobalToast } from '../components/ui'

const taskSchema = z.object({
  label: z.string().min(1, 'Title is required'),
  text: z.string().min(1, 'Description is required'),
})

type TaskFormData = z.infer<typeof taskSchema>

export function CreateTaskPage() {
  const navigate = useNavigate()
  const { showToast } = useGlobalToast()
  const { createTask, isCreating, error } = useTasks()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  })

  const onSubmit = async (data: TaskFormData) => {
    try {
      await createTask(data)
      showToast('Task created successfully', 'success')
      navigate('/tasks')
    } catch {
      showToast('Failed to create task', 'error')
    }
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
        <h1 className="text-2xl font-bold">Create Task</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {String(error)}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow border">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            {...register('label')}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          {errors.text && (
            <p className="text-red-500 text-sm mt-1">{errors.text.message}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isCreating}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create'}
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