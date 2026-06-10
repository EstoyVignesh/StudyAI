import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, MessageSquare, BarChart2, TrendingUp, Target, Flame, ChevronRight, Globe, MapPin } from 'lucide-react'
import { useAuthStore } from '../store'
import { quizApi } from '../api/quiz'
import { authApi } from '../api/auth'
import { progressApi } from '../api/progress'
import type { Exam, ProgressOverview } from '../types'

const LANG_LABEL: Record<string, string> = { english: 'EN', tamil: 'தமிழ்', hindi: 'हि' }
const LANG_COLOR: Record<string, string> = {
  english: 'bg-blue-100 text-blue-700',
  tamil: 'bg-rose-100 text-rose-700',
  hindi: 'bg-yellow-100 text-yellow-700',
}

const EXAM_BG: Record<string, string> = {
  indigo: 'bg-indigo-500', blue: 'bg-blue-500', green: 'bg-green-500',
  orange: 'bg-orange-500', purple: 'bg-purple-500', rose: 'bg-rose-500',
  amber: 'bg-amber-500', yellow: 'bg-yellow-500',
}

const LANGUAGES = [
  { key: 'english', label: 'English', native: 'English' },
  { key: 'tamil', label: 'Tamil', native: 'தமிழ்' },
  { key: 'hindi', label: 'Hindi', native: 'हिन्दी' },
]

export default function Dashboard() {
  const { user, updateUser } = useAuthStore()
  const navigate = useNavigate()
  const [exams, setExams] = useState<Record<string, Exam>>({})
  const [progress, setProgress] = useState<ProgressOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'national' | 'state'>('all')
  const [savingLang, setSavingLang] = useState(false)

  const loadExams = async (lang?: string) => {
    const data = await quizApi.getExams(lang ? { language: lang } : undefined)
    setExams(data)
  }

  useEffect(() => {
    const load = async () => {
      try {
        const [_, progressData] = await Promise.all([
          loadExams(user?.language_preference),
          progressApi.getOverview(),
        ])
        setProgress(progressData)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const changeLanguage = async (lang: string) => {
    setSavingLang(true)
    try {
      const updated = await authApi.updateProfile({ language_preference: lang })
      updateUser(updated)
      await loadExams(lang)
    } finally {
      setSavingLang(false)
    }
  }

  const selectExam = async (examKey: string) => {
    try {
      const updated = await authApi.updateProfile({ selected_exam: examKey })
      updateUser(updated)
    } catch (_) {}
    navigate('/quiz')
  }

  const filteredExams = Object.entries(exams).filter(([, exam]) => {
    if (activeTab === 'national') return exam.level === 'national'
    if (activeTab === 'state') return exam.level === 'state'
    return true
  })

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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hi, {user?.username} 👋</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {user?.selected_exam && (
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                {exams[user.selected_exam]?.short || user.selected_exam}
              </span>
            )}
            {user?.state && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                <MapPin className="w-3 h-3" />{user.state}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Language switcher */}
      <div className="card p-3">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-medium text-gray-700">Question Language</span>
          {savingLang && <span className="text-xs text-gray-400">Saving...</span>}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.key}
              onClick={() => changeLanguage(lang.key)}
              className={`py-2 rounded-lg text-sm font-medium border-2 transition-colors flex flex-col items-center gap-0.5 ${
                user?.language_preference === lang.key
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <span>{lang.label}</span>
              <span className="text-xs opacity-70">{lang.native}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
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
      <div className="grid grid-cols-3 gap-3">
        {[
          { to: '/quiz', icon: BookOpen, label: 'Practice Quiz', sub: 'Adaptive questions', bg: 'bg-indigo-100', fg: 'text-indigo-600' },
          { to: '/tutor', icon: MessageSquare, label: 'AI Tutor', sub: 'Ask anything', bg: 'bg-purple-100', fg: 'text-purple-600' },
          { to: '/progress', icon: BarChart2, label: 'Progress', sub: 'Your analytics', bg: 'bg-green-100', fg: 'text-green-600' },
        ].map(({ to, icon: Icon, label, sub, bg, fg }) => (
          <Link key={to} to={to} className="card p-3 flex flex-col items-center text-center hover:shadow-md transition-shadow gap-2">
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${fg}`} />
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-xs">{label}</div>
              <div className="text-xs text-gray-400">{sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Exam list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Choose Your Exam
          </h2>
          <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg text-xs">
            {(['all', 'national', 'state'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2 py-1 rounded-md font-medium capitalize transition-colors ${
                  activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filteredExams.length === 0 ? (
          <div className="card p-6 text-center text-gray-400 text-sm">
            No exams available for the selected language. Try switching language.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredExams.map(([key, exam]) => (
              <button
                key={key}
                onClick={() => selectExam(key)}
                className={`card p-4 text-left flex items-center gap-3 hover:shadow-md transition-all border-2 ${
                  user?.selected_exam === key ? 'border-indigo-400' : 'border-transparent'
                }`}
              >
                <div className={`w-10 h-10 ${EXAM_BG[exam.color] || 'bg-gray-500'} rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                  {exam.short}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm">{exam.name}</div>
                  <div className="text-xs text-gray-400 truncate">{exam.description}</div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {exam.languages.map((l) => (
                      <span key={l} className={`text-xs px-1.5 py-0.5 rounded font-medium ${LANG_COLOR[l] || 'bg-gray-100 text-gray-500'}`}>
                        {LANG_LABEL[l] || l}
                      </span>
                    ))}
                    {exam.state && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" />{exam.state}
                      </span>
                    )}
                    {progress?.by_exam[key] && (
                      <span className="text-xs text-gray-400">
                        · {progress.by_exam[key].accuracy}% accuracy
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
