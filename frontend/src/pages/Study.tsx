import { useState, useEffect, useRef } from 'react'
import {
  BookOpen, ChevronRight, ChevronLeft, Trophy, CheckCircle,
  XCircle, Sparkles, RotateCcw, GraduationCap, ChevronDown,
  Play, Star, Brain
} from 'lucide-react'
import { studyApi, TopicItem } from '../api/study'
import { quizApi } from '../api/quiz'
import { useAuthStore } from '../store'
import type { Question, AnswerResult } from '../types'

// ── Slide types ─────────────────────────────────────────────────────────────
interface Slide {
  id: number
  type: 'intro' | 'concept' | 'facts' | 'example' | 'memory' | 'exam'
  title: string
  icon: string
  content: string
  points: string[]
}

function parseLesson(text: string): Slide[] {
  const slides: Slide[] = []
  const blocks = text.split(/\[SLIDE:\d+\]/).filter((s) => s.trim())
  blocks.forEach((block, i) => {
    const get = (key: string) => {
      const m = block.match(new RegExp(`${key}:\\s*(.+)`))
      return m ? m[1].trim() : ''
    }
    const contentM = block.match(/CONTENT:\s*([\s\S]*?)(?=POINTS:|$)/)
    const pointsM = block.match(/POINTS:\s*([\s\S]*)/)
    const points = pointsM
      ? pointsM[1].split('\n').filter((l) => l.trim().startsWith('-')).map((l) => l.replace(/^-\s*/, '').trim()).filter(Boolean)
      : []
    const title = get('TITLE')
    if (title) {
      slides.push({
        id: i + 1,
        type: (get('TYPE') as Slide['type']) || 'concept',
        title,
        icon: get('ICON') || '📚',
        content: contentM ? contentM[1].replace(/\\n/g, '\n').trim() : '',
        points,
      })
    }
  })
  return slides
}

const SLIDE_STYLES: Record<Slide['type'], { bg: string; border: string; accent: string; iconBg: string }> = {
  intro:   { bg: 'from-indigo-50 to-white',  border: 'border-indigo-200', accent: 'text-indigo-700', iconBg: 'bg-indigo-100' },
  concept: { bg: 'from-blue-50 to-white',    border: 'border-blue-200',   accent: 'text-blue-700',   iconBg: 'bg-blue-100' },
  facts:   { bg: 'from-amber-50 to-white',   border: 'border-amber-200',  accent: 'text-amber-700',  iconBg: 'bg-amber-100' },
  example: { bg: 'from-green-50 to-white',   border: 'border-green-200',  accent: 'text-green-700',  iconBg: 'bg-green-100' },
  memory:  { bg: 'from-purple-50 to-white',  border: 'border-purple-200', accent: 'text-purple-700', iconBg: 'bg-purple-100' },
  exam:    { bg: 'from-rose-50 to-white',    border: 'border-rose-200',   accent: 'text-rose-700',   iconBg: 'bg-rose-100' },
}

// ── Lesson Player ────────────────────────────────────────────────────────────
function LessonPlayer({
  slides,
  onComplete,
}: {
  slides: Slide[]
  onComplete: () => void
}) {
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)
  const slide = slides[current]
  const style = SLIDE_STYLES[slide.type]
  const isLast = current === slides.length - 1

  const go = (dir: 1 | -1) => {
    setVisible(false)
    setTimeout(() => { setCurrent((c) => c + dir); setVisible(true) }, 180)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-4 px-1">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= current ? 'bg-indigo-500' : 'bg-gray-200'}`}
          />
        ))}
      </div>

      {/* Slide */}
      <div
        className={`flex-1 rounded-2xl border-2 bg-gradient-to-br ${style.bg} ${style.border} p-5 transition-all duration-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
      >
        <div className="flex items-start gap-3 mb-4">
          <span className={`text-3xl w-12 h-12 flex items-center justify-center rounded-xl ${style.iconBg} flex-shrink-0`}>
            {slide.icon}
          </span>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${style.accent} mb-0.5`}>
              Slide {current + 1} of {slides.length}
            </p>
            <h2 className="text-lg font-bold text-gray-900">{slide.title}</h2>
          </div>
        </div>

        {slide.content && (
          <p className="text-sm text-gray-700 leading-relaxed mb-4">{slide.content}</p>
        )}

        {slide.points.length > 0 && (
          <ul className="space-y-2">
            {slide.points.map((pt, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-800">
                <span className={`w-5 h-5 rounded-full ${style.iconBg} ${style.accent} flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5`}>
                  {i + 1}
                </span>
                {pt}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Nav buttons */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => go(-1)}
          disabled={current === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <span className="text-xs text-gray-400">{current + 1}/{slides.length}</span>

        {isLast ? (
          <button
            onClick={onComplete}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm"
          >
            <GraduationCap className="w-4 h-4" /> Take Quiz
          </button>
        ) : (
          <button
            onClick={() => go(1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Topic Quiz (5 Qs) ────────────────────────────────────────────────────────
const MAX_QUIZ_QUESTIONS = 5
const DIFF_COLOR = ['', 'text-green-600', 'text-blue-600', 'text-yellow-600', 'text-orange-600', 'text-red-600']
const DIFF_LABEL = ['', 'Beginner', 'Easy', 'Medium', 'Hard', 'Expert']

function TopicQuiz({
  examType,
  subject,
  topic,
  onDone,
}: {
  examType: string
  subject: string
  topic: string
  onDone: (score: number) => void
}) {
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [question, setQuestion] = useState<Question | null>(null)
  const [selected, setSelected] = useState('')
  const [result, setResult] = useState<AnswerResult | null>(null)
  const [qNum, setQNum] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    quizApi.startSession(examType, subject, topic).then((s) => {
      setSessionId(s.id)
      fetchQ(s.id)
    })
  }, [])

  const fetchQ = async (sid: number) => {
    setLoading(true)
    setSelected('')
    setResult(null)
    try {
      const q = await quizApi.getQuestion(sid)
      setQuestion(q)
    } finally {
      setLoading(false)
    }
  }

  const submit = async () => {
    if (!question || !sessionId || !selected) return
    setLoading(true)
    try {
      const res = await quizApi.submitAnswer({
        session_id: sessionId,
        question_text: question.question,
        options: question.options,
        correct_answer: question.correct_answer,
        user_answer: selected,
        difficulty: question.difficulty,
        topic: question.topic,
        explanation: question.explanation,
      })
      setResult(res)
      if (res.is_correct) setCorrect((c) => c + 1)
    } finally {
      setLoading(false)
    }
  }

  const next = () => {
    const nextQ = qNum + 1
    if (nextQ >= MAX_QUIZ_QUESTIONS) {
      onDone(Math.round(((correct + (result?.is_correct ? 1 : 0)) / MAX_QUIZ_QUESTIONS) * 100))
    } else {
      setQNum(nextQ)
      fetchQ(sessionId!)
    }
  }

  if (loading && !question) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Generating question {qNum + 1} of {MAX_QUIZ_QUESTIONS}...</p>
      </div>
    )
  }

  if (!question) return null

  const opts = question.options as Record<string, string>
  const answered = !!result

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {Array.from({ length: MAX_QUIZ_QUESTIONS }).map((_, i) => (
            <div
              key={i}
              className={`w-7 h-1.5 rounded-full transition-colors ${i < qNum ? 'bg-indigo-500' : i === qNum ? 'bg-indigo-300' : 'bg-gray-200'}`}
            />
          ))}
        </div>
        <span className={`text-xs font-medium ${DIFF_COLOR[question.difficulty]}`}>
          {DIFF_LABEL[question.difficulty]}
        </span>
      </div>

      {/* Question */}
      <p className="text-sm font-medium text-gray-900 leading-relaxed">{question.question}</p>

      {/* Options */}
      <div className="space-y-2">
        {Object.entries(opts).map(([k, v]) => {
          let cls = 'border-gray-200 bg-white text-gray-800 hover:border-indigo-300'
          if (answered) {
            if (k === question.correct_answer) cls = 'border-green-400 bg-green-50 text-green-800'
            else if (k === selected) cls = 'border-red-400 bg-red-50 text-red-800'
            else cls = 'border-gray-100 bg-gray-50 text-gray-400'
          } else if (selected === k) {
            cls = 'border-indigo-400 bg-indigo-50 text-indigo-800'
          }
          return (
            <button
              key={k}
              onClick={() => !answered && setSelected(k)}
              className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all flex items-center gap-2 ${cls}`}
            >
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs font-bold flex-shrink-0">
                {k}
              </span>
              {v}
              {answered && k === question.correct_answer && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
              {answered && k === selected && k !== question.correct_answer && <XCircle className="w-4 h-4 text-red-500 ml-auto" />}
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {answered && question.explanation && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 leading-relaxed">
          <span className="font-semibold">Explanation: </span>{question.explanation}
        </div>
      )}

      {/* Action */}
      <div className="pt-1">
        {!answered ? (
          <button
            onClick={submit}
            disabled={!selected || loading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold disabled:opacity-40 hover:bg-indigo-700 transition-all"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={next}
            className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            {qNum + 1 >= MAX_QUIZ_QUESTIONS ? (
              <><Trophy className="w-4 h-4" /> See Results</>
            ) : (
              <>Next Question <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Results ──────────────────────────────────────────────────────────────────
function ResultScreen({
  topic,
  score,
  onStudyAgain,
  onBackToTopics,
}: {
  topic: string
  score: number
  onStudyAgain: () => void
  onBackToTopics: () => void
}) {
  const stars = score >= 80 ? 3 : score >= 60 ? 2 : 1
  const msg = score >= 80 ? 'Excellent work!' : score >= 60 ? 'Good job!' : 'Keep practising!'

  return (
    <div className="flex flex-col items-center text-center py-6 gap-5">
      <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center">
        <Trophy className="w-10 h-10 text-indigo-500" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{score}%</h2>
        <p className="text-sm text-gray-500 mt-1">{msg}</p>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3].map((s) => (
          <Star
            key={s}
            className={`w-8 h-8 ${s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
          />
        ))}
      </div>
      <p className="text-sm text-gray-600">
        Topic: <span className="font-semibold text-gray-800">{topic}</span>
      </p>
      <div className="flex gap-3 w-full">
        <button
          onClick={onStudyAgain}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-indigo-200 text-indigo-700 text-sm font-medium hover:bg-indigo-50 transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Retry
        </button>
        <button
          onClick={onBackToTopics}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all"
        >
          <BookOpen className="w-4 h-4" /> Next Topic
        </button>
      </div>
    </div>
  )
}

// ── Main Study Page ──────────────────────────────────────────────────────────
type Phase = 'hub' | 'loading' | 'lesson' | 'quiz' | 'result'

export default function Study() {
  const { user, token } = useAuthStore()
  const [exams, setExams] = useState<Record<string, { name: string; short: string; color: string; subjects: string[] }>>({})
  const [selectedExam, setSelectedExam] = useState(user?.selected_exam || '')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [topics, setTopics] = useState<TopicItem[]>([])
  const [selectedTopic, setSelectedTopic] = useState('')
  const [phase, setPhase] = useState<Phase>('hub')
  const [slides, setSlides] = useState<Slide[]>([])
  const [lessonText, setLessonText] = useState('')
  const [quizScore, setQuizScore] = useState(0)
  const [showExamPicker, setShowExamPicker] = useState(!user?.selected_exam)
  const streamRef = useRef(false)

  const EXAM_BG: Record<string, string> = {
    indigo: 'bg-indigo-500', blue: 'bg-blue-500', green: 'bg-green-500',
    orange: 'bg-orange-500', purple: 'bg-purple-500', rose: 'bg-rose-500',
    amber: 'bg-amber-500', yellow: 'bg-yellow-500',
  }

  useEffect(() => {
    quizApi.getExams().then(setExams)
  }, [])

  useEffect(() => {
    if (selectedExam) loadSubjects()
  }, [selectedExam])

  const loadSubjects = async () => {
    const data = await quizApi.getSubjects(selectedExam)
    const subs = Object.keys(data.subjects)
    setSelectedSubject(subs[0] || '')
  }

  useEffect(() => {
    if (selectedExam && selectedSubject) {
      studyApi.getTopics(selectedExam, selectedSubject).then(setTopics)
    }
  }, [selectedExam, selectedSubject])

  const startLesson = async (topic: string) => {
    setSelectedTopic(topic)
    setPhase('loading')
    setLessonText('')
    streamRef.current = true

    const lang = user?.language_preference || 'english'

    try {
      const resp = await studyApi.streamLesson(selectedExam, selectedSubject, topic, lang, token!)
      if (!resp.body) return
      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (streamRef.current) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            const txt = line.slice(6)
            if (txt === '[DONE]') { streamRef.current = false; break }
            full += txt.replace(/\\n/g, '\n')
            setLessonText(full)
          }
        }
      }

      const parsed = parseLesson(full)
      if (parsed.length >= 4) {
        setSlides(parsed)
        setPhase('lesson')
      } else {
        // fallback — show raw text as single slide
        setSlides([{ id: 1, type: 'concept', title: topic, icon: '📚', content: full, points: [] }])
        setPhase('lesson')
      }
    } catch {
      setPhase('hub')
    }
  }

  const onLessonComplete = () => setPhase('quiz')

  const onQuizDone = async (score: number) => {
    setQuizScore(score)
    await studyApi.completeTopic(selectedExam, selectedSubject, selectedTopic, score)
    // refresh topics
    studyApi.getTopics(selectedExam, selectedSubject).then(setTopics)
    setPhase('result')
  }

  const backToTopics = () => {
    setPhase('hub')
    setSelectedTopic('')
    setSlides([])
  }

  const currentExam = exams[selectedExam]

  // ── Hub ──
  if (phase === 'hub') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            Study Hub
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Learn each topic, then test yourself</p>
        </div>

        {/* Exam picker */}
        <div>
          <button
            onClick={() => setShowExamPicker(!showExamPicker)}
            className="w-full flex items-center justify-between p-3 card hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              {currentExam ? (
                <>
                  <div className={`w-8 h-8 ${EXAM_BG[currentExam.color] || 'bg-gray-500'} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>
                    {currentExam.short?.slice(0, 2)}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{currentExam.name}</span>
                </>
              ) : (
                <span className="text-sm text-gray-500">Select your exam</span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showExamPicker ? 'rotate-180' : ''}`} />
          </button>

          {showExamPicker && (
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(exams).map(([k, e]) => (
                <button
                  key={k}
                  onClick={() => { setSelectedExam(k); setShowExamPicker(false) }}
                  className={`p-2.5 rounded-lg border-2 text-left flex items-center gap-2 transition-all ${
                    selectedExam === k ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`w-7 h-7 ${EXAM_BG[e.color] || 'bg-gray-500'} rounded flex items-center justify-center text-white text-xs font-bold`}>
                    {e.short?.slice(0, 2)}
                  </div>
                  <span className={`text-xs font-medium truncate ${selectedExam === k ? 'text-indigo-700' : 'text-gray-700'}`}>{e.short}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Subject tabs */}
        {selectedExam && (
          <SubjectTabs
            examType={selectedExam}
            selected={selectedSubject}
            onSelect={setSelectedSubject}
          />
        )}

        {/* Topics grid */}
        {topics.length > 0 && (
          <div className="grid grid-cols-1 gap-2">
            {topics.map((t, i) => (
              <button
                key={t.name}
                onClick={() => startLesson(t.name)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all hover:shadow-sm ${
                  t.completed
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-indigo-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  t.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {t.completed ? <CheckCircle className="w-5 h-5 text-green-500" /> : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${t.completed ? 'text-green-800' : 'text-gray-800'}`}>
                    {t.name}
                  </p>
                  {t.completed && t.score !== null && (
                    <p className="text-xs text-green-600">Quiz score: {t.score}%</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {t.completed && <span className="text-xs text-green-600 font-medium">Done</span>}
                  <Play className={`w-4 h-4 ${t.completed ? 'text-green-400' : 'text-indigo-400'}`} />
                </div>
              </button>
            ))}
          </div>
        )}

        {!selectedExam && (
          <div className="card p-8 text-center">
            <Brain className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Select an exam to start studying</p>
          </div>
        )}
      </div>
    )
  }

  // ── Loading ──
  if (phase === 'loading') {
    const pct = lessonText.length > 0 ? Math.min(95, Math.round((lessonText.length / 1800) * 100)) : 0
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center gap-6 text-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
          <div
            className="absolute inset-0 rounded-full border-4 border-indigo-500 border-r-transparent transition-all duration-500"
            style={{ transform: `rotate(${pct * 3.6}deg)` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Preparing your lesson</h2>
          <p className="text-sm text-gray-500 mt-1">{selectedTopic}</p>
        </div>
        <div className="w-full max-w-xs bg-gray-100 rounded-full h-1.5">
          <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-gray-400">
          Fetching from textbooks... {pct > 0 && `${pct}%`}
        </p>
      </div>
    )
  }

  const header = (
    <div className="flex items-center gap-3 mb-5">
      <button
        onClick={backToTopics}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div>
        <p className="text-xs text-gray-400">{selectedSubject}</p>
        <h1 className="text-base font-bold text-gray-900">{selectedTopic}</h1>
      </div>
      <div className="ml-auto">
        {phase === 'lesson' && (
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> Lesson
          </span>
        )}
        {phase === 'quiz' && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
            <GraduationCap className="w-3 h-3" /> Quiz
          </span>
        )}
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {header}

      {phase === 'lesson' && (
        <LessonPlayer slides={slides} onComplete={onLessonComplete} />
      )}

      {phase === 'quiz' && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-bold text-gray-900">Topic Quiz — {selectedTopic}</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">Answer 5 questions to complete this topic</p>
          <TopicQuiz
            examType={selectedExam}
            subject={selectedSubject}
            topic={selectedTopic}
            onDone={onQuizDone}
          />
        </div>
      )}

      {phase === 'result' && (
        <div className="card p-5">
          <ResultScreen
            topic={selectedTopic}
            score={quizScore}
            onStudyAgain={() => startLesson(selectedTopic)}
            onBackToTopics={backToTopics}
          />
        </div>
      )}
    </div>
  )
}

// ── Subject Tabs helper (needs quiz API for subjects list) ───────────────────
function SubjectTabs({
  examType,
  selected,
  onSelect,
}: {
  examType: string
  selected: string
  onSelect: (s: string) => void
}) {
  const [subjects, setSubjects] = useState<string[]>([])

  useEffect(() => {
    quizApi.getSubjects(examType).then((d) => {
      const subs = Object.keys(d.subjects)
      setSubjects(subs)
      if (!selected && subs.length) onSelect(subs[0])
    })
  }, [examType])

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {subjects.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            selected === s
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  )
}
