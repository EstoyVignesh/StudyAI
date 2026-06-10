import api from './client'
import type { ProgressOverview, WeakArea } from '../types'

export const progressApi = {
  getOverview: async (): Promise<ProgressOverview> => {
    const { data } = await api.get('/progress/overview')
    return data
  },

  getRecentSessions: async (limit = 10) => {
    const { data } = await api.get(`/progress/recent?limit=${limit}`)
    return data
  },

  getWeakAreas: async (): Promise<{ weak_areas: WeakArea[] }> => {
    const { data } = await api.get('/progress/weak-areas')
    return data
  },
}
