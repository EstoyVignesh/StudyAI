export interface User {
  id: number
  email: string
  username: string
  selected_exam: string | null
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (user: User) => void
}

export interface Exam {
  name: string
  description: string
  color: string
  subjects: string[]
}

export interface Question {
  question: string
  options: Record<string, string>
  correct_answer: string
  explanation: string
  topic: string
  difficulty: number
  session_id: number
  current_difficulty: number
  questions_answered: number
  correct_answers: number
  accuracy: number
}

export interface AnswerResult {
  is_correct: boolean
  correct_answer: string
  explanation: string
  new_difficulty: number
  questions_answered: number
  correct_answers: number
  accuracy: number
}

export interface ChatMessage {
  id?: number
  role: 'user' | 'assistant'
  content: string
}

export interface ChatSession {
  id: number
  exam_type: string
  subject: string | null
  title: string
  created_at: string
  message_count: number
}

export interface QuizSession {
  id: number
  exam_type: string
  subject: string
  topic: string
  current_difficulty: number
  questions_answered: number
  correct_answers: number
}

export interface ProgressOverview {
  total_sessions: number
  total_questions: number
  total_correct: number
  overall_accuracy: number
  by_exam: Record<string, ExamProgress>
}

export interface ExamProgress {
  sessions: number
  questions: number
  correct: number
  accuracy: number
  subjects: Record<string, SubjectProgress>
}

export interface SubjectProgress {
  questions: number
  correct: number
  accuracy: number
}

export interface WeakArea {
  topic: string
  accuracy: number
  questions_attempted: number
}
