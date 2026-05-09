import { useState, useEffect } from 'react'
import { tasksApi } from '../../api'
import type { Task } from '../../types'
import { useGlobalToast } from '../ui'

const filters = ['all', 'active', 'completed'] as const

export function TaskSidebar({
  selectedTaskId,
  onSelectTask,
  refetchTasks,
}: {
  selectedTaskId: number | null
  onSelectTask: (task: Task) => void
  refetchTasks?: () => void
}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [loading, setLoading] = useState(true)
  const { showToast } = useGlobalToast()

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true)
      try {
        const data = await tasksApi.getAll()
        setTasks(data)
      } catch {
        showToast('Failed to load tasks', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (refetchTasks) refetchTasks()
  }, [refetchTasks])

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return task.status !== 'completed'
    if (filter === 'completed') return task.status === 'completed'
    return true
  })

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col bg-white rounded-xl shadow-sm border border-zinc-200/70">
      <div className="p-4 pb-2">
        <div className="flex gap-1 bg-zinc-100 p-1 rounded-lg">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-1.5 px-2 text-sm font-medium rounded-md transition-all duration-200 capitalize ${
                filter === f
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 px-4 pb-4">
        {loading ? (
          <div className="space-y-2 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg bg-zinc-100 animate-pulse" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-2xl mb-2 opacity-30">
              {filter === 'completed' ? '✅' : '📋'}
            </div>
            <p className="text-zinc-400 text-sm">No {filter} tasks</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isSelected = selectedTaskId === task.task_id
            return (
              <button
                key={task.task_id}
                onClick={() => onSelectTask(task)}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                    : 'bg-white border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm shrink-0">
                    {task.status === 'completed' ? '✅' : '🔵'}
                  </span>
                  <span
                    className={`font-medium text-sm truncate flex-1 ${
                      task.status === 'completed' ? 'line-through text-zinc-400' : 'text-zinc-800'
                    }`}
                  >
                    {task.label}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1.5 truncate pl-7">{task.text}</p>
              </button>
            )
          })
        )}
      </div>

      <div className="px-4 py-3 border-t border-zinc-100 text-xs text-zinc-400">
        {loading ? 'Loading…' : `${filteredTasks.length} task${filteredTasks.length !== 1 ? 's' : ''}`}
      </div>
    </div>
  )
}
