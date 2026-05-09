import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { notificationsApi } from '../../api'
import { Avatar } from '../ui/Avatar'

export function Navbar() {
  const location = useLocation()
  const { user } = useAuthStore()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetch = () => {
      notificationsApi
        .getAll()
        .then((items) => setUnreadCount(items.filter((i) => !i.read).length))
        .catch(() => {})
    }
    fetch()
    const interval = setInterval(fetch, 30000)
    return () => clearInterval(interval)
  }, [])

  const navLinks = [
    { to: '/tasks', label: 'Tasks' },
    { to: '/corps', label: 'Corporations' },
  ]

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <nav className="bg-indigo-900 text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-xl font-bold tracking-tight hover:opacity-90 transition-opacity"
            >
              TaskFlow
            </Link>
            <div className="flex gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.to)
                      ? 'bg-indigo-800/80 text-white'
                      : 'text-indigo-200 hover:text-white hover:bg-indigo-800/50'
                  }`}
                >
                  {link.label}
                  {isActive(link.to) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-indigo-400 rounded-full" />
                  )}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/notifications"
              className="relative p-2 rounded-lg text-indigo-200 hover:text-white hover:bg-indigo-800/50 transition-all duration-200"
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg animate-[badge-pulse_2s_ease-in-out_infinite]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-indigo-800/50 transition-all duration-200"
            >
              <Avatar src={user?.avatar_url} name={user?.username} size="sm" />
              <span className="text-sm font-medium hidden sm:inline">{user?.username}</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
