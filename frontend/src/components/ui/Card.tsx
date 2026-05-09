import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
}

export function Card({ children, className = '', hover = false, ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-zinc-200/70 transition-all duration-200 ${
        hover ? 'hover:shadow-md hover:border-zinc-300' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`p-6 pb-0 ${className}`}>{children}</div>
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h3 className={`text-lg font-semibold text-zinc-800 ${className}`}>{children}</h3>
}
