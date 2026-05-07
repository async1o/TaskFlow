interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  )
}

export function TaskCardSkeleton() {
  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <div className="flex justify-between items-start">
        <div className="w-2/3">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-10" />
          <Skeleton className="h-5 w-14" />
        </div>
      </div>
    </div>
  )
}

export function TasksListSkeleton() {
  return (
    <div className="space-y-4">
      <TaskCardSkeleton />
      <TaskCardSkeleton />
      <TaskCardSkeleton />
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <Skeleton className="h-4 w-48 mb-6" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}