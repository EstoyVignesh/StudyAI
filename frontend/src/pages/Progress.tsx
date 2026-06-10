import { useState, useEffect } from 'react'
import { TrendingUp, Target, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react'
import { progressApi } from '../api/progress'
import type { ProgressOverview, WeakArea } from '../types'

const ACCURACY_COLOR = (acc: number) =>
  acc >= 80 ? 'text-green-600 bg-green-50' :
  acc >= 60 ? 'text-yellow-600 bg-yellow-50' :
  'text-red-600 bg-red-50'

const ACCURACY_BAR = (acc: number) =>
  acc >= 80 ? 'bg-green-500' :
  acc >= 60 ? 'bg-yellow-500' :
  'bg-red-500'

const EXAM_COLORS: Record<string, string> = {
  UPSC: 'bg-indigo-500',
  JEE: 'bg-blue-500',
  NEET: 'bg-green-500',
}

export default function Progress() {
  const [overview, setOverview] = useState<ProgressOverview | null>(null)
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([])
  const [recentSessions, setRecentSessions] = useState<{
    id: number; exam_type: string; subject: string; topic: string;
    questions_answered: number; correct_answers: number; accuracy: number;
    final_difficulty: number; started_at: string;
  }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [ov, wa, recent] = await Promise.all([
          progressApi.getOverview(),
          progressApi.getWeakAreas(),
          progressApi.getRecentSessions(8),
        ])
        setOverview(ov)
        setWeakAreas(wa.weak_areas)
        setRecentSessions(recent)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!overview || overview.total_questions === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-gray-700 mb-2">No data yet</h2>
        <p className="text-sm text-gray-500">
          Complete some quiz sessions to see your progress analytics here.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Your Progress</h1>

      {/* Overall stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Sessions', value: overview.total_sessions, icon: BookOpen, color: 'text-indigo-500' },
          { label: 'Questions Done', value: overview.total_questions, icon: Target, color: 'text-blue-500' },
          { label: 'Correct Answers', value: overview.total_correct, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Overall Accuracy', value: `${overview.overall_accuracy}%`, icon: TrendingUp, color: 'text-orange-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-3 text-center">
            <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
            <div className="text-lg font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Accuracy bar */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Accuracy</span>
          <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${ACCURACY_COLOR(overview.overall_accuracy)}`}>
            {overview.overall_accuracy}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${ACCURACY_BAR(overview.overall_accuracy)}`}
            style={{ width: `${overview.overall_accuracy}%` }}
          />
        </div>
      </div>

      {/* By exam */}
      {Object.keys(overview.by_exam).length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">Performance by Exam</h2>
          <div className="space-y-3">
            {Object.entries(overview.by_exam).map(([exam, data]) => (
              <div key={exam} className="card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 ${EXAM_COLORS[exam] || 'bg-gray-500'} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>
                    {exam.slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 text-sm">{exam}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ACCURACY_COLOR(data.accuracy)}`}>
                        {data.accuracy}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {data.sessions} sessions · {data.questions} questions
                    </div>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full ${ACCURACY_BAR(data.accuracy)}`}
                    style={{ width: `${data.accuracy}%` }}
                  />
                </div>
                {Object.entries(data.subjects).map(([subject, stats]) => (
                  <div key={subject} className="flex items-center gap-2 py-1">
                    <span className="text-xs text-gray-500 w-24 flex-shrink-0">{subject}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${ACCURACY_BAR(stats.accuracy)}`}
                        style={{ width: `${stats.accuracy}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{stats.accuracy}%</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weak areas */}
      {weakAreas.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Areas to Improve
          </h2>
          <div className="space-y-2">
            {weakAreas.map((area) => (
              <div key={area.topic} className="card p-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{area.topic}</div>
                  <div className="text-xs text-gray-400">{area.questions_attempted} questions attempted</div>
                </div>
                <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${ACCURACY_COLOR(area.accuracy)}`}>
                  {area.accuracy}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">Recent Sessions</h2>
          <div className="space-y-2">
            {recentSessions.map((s) => (
              <div key={s.id} className="card p-3 flex items-center gap-3">
                <div className={`w-7 h-7 ${EXAM_COLORS[s.exam_type] || 'bg-gray-400'} rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {s.exam_type.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{s.topic}</div>
                  <div className="text-xs text-gray-400">{s.subject} · {s.questions_answered}Q</div>
                </div>
                <div className={`text-sm font-semibold ${s.accuracy >= 60 ? 'text-green-600' : 'text-red-500'}`}>
                  {s.accuracy}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
