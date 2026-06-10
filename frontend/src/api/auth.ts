import api from './client'
import type { User } from '../types'

interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export const authApi = {
  register: async (
    email: string,
    username: string,
    password: string,
    selected_exam?: string,
    language_preference?: string,
    state?: string,
  ) => {
    const { data } = await api.post<AuthResponse>('/auth/register', {
      email,
      username,
      password,
      selected_exam,
      language_preference: language_preference || 'english',
      state,
    })
    return data
  },

  updateProfile: async (profile: { selected_exam?: string; language_preference?: string; state?: string }) => {
    const { data } = await api.patch<User>('/auth/me/profile', profile)
    return data
  },

  login: async (email: string, password: string) => {
    const params = new URLSearchParams()
    params.append('username', email)
    params.append('password', password)
    const { data } = await api.post<AuthResponse>('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return data
  },

  getMe: async () => {
    const { data } = await api.get<User>('/auth/me')
    return data
  },

  updateExam: async (selected_exam: string) => {
    const { data } = await api.patch<User>('/auth/me/exam', { selected_exam })
    return data
  },
}
