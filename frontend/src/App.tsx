import { Routes, Route, useParams, Link } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/layout'
import { TasksPage } from './pages/TasksPage'
import { CreateTaskPage } from './pages/CreateTaskPage'
import { TaskDetailPage } from './pages/TaskDetailPage'
import { ProfilePage } from './pages/ProfilePage'

function Dashboard() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/tasks"
          className="bg-white p-6 rounded-lg shadow border hover:border-blue-500 block"
        >
          <h2 className="text-xl font-semibold">Tasks</h2>
          <p className="text-gray-600">Manage your tasks</p>
        </Link>
        <Link
          to="/profile"
          className="bg-white p-6 rounded-lg shadow border hover:border-blue-500 block"
        >
          <h2 className="text-xl font-semibold">Profile</h2>
          <p className="text-gray-600">View and edit your profile</p>
        </Link>
      </div>
    </div>
  )
}

function TaskDetailPageWrapper() {
  const { id } = useParams<{ id: string }>()
  return <TaskDetailPage taskId={Number(id)} />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Layout>
              <TasksPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks/new"
        element={
          <ProtectedRoute>
            <Layout>
              <CreateTaskPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <TaskDetailPageWrapper />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}