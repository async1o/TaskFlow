import type { ReactNode } from 'react'
import { Navbar } from './Navbar'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50">
      <Navbar />
      <main className="animate-fade-in">{children}</main>
    </div>
  )
}
