import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, MessageSquare, BarChart2, TrendingUp, Target, Flame, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../store'
import { quizApi } from '../api/quiz'
import { progressApi } from '../api/progress'
import type { Exam, ProgressOverview } from '../types'

const EXAM_COLORS: Record<string, string> = {
  UPSC: 'bg-indigo-500',
  JEE: 'bg-blue-500',
  NEET: 'bg-green-500',
}

const EXAM_LIGHT: Record<string, string> = {
  UPSC: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  JEE: 'bg-blue-50 text-blue-700 border-blue-100',
  NEET: 'bg-green-50 text-green-700 border-green-100',
}

export default function Dashboard() {
  const { user, updateUser } = useAuthStore()
  const navigate = useNavigate()
  const [exams, setExams] = useState<Record<string, Exam>>({})
  const [progress, setProgress] = useState<ProgressOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [examsData, progressData] = await Promise.all([
          quizApi.getExams(),
          progressApi.getOverview(),
        ])
        setExams(examsData)
        setProgress(progressData)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const selectExam = async (examKey: string) => {
    try {
      const { authApi } = await import('../api/auth')
      const updated = await authApi.updateExam(examKey)
      updateUser(updated)
    } catch (_) {}
    navigate('/quiz')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.username} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {user?.selected_exam
            ? `Preparing for ${user.selected_exam}`
            : 'Choose an exam to start preparing'}
        </p>
      </div>

      {/* Stats row */}
      {progress && progress.total_questions > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Questions', value: progress.total_questions, icon: BookOpen, color: 'text-indigo-600' },
            { label: 'Accuracy', value: `${progress.overall_accuracy}%`, icon: Target, color: 'text-green-600' },
            { label: 'Sessions', value: progress.total_sessions, icon: Flame, color: 'text-orange-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-3 text-center">
              <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
              <div className="text-lg font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          to="/quiz"
          className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow group"
        >
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 text-sm">Practice Quiz</div>
            <div className="text-xs text-gray-500">Adaptive questions</div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>
        <Link
          to="/tutor"
          className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow group"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
            <MessageSquare className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 text-sm">AI Tutor</div>
            <div className="text-xs text-gray-500">Ask anything</div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>
        <Link
          to="/progress"
          className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow group"
        >
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
            <BarChart2 className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 text-sm">Progress</div>
            <div className="text-xs text-gray-500">Your analytics</div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>
      </div>

      {/* Exam selection */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          Choose Your Exam
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.entries(exams).map(([key, exam]) => (
            <button
              key={key}
              onClick={() => selectExam(key)}
              className={`card p-4 text-left hover:shadow-md transition-all border-2 ${
                user?.selected_exam === key
                  ? 'border-indigo-400 ' + (EXAM_LIGHT[key] || 'bg-gray-50')
                  : 'border-transparent hover:border-gray-200'
              }`}
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 ${EXAM_COLORS[key] || 'bg-gray-500'} rounded-lg text-white font-bold text-sm mb-3`}>
                {key}
              </div>
              <div className="font-semibold text-gray-900 text-sm">{exam.name}</div>
              <div className="text-xs text-gray-500 mt-1">{exam.description}</div>
              {progress?.by_exam[key] && (
                <div className="mt-2 text-xs text-gray-500">
                  {progress.by_exam[key].questions} questions · {progress.by_exam[key].accuracy}% accuracy
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
