import api from './client'

export interface Material {
  id: number
  exam_type: string
  subject: string
  title: string
  year: number | null
  material_type: string
  url: string
  language: string
  tags: string[]
  is_official: boolean
}

export interface MaterialsByExam {
  exam_type: string
  total: number
  by_subject: Record<string, Material[]>
}

export const materialsApi = {
  getByExam: async (examType: string, language?: string): Promise<MaterialsByExam> => {
    const { data } = await api.get(`/materials/by-exam/${examType}`, {
      params: language ? { language } : undefined,
    })
    return data
  },

  list: async (params?: {
    exam_type?: string
    subject?: string
    year?: number
    material_type?: string
    language?: string
  }) => {
    const { data } = await api.get<Material[]>('/materials/', { params })
    return data
  },
}
