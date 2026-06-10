import api from './client'

export const insightsApi = {
  getSubjects: async (examType: string): Promise<string[]> => {
    const { data } = await api.get(`/insights/${examType}/subjects`)
    return data
  },

  streamRecurring: (examType: string, subject: string, language: string, token: string) =>
    fetch(`/api/insights/${examType}/recurring?subject=${encodeURIComponent(subject)}&language=${language}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  streamHighYield: (examType: string, subject: string, language: string, token: string) =>
    fetch(`/api/insights/${examType}/high-yield?subject=${encodeURIComponent(subject)}&language=${language}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
}
