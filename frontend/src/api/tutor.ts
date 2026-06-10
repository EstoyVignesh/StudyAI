import api from './client'
import type { ChatMessage, ChatSession } from '../types'

export const tutorApi = {
  createSession: async (exam_type: string, subject?: string, title?: string) => {
    const { data } = await api.post('/tutor/session', { exam_type, subject, title })
    return data as { session_id: number; title: string }
  },

  listSessions: async (): Promise<ChatSession[]> => {
    const { data } = await api.get('/tutor/sessions')
    return data
  },

  getMessages: async (sessionId: number): Promise<ChatMessage[]> => {
    const { data } = await api.get(`/tutor/session/${sessionId}/messages`)
    return data
  },

  streamChat: (sessionId: number, content: string, token: string) => {
    return fetch('/api/tutor/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ session_id: sessionId, content }),
    })
  },
}
