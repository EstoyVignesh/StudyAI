import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, MessageSquare, BarChart2, Home, LogOut, Brain, FolderOpen } from 'lucide-react'
import { useAuthStore } from '../store'

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/quiz', icon: BookOpen, label: 'Quiz' },
  { path: '/tutor', icon: MessageSquare, label: 'Tutor' },
  { path: '/materials', icon: FolderOpen, label: 'Papers' },
  { path: '/progress', icon: BarChart2, label: 'Progress' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav for desktop */}
      <header className="hidden md:flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 sticky top-0 z-50">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
          <Brain className="w-6 h-6" />
          StudyAI
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === path
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{user?.username}</span>
          {user?.selected_exam && (
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
              {user.selected_exam}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-50">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg text-indigo-600">
          <Brain className="w-5 h-5" />
          StudyAI
        </Link>
        <div className="flex items-center gap-2">
          {user?.selected_exam && (
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
              {user.selected_exam}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-6">{children}</main>

      {/* Bottom nav for mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                location.pathname === path
                  ? 'text-indigo-600'
                  : 'text-gray-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
