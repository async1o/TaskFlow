interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-zinc-200 ${className}`}>
      <div className="absolute inset-0 animate-shimmer" />
    </div>
  )
}

export function TaskCardSkeleton() {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-zinc-200/70">
      <div className="flex justify-between items-start">
        <div className="w-2/3 space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function TasksListSkeleton() {
  return (
    <div className="space-y-3">
      <TaskCardSkeleton />
      <TaskCardSkeleton />
      <TaskCardSkeleton />
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-200/70 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="space-y-4 border-t pt-6">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
    </div>
  )
}
