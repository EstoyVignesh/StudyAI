import { useState, useEffect, useRef } from 'react'
import {
  Lightbulb, RefreshCw, ChevronDown,
  Sparkles, Target, RotateCcw, Brain
} from 'lucide-react'
import { insightsApi } from '../api/insights'
import { quizApi } from '../api/quiz'
import { useAuthStore } from '../store'
import type { Exam } from '../types'

const EXAM_BG: Record<string, string> = {
  indigo: 'bg-indigo-500', blue: 'bg-blue-500', green: 'bg-green-500',
  orange: 'bg-orange-500', purple: 'bg-purple-500', rose: 'bg-rose-500',
  amber: 'bg-amber-500', yellow: 'bg-yellow-500',
}

type Tab = 'recurring' | 'highyield'

function MarkdownContent({ text }: { text: string }) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let tableRows: string[] = []
  let inTable = false
  let key = 0

  const flushTable = () => {
    if (tableRows.length < 2) { tableRows = []; inTable = false; return }
    const [header, , ...rows] = tableRows
    const headers = header.split('|').map(h => h.trim()).filter(Boolean)
    elements.push(
      <div key={key++} className="overflow-x-auto my-3">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-indigo-50">
              {headers.map((h, i) => (
                <th key={i} className="text-left px-3 py-2 font-semibold text-indigo-800 border border-indigo-100 text-xs">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const cells = row.split('|').map(c => c.trim()).filter(Boolean)
              return (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {cells.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 border border-gray-100 text-xs text-gray-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
    tableRows = []; inTable = false
  }

  for (const line of lines) {
    if (line.includes('|') && line.trim().startsWith('|')) {
      inTable = true
      tableRows.push(line)
      continue
    }
    if (inTable) flushTable()

    if (!line.trim()) {
      elements.push(<div key={key++} className="h-2" />)
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-base font-bold text-gray-900 mt-5 mb-2 flex items-center gap-2">
          <span className="w-1 h-5 bg-indigo-500 rounded-full inline-block" />
          {line.slice(3)}
        </h2>
      )
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} className="text-sm font-semibold text-indigo-700 mt-4 mb-1">
          {line.slice(4)}
        </h3>
      )
    } else if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={key++} className="text-sm font-semibold text-gray-700 mt-3 mb-1">
          {line.slice(5)}
        </h4>
      )
    } else if (line.match(/^\d+\.\s/)) {
      elements.push(
        <div key={key++} className="flex gap-2 text-sm text-gray-700 mb-1">
          <span className="text-indigo-500 font-bold flex-shrink-0">{line.match(/^\d+/)![0]}.</span>
          <span>{renderInline(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      )
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={key++} className="flex gap-2 text-sm text-gray-700 mb-1 ml-2">
          <span className="text-indigo-400 mt-1 flex-shrink-0">•</span>
          <span>{renderInline(line.slice(2))}</span>
        </div>
      )
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={key++} className="border-l-3 border-indigo-300 pl-3 text-sm text-gray-600 italic my-2">
          {line.slice(2)}
        </blockquote>
      )
    } else {
      elements.push(
        <p key={key++} className="text-sm text-gray-700 leading-relaxed mb-1">
          {renderInline(line)}
        </p>
      )
    }
  }
  if (inTable) flushTable()
  return <div>{elements}</div>
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i} className="italic">{part.slice(1, -1)}</em>
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="bg-gray-100 text-indigo-700 px-1 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>
    return part
  })
}

export default function Insights() {
  const { user, token } = useAuthStore()
  const [exams, setExams] = useState<Record<string, Exam>>({})
  const [selectedExam, setSelectedExam] = useState(user?.selected_exam || '')
  const [subjects, setSubjects] = useState<string[]>([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [tab, setTab] = useState<Tab>('recurring')
  const [content, setContent] = useState<Record<Tab, string>>({ recurring: '', highyield: '' })
  const [streaming, setStreaming] = useState(false)
  const [showExams, setShowExams] = useState(!user?.selected_exam)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    quizApi.getExams().then(setExams)
  }, [])

  useEffect(() => {
    if (selectedExam) {
      insightsApi.getSubjects(selectedExam).then((subs) => {
        setSubjects(subs)
        setSelectedSubject(subs[0] || '')
        setContent({ recurring: '', highyield: '' })
      })
    }
  }, [selectedExam])

  useEffect(() => {
    if (selectedExam && selectedSubject) {
      setContent({ recurring: '', highyield: '' })
      streamInsight(tab)
    }
  }, [selectedSubject])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [content])

  const streamInsight = async (insightTab: Tab) => {
    if (!selectedExam || !selectedSubject || streaming) return
    if (content[insightTab]) return  // already loaded

    setTab(insightTab)
    setStreaming(true)
    setContent((c) => ({ ...c, [insightTab]: '' }))

    const lang = user?.language_preference || 'english'
    const fetchFn = insightTab === 'recurring'
      ? insightsApi.streamRecurring(selectedExam, selectedSubject, lang, token!)
      : insightsApi.streamHighYield(selectedExam, selectedSubject, lang, token!)

    try {
      const response = await fetchFn
      if (!response.body) return
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            setContent((c) => ({ ...c, [insightTab]: c[insightTab] + data }))
          }
        }
      }
    } finally {
      setStreaming(false)
    }
  }

  const switchTab = (t: Tab) => {
    setTab(t)
    if (!content[t]) streamInsight(t)
  }

  const refresh = () => {
    setContent((c) => ({ ...c, [tab]: '' }))
    setTimeout(() => streamInsight(tab), 50)
  }

  const currentExam = exams[selectedExam]

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            AI Insights
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Recurring questions & high-yield topics from past 10 years
          </p>
        </div>
      </div>

      {/* Exam selector */}
      <div>
        <button
          onClick={() => setShowExams(!showExams)}
          className="w-full flex items-center justify-between p-3 card hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            {currentExam ? (
              <>
                <div className={`w-8 h-8 ${EXAM_BG[currentExam.color] || 'bg-gray-500'} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>
                  {currentExam.short?.slice(0, 2)}
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900">{currentExam.name}</div>
                  <div className="text-xs text-gray-400">{selectedSubject || 'Select a subject'}</div>
                </div>
              </>
            ) : (
              <span className="text-sm text-gray-500">Select exam to get AI insights</span>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showExams ? 'rotate-180' : ''}`} />
        </button>

        {showExams && (
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(exams).map(([key, exam]) => (
              <button
                key={key}
                onClick={() => { setSelectedExam(key); setShowExams(false) }}
                className={`p-2.5 rounded-lg border-2 text-left flex items-center gap-2 transition-all ${
                  selectedExam === key ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`w-7 h-7 ${EXAM_BG[exam.color] || 'bg-gray-500'} rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {exam.short?.slice(0, 2)}
                </div>
                <span className={`text-xs font-medium truncate ${selectedExam === key ? 'text-indigo-700' : 'text-gray-700'}`}>
                  {exam.short}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Subject pills */}
      {subjects.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => { setSelectedSubject(s) }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedSubject === s
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      {selectedExam && selectedSubject && (
        <>
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => switchTab('recurring')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === 'recurring'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Recurring Questions
            </button>
            <button
              onClick={() => switchTab('highyield')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === 'highyield'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Target className="w-4 h-4" />
              High-Yield Topics
            </button>
          </div>

          {/* Content area */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-semibold text-gray-800">
                  {tab === 'recurring' ? 'Frequently Repeated Questions' : 'High-Yield Topics to Score Maximum'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {streaming && (
                  <span className="text-xs text-indigo-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 animate-pulse" /> Analysing...
                  </span>
                )}
                {content[tab] && !streaming && (
                  <button
                    onClick={refresh}
                    title="Refresh analysis"
                    className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {!content[tab] && streaming && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">
                  AI is analysing {selectedExam} – {selectedSubject} paper patterns...
                </p>
              </div>
            )}

            {!content[tab] && !streaming && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                {tab === 'recurring'
                  ? <RotateCcw className="w-10 h-10 text-gray-200" />
                  : <Target className="w-10 h-10 text-gray-200" />}
                <p className="text-sm text-gray-400">
                  {tab === 'recurring'
                    ? 'Click to find questions that repeat across years'
                    : 'Click to see which topics carry the most marks'}
                </p>
                <button
                  onClick={() => streamInsight(tab)}
                  className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Analysis
                </button>
              </div>
            )}

            {content[tab] && (
              <div className="prose-custom">
                <MarkdownContent text={content[tab]} />
                {streaming && (
                  <span className="inline-block w-1.5 h-4 bg-indigo-500 animate-pulse rounded ml-0.5" />
                )}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </>
      )}

      {!selectedExam && (
        <div className="card p-8 text-center">
          <Lightbulb className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">
            Select an exam above to get AI-powered insights on frequently repeated questions and high-yield topics.
          </p>
        </div>
      )}
    </div>
  )
}
