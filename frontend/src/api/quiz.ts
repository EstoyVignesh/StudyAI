import api from './client'
import type { Exam, Question, AnswerResult, QuizSession } from '../types'

export const quizApi = {
  getExams: async (): Promise<Record<string, Exam>> => {
    const { data } = await api.get('/quiz/exams')
    return data
  },

  getSubjects: async (examType: string) => {
    const { data } = await api.get(`/quiz/exams/${examType}/subjects`)
    return data as { exam_type: string; subjects: Record<string, string[]> }
  },

  startSession: async (exam_type: string, subject: string, topic: string): Promise<QuizSession> => {
    const { data } = await api.post('/quiz/session/start', { exam_type, subject, topic })
    return data
  },

  getQuestion: async (sessionId: number): Promise<Question> => {
    const { data } = await api.get(`/quiz/session/${sessionId}/question`)
    return data
  },

  submitAnswer: async (payload: {
    session_id: number
    question_text: string
    options: Record<string, string>
    correct_answer: string
    user_answer: string
    difficulty: number
    topic: string
    explanation: string
  }): Promise<AnswerResult> => {
    const { data } = await api.post('/quiz/session/answer', payload)
    return data
  },

  endSession: async (sessionId: number) => {
    const { data } = await api.post(`/quiz/session/${sessionId}/end`)
    return data
  },
}
