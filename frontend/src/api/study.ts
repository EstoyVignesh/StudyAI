import api from './client'

export interface TopicItem {
  name: string
  completed: boolean
  score: number | null
}

export const studyApi = {
  getTopics: async (examType: string, subject: string): Promise<TopicItem[]> => {
    const { data } = await api.get(`/study/${examType}/${encodeURIComponent(subject)}/topics`)
    return data.topics
  },

  streamLesson: (examType: string, subject: string, topic: string, language: string, token: string) =>
    fetch(
      `/api/study/${examType}/${encodeURIComponent(subject)}/${encodeURIComponent(topic)}/lesson?language=${language}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ),

  getSubjects: async (examType: string) => {
    const { data } = await api.get(`/quiz/exams/${examType}/subjects`)
    return data as { subjects: Record<string, string[]> }
  },

  completeTopic: async (examType: string, subject: string, topic: string, quizScore?: number) => {
    const { data } = await api.post('/study/complete', {
      exam_type: examType,
      subject,
      topic,
      quiz_score: quizScore,
    })
    return data
  },
}
