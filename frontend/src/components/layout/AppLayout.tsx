import type { ReactNode } from 'react'
import { Navbar } from './Navbar'

interface AppLayoutProps {
  children: ReactNode
  sidebar: ReactNode
}

export function AppLayout({ children, sidebar }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 lg:col-span-3">
            <div className="md:sticky md:top-24">
              {sidebar}
            </div>
          </div>
          <div className="md:col-span-8 lg:col-span-9">{children}</div>
        </div>
      </div>
    </div>
  )
}
