import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export function Navbar() {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/tasks', label: 'Tasks' },
    { to: '/profile', label: 'Profile' },
  ]

  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold">
              TaskApp
            </Link>
            <div className="flex gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded hover:bg-gray-700 ${
                    location.pathname === link.to ? 'bg-gray-700' : ''
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user?.username}</span>
            <button
              onClick={logout}
              className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}