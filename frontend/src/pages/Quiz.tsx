import { useState, useEffect, useCallback } from 'react'
import { ChevronRight, RefreshCw, CheckCircle, XCircle, Trophy, ArrowLeft } from 'lucide-react'
import { quizApi } from '../api/quiz'
import { useAuthStore } from '../store'
import type { Question, AnswerResult, QuizSession } from '../types'

const DIFFICULTY_LABELS = ['', 'Beginner', 'Easy', 'Medium', 'Hard', 'Expert']
const DIFFICULTY_COLORS = ['', 'text-green-600 bg-green-50', 'text-blue-600 bg-blue-50', 'text-yellow-600 bg-yellow-50', 'text-orange-600 bg-orange-50', 'text-red-600 bg-red-50']

type Phase = 'select-exam' | 'select-subject' | 'select-topic' | 'quiz' | 'result'

export default function Quiz() {
  const { user } = useAuthStore()
  const [phase, setPhase] = useState<Phase>('select-exam')
  const [exams, setExams] = useState<Record<string, { name: string; color: string; subjects: string[] }>>({})
  const [subjects, setSubjects] = useState<Record<string, string[]>>({})
  const [selectedExam, setSelectedExam] = useState(user?.selected_exam || '')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [session, setSession] = useState<QuizSession | null>(null)
  const [question, setQuestion] = useState<Question | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [result, setResult] = useState<AnswerResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  useEffect(() => {
    quizApi.getExams().then(setExams)
  }, [])

  const loadSubjects = async (exam: string) => {
    const data = await quizApi.getSubjects(exam)
    setSubjects(data.subjects)
    setSelectedExam(exam)
    setPhase('select-subject')
  }

  const startQuiz = async () => {
    setLoading(true)
    try {
      const s = await quizApi.startSession(selectedExam, selectedSubject, selectedTopic)
      setSession(s)
      setPhase('quiz')
      await fetchQuestion(s.id)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuestion = useCallback(async (sessionId: number) => {
    setLoading(true)
    setSelectedAnswer('')
    setResult(null)
    setShowExplanation(false)
    try {
      const q = await quizApi.getQuestion(sessionId)
      setQuestion(q)
    } finally {
      setLoading(false)
    }
  }, [])

  const submitAnswer = async () => {
    if (!question || !session || !selectedAnswer) return
    setLoading(true)
    try {
      const res = await quizApi.submitAnswer({
        session_id: session.id,
        question_text: question.question,
        options: question.options,
        correct_answer: question.correct_answer,
        user_answer: selectedAnswer,
        difficulty: question.difficulty,
        topic: question.topic,
        explanation: question.explanation,
      })
      setResult(res)
      setShowExplanation(true)
      setSession((s) => s ? { ...s, current_difficulty: res.new_difficulty } : s)
    } finally {
      setLoading(false)
    }
  }

  const endQuiz = async () => {
    if (session) {
      await quizApi.endSession(session.id)
    }
    setPhase('result')
  }

  const resetQuiz = () => {
    setPhase('select-exam')
    setSession(null)
    setQuestion(null)
    setResult(null)
    setSelectedAnswer('')
    setShowExplanation(false)
    setSelectedExam(user?.selected_exam || '')
    setSelectedSubject('')
    setSelectedTopic('')
  }

  // Exam selection
  if (phase === 'select-exam') {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Start Practice</h1>
        <p className="text-sm text-gray-500 mb-6">Choose your target exam</p>
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(exams).map(([key, exam]) => (
            <button
              key={key}
              onClick={() => loadSubjects(key)}
              className={`card p-4 text-left flex items-center gap-4 hover:shadow-md transition-all border-2 ${
                selectedExam === key ? 'border-indigo-400' : 'border-transparent'
              }`}
            >
              <div className={`w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold`}>
                {key}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{exam.name}</div>
                <div className="text-sm text-gray-500">{exam.subjects.slice(0, 3).join(', ')}{exam.subjects.length > 3 ? '...' : ''}</div>
              </div>
              <ChevronRight className="ml-auto text-gray-400 w-5 h-5" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Subject selection
  if (phase === 'select-subject') {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <button onClick={() => setPhase('select-exam')} className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Choose Subject</h1>
        <p className="text-sm text-gray-500 mb-4">{selectedExam} · Pick a subject</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(subjects).map((s) => (
            <button
              key={s}
              onClick={() => { setSelectedSubject(s); setPhase('select-topic') }}
              className="card p-3 text-left hover:shadow-md transition-shadow border-2 border-transparent hover:border-indigo-200"
            >
              <div className="font-medium text-gray-900 text-sm">{s}</div>
              <div className="text-xs text-gray-400 mt-0.5">{subjects[s].length} topics</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Topic selection
  if (phase === 'select-topic') {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <button onClick={() => setPhase('select-subject')} className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Choose Topic</h1>
        <p className="text-sm text-gray-500 mb-4">{selectedExam} · {selectedSubject}</p>
        <div className="space-y-2">
          {(subjects[selectedSubject] || []).map((t) => (
            <button
              key={t}
              onClick={() => { setSelectedTopic(t); }}
              className={`w-full card p-3 text-left flex items-center gap-3 hover:shadow-sm transition-all border-2 ${
                selectedTopic === t ? 'border-indigo-400 bg-indigo-50' : 'border-transparent'
              }`}
            >
              <div className="flex-1 text-sm font-medium text-gray-900">{t}</div>
              {selectedTopic === t && <CheckCircle className="w-4 h-4 text-indigo-500" />}
            </button>
          ))}
        </div>
        {selectedTopic && (
          <button
            onClick={startQuiz}
            disabled={loading}
            className="btn-primary w-full mt-4 py-3"
          >
            {loading ? 'Starting...' : `Start Quiz on "${selectedTopic}"`}
          </button>
        )}
      </div>
    )
  }

  // Result screen
  if (phase === 'result' && session) {
    const accuracy = session.questions_answered > 0
      ? Math.round((session.correct_answers / session.questions_answered) * 100)
      : 0
    return (
      <div className="max-w-lg mx-auto px-4 py-6 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Complete!</h1>
        <div className="grid grid-cols-3 gap-3 my-6">
          {[
            { label: 'Questions', value: session.questions_answered },
            { label: 'Correct', value: session.correct_answers },
            { label: 'Accuracy', value: `${accuracy}%` },
          ].map(({ label, value }) => (
            <div key={label} className="card p-3">
              <div className="text-xl font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mb-6">
          {accuracy >= 80 ? '🎉 Excellent work! Keep it up!' :
           accuracy >= 60 ? '👍 Good progress! Review weak areas.' :
           '📚 Keep practicing — consistency is key!'}
        </p>
        <div className="flex gap-3">
          <button onClick={resetQuiz} className="btn-primary flex-1 py-3">
            New Session
          </button>
          <button onClick={() => window.location.href = '/progress'} className="btn-secondary flex-1 py-3">
            View Progress
          </button>
        </div>
      </div>
    )
  }

  // Quiz screen
  if (phase === 'quiz') {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">
            Q{(session?.questions_answered || 0) + 1} · {selectedTopic}
          </div>
          <div className="flex items-center gap-2">
            {session && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[session.current_difficulty] || ''}`}>
                {DIFFICULTY_LABELS[session.current_difficulty]}
              </span>
            )}
            <button onClick={endQuiz} className="text-xs text-gray-400 hover:text-gray-600">
              End
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {session && (
          <div className="w-full h-1.5 bg-gray-100 rounded-full mb-5 overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${session.questions_answered > 0 ? Math.round((session.correct_answers / session.questions_answered) * 100) : 0}%` }}
            />
          </div>
        )}

        {loading && !question ? (
          <div className="flex flex-col items-center justify-center min-h-64 gap-3">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Generating question with AI...</p>
          </div>
        ) : question ? (
          <div className="animate-fade-in">
            {/* Question */}
            <div className="card p-4 mb-4">
              <p className="text-gray-900 font-medium leading-relaxed">{question.question}</p>
            </div>

            {/* Options */}
            <div className="space-y-2 mb-4">
              {Object.entries(question.options).map(([key, text]) => {
                let cls = 'card p-3 text-left w-full flex items-center gap-3 border-2 transition-all '
                if (result) {
                  if (key === question.correct_answer) cls += 'border-green-400 bg-green-50'
                  else if (key === selectedAnswer && !result.is_correct) cls += 'border-red-400 bg-red-50'
                  else cls += 'border-transparent opacity-60'
                } else {
                  cls += selectedAnswer === key
                    ? 'border-indigo-400 bg-indigo-50'
                    : 'border-transparent hover:border-gray-200'
                }
                return (
                  <button
                    key={key}
                    onClick={() => !result && setSelectedAnswer(key)}
                    disabled={!!result}
                    className={cls}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      result && key === question.correct_answer ? 'bg-green-500 text-white' :
                      result && key === selectedAnswer && !result.is_correct ? 'bg-red-500 text-white' :
                      selectedAnswer === key ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {key}
                    </span>
                    <span className="text-sm text-gray-800">{text}</span>
                  </button>
                )
              })}
            </div>

            {/* Explanation */}
            {showExplanation && result && (
              <div className={`card p-4 mb-4 border-l-4 ${result.is_correct ? 'border-l-green-400 bg-green-50' : 'border-l-red-400 bg-red-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.is_correct
                    ? <CheckCircle className="w-4 h-4 text-green-600" />
                    : <XCircle className="w-4 h-4 text-red-600" />}
                  <span className={`text-sm font-semibold ${result.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                    {result.is_correct ? 'Correct!' : `Incorrect. Answer: ${result.correct_answer}`}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{question.explanation}</p>
                <div className="mt-2 text-xs text-gray-500">
                  Session: {result.correct_answers}/{result.questions_answered} correct ({result.accuracy}%)
                </div>
              </div>
            )}

            {/* Action buttons */}
            {!result ? (
              <button
                onClick={submitAnswer}
                disabled={!selectedAnswer || loading}
                className="btn-primary w-full py-3"
              >
                Submit Answer
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => fetchQuestion(session!.id)}
                  disabled={loading}
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                  Next Question
                </button>
                <button onClick={endQuiz} className="btn-secondary px-4 py-3">
                  End Session
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    )
  }

  return null
}
