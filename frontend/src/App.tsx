import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Quiz from './pages/Quiz'
import Tutor from './pages/Tutor'
import Progress from './pages/Progress'
import Materials from './pages/Materials'
import Insights from './pages/Insights'
import Study from './pages/Study'
import Layout from './components/Layout'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/quiz"
          element={
            <PrivateRoute>
              <Layout>
                <Quiz />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/tutor"
          element={
            <PrivateRoute>
              <Layout>
                <Tutor />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <PrivateRoute>
              <Layout>
                <Progress />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/materials"
          element={
            <PrivateRoute>
              <Layout>
                <Materials />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/insights"
          element={
            <PrivateRoute>
              <Layout>
                <Insights />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/study"
          element={
            <PrivateRoute>
              <Layout>
                <Study />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
