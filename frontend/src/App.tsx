import { Routes, Route, useParams, useNavigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/layout'
import { AppLayout } from './components/layout/AppLayout'
import { TaskSidebar } from './components/layout/TaskSidebar'
import { TaskPanel } from './components/layout/TaskPanel'
import { TasksPage } from './pages/TasksPage'
import { WelcomePage } from './pages/WelcomePage'
import { CreateTaskPage } from './pages/CreateTaskPage'
import { TaskDetailPage } from './pages/TaskDetailPage'
import { ProfilePage } from './pages/ProfilePage'
import { CorpsPage } from './pages/CorpsPage'
import { CorpDetailPage } from './pages/CorpDetailPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Task } from './types'

function TaskPanelWrapper() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const handleTaskUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
  }
  return <TaskPanel taskId={Number(id)} onTaskUpdate={handleTaskUpdate} />
}

function TaskDetailPageWrapper() {
  const { id } = useParams<{ id: string }>()
  return <TaskDetailPage taskId={Number(id)} />
}

export default function App() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task)
    navigate(`/tasks/${task.task_id}`)
  }

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
        path="/corps"
        element={
          <ProtectedRoute>
            <Layout>
              <CorpsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Layout>
              <NotificationsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/corps/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <CorpDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <AppLayout
              sidebar={
                <TaskSidebar
                  selectedTaskId={selectedTask?.task_id ?? null}
                  onSelectTask={handleSelectTask}
                  refetchTasks={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })}
                />
              }
            >
              <TasksPage />
            </AppLayout>
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
        path="/tasks/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <TaskDetailPageWrapper />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <TaskPanelWrapper />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <WelcomePage />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
