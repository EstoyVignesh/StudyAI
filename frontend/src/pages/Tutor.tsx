import { useState, useEffect, useRef } from 'react'
import { Send, Plus, MessageSquare, Loader2, Brain, ChevronDown } from 'lucide-react'
import { tutorApi } from '../api/tutor'
import { quizApi } from '../api/quiz'
import { useAuthStore } from '../store'
import type { ChatMessage, ChatSession } from '../types'

const WELCOME_MESSAGES: Record<string, string> = {
  UPSC: "Hello! I'm your UPSC tutor. Ask me anything about History, Geography, Polity, Economy, Environment, or Current Affairs. I can explain concepts, discuss previous year questions, or help you understand complex topics.",
  JEE: "Hi there! I'm your JEE tutor. Ask me anything about Physics, Chemistry, or Mathematics. I can solve problems step by step, explain concepts, or help with tricky JEE-style questions.",
  NEET: "Welcome! I'm your NEET tutor. Ask me anything about Physics, Chemistry, or Biology. I can explain biological processes, help with numerical problems, or clarify NCERT concepts.",
}

export default function Tutor() {
  const { user, token } = useAuthStore()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSession, setActiveSession] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [examType, setExamType] = useState(user?.selected_exam || 'UPSC')
  const [subjects, setSubjects] = useState<string[]>([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [showNewSession, setShowNewSession] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    tutorApi.listSessions().then((data) => {
      setSessions(data)
      if (data.length > 0 && !activeSession) {
        loadSession(data[0].id)
      }
    })
    quizApi.getSubjects(examType).then((d) => setSubjects(Object.keys(d.subjects)))
  }, [examType])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadSession = async (id: number) => {
    const msgs = await tutorApi.getMessages(id)
    setMessages(msgs)
    setActiveSession(id)
    setShowHistory(false)
  }

  const createNewSession = async () => {
    const { session_id } = await tutorApi.createSession(examType, selectedSubject || undefined)
    const newSession: ChatSession = {
      id: session_id,
      exam_type: examType,
      subject: selectedSubject || null,
      title: `${examType} Study Session`,
      created_at: new Date().toISOString(),
      message_count: 0,
    }
    setSessions((prev) => [newSession, ...prev])
    setActiveSession(session_id)
    setMessages([])
    setShowNewSession(false)
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || !activeSession || streaming) return

    setInput('')
    const userMsg: ChatMessage = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setStreaming(true)

    const assistantMsg: ChatMessage = { role: 'assistant', content: '' }
    setMessages((prev) => [...prev, assistantMsg])

    try {
      const response = await tutorApi.streamChat(activeSession, text, token!)
      if (!response.body) return

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            setMessages((prev) => {
              const updated = [...prev]
              const last = updated[updated.length - 1]
              if (last.role === 'assistant') {
                updated[updated.length - 1] = { ...last, content: last.content + data }
              }
              return updated
            })
          }
        }
      }
    } finally {
      setStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const currentSession = sessions.find((s) => s.id === activeSession)
  const welcomeMsg = WELCOME_MESSAGES[examType] || WELCOME_MESSAGES['UPSC']

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-5rem)] max-w-2xl mx-auto">
      {/* Session header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            <span className="font-semibold text-gray-900 text-sm">
              {currentSession ? currentSession.title : 'AI Tutor'}
            </span>
            {currentSession && (
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                {currentSession.exam_type}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              History <ChevronDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => setShowNewSession(true)}
              className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
              title="New session"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* History dropdown */}
        {showHistory && sessions.length > 0 && (
          <div className="mt-2 border border-gray-100 rounded-lg overflow-hidden shadow-sm">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => loadSession(s.id)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                  s.id === activeSession ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="flex-1 truncate">{s.title}</span>
                <span className="text-xs text-gray-400">{s.exam_type}</span>
              </button>
            ))}
          </div>
        )}

        {/* New session form */}
        {showNewSession && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="input text-sm"
              >
                {['UPSC', 'JEE', 'NEET'].map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="input text-sm"
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={createNewSession} className="btn-primary text-xs px-3 py-1.5">
                Create Session
              </button>
              <button onClick={() => setShowNewSession(false)} className="btn-secondary text-xs px-3 py-1.5">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Brain className="w-12 h-12 text-indigo-300 mb-3" />
            <h3 className="font-semibold text-gray-700 mb-2">Your AI Tutor</h3>
            <p className="text-sm text-gray-500 max-w-sm">{welcomeMsg}</p>
            <div className="mt-4 grid grid-cols-1 gap-2 w-full max-w-sm">
              {['Explain a concept', 'Solve a practice problem', 'Quiz me on a topic'].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="text-left text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                <Brain className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
              }`}
            >
              {msg.content || (streaming && i === messages.length - 1 ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              ) : '')}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white">
        <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeSession ? "Ask your tutor anything..." : "Create a session to start chatting"}
            disabled={!activeSession || streaming}
            rows={1}
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 resize-none outline-none max-h-24"
            style={{ lineHeight: '1.5' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !activeSession || streaming}
            className="p-1.5 bg-indigo-600 text-white rounded-lg disabled:opacity-40 hover:bg-indigo-700 transition-colors flex-shrink-0"
          >
            {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
