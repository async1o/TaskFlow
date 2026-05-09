interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isCompleted = status === 'completed'

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
        isCompleted
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
          : 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/20'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isCompleted ? 'bg-emerald-500' : 'bg-sky-500 animate-pulse'
        }`}
        aria-hidden="true"
      />
      {isCompleted ? 'Completed' : 'Active'}
    </span>
  )
}
