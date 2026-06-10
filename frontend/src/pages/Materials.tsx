import { useState, useEffect } from 'react'
import { FileText, ExternalLink, Archive, Key, BookOpen, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { materialsApi, type Material, type MaterialsByExam } from '../api/materials'
import { quizApi } from '../api/quiz'
import { useAuthStore } from '../store'
import type { Exam } from '../types'

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: typeof FileText }> = {
  question_paper: { label: 'Question Paper', color: 'bg-blue-100 text-blue-700', icon: FileText },
  answer_key: { label: 'Answer Key', color: 'bg-green-100 text-green-700', icon: Key },
  archive: { label: 'Archive', color: 'bg-orange-100 text-orange-700', icon: Archive },
  syllabus: { label: 'Syllabus', color: 'bg-purple-100 text-purple-700', icon: BookOpen },
}

const LANG_COLOR: Record<string, string> = {
  english: 'bg-blue-50 text-blue-600',
  tamil: 'bg-rose-50 text-rose-600',
  hindi: 'bg-yellow-50 text-yellow-700',
}

const EXAM_BG: Record<string, string> = {
  indigo: 'bg-indigo-500', blue: 'bg-blue-500', green: 'bg-green-500',
  orange: 'bg-orange-500', purple: 'bg-purple-500', rose: 'bg-rose-500',
  amber: 'bg-amber-500', yellow: 'bg-yellow-500',
}

function MaterialCard({ material }: { material: Material }) {
  const type = TYPE_CONFIG[material.material_type] || TYPE_CONFIG.question_paper
  const Icon = type.icon

  return (
    <a
      href={material.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
    >
      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 group-hover:bg-indigo-100 rounded-lg flex items-center justify-center transition-colors">
        <Icon className="w-4 h-4 text-gray-500 group-hover:text-indigo-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-700 leading-tight mb-1">
          {material.title}
        </div>
        <div className="flex flex-wrap gap-1">
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${type.color}`}>
            {type.label}
          </span>
          {material.year && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
              {material.year}
            </span>
          )}
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${LANG_COLOR[material.language] || 'bg-gray-100 text-gray-500'}`}>
            {material.language === 'tamil' ? 'தமிழ்' : material.language === 'hindi' ? 'हिन्दी' : 'EN'}
          </span>
          {material.is_official && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
              Official
            </span>
          )}
        </div>
      </div>
      <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 flex-shrink-0 mt-0.5 transition-colors" />
    </a>
  )
}

function SubjectSection({ subject, materials }: { subject: string; materials: Material[] }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
      >
        <span className="text-sm font-semibold text-gray-700">{subject}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{materials.length} items</span>
          {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>
      {open && (
        <div className="mt-2 space-y-2 pl-1">
          {materials.map((m) => (
            <MaterialCard key={m.id} material={m} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Materials() {
  const { user } = useAuthStore()
  const [exams, setExams] = useState<Record<string, Exam>>({})
  const [selectedExam, setSelectedExam] = useState(user?.selected_exam || '')
  const [data, setData] = useState<MaterialsByExam | null>(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')

  useEffect(() => {
    quizApi.getExams().then(setExams)
  }, [])

  useEffect(() => {
    if (selectedExam) loadMaterials(selectedExam)
  }, [selectedExam])

  const loadMaterials = async (exam: string) => {
    setLoading(true)
    try {
      const d = await materialsApi.getByExam(exam)
      setData(d)
    } finally {
      setLoading(false)
    }
  }

  const filteredSubjects = data
    ? Object.entries(data.by_subject).reduce<Record<string, Material[]>>((acc, [subj, mats]) => {
        const filtered = mats.filter((m) => {
          const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase()) ||
            m.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
          const matchType = !filterType || m.material_type === filterType
          return matchSearch && matchType
        })
        if (filtered.length > 0) acc[subj] = filtered
        return acc
      }, {})
    : {}

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Study Materials</h1>
        <p className="text-sm text-gray-500 mt-0.5">Official question papers, answer keys & archives — last 10 years</p>
      </div>

      {/* Exam selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Object.entries(exams).map(([key, exam]) => (
          <button
            key={key}
            onClick={() => setSelectedExam(key)}
            className={`p-2.5 rounded-lg border-2 text-left transition-all flex items-center gap-2 ${
              selectedExam === key
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className={`w-7 h-7 ${EXAM_BG[exam.color] || 'bg-gray-500'} rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {exam.short?.slice(0, 2) || key.slice(0, 2)}
            </div>
            <span className={`text-xs font-medium truncate ${selectedExam === key ? 'text-indigo-700' : 'text-gray-700'}`}>
              {exam.short || key}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      {data && (
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search papers..."
              className="input pl-8 text-sm"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input text-sm w-36"
          >
            <option value="">All types</option>
            <option value="question_paper">Question Papers</option>
            <option value="answer_key">Answer Keys</option>
            <option value="archive">Archives</option>
          </select>
        </div>
      )}

      {/* Content */}
      {!selectedExam && (
        <div className="card p-8 text-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Select an exam to view study materials</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {data && !loading && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {data.total} materials · {exams[selectedExam]?.name}
            </span>
            <span className="text-xs text-emerald-600 font-medium">✓ Official sources</span>
          </div>

          {Object.keys(filteredSubjects).length === 0 ? (
            <div className="card p-6 text-center text-sm text-gray-400">
              No materials match your filter.
            </div>
          ) : (
            Object.entries(filteredSubjects).map(([subj, mats]) => (
              <SubjectSection key={subj} subject={subj} materials={mats} />
            ))
          )}
        </>
      )}
    </div>
  )
}
