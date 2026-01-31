/**
 * Recruitment Service - API calls for recruitment system
 */

import api from './api'

export interface RecruitmentApplicationCreate {
  first_name: string
  last_name: string
  pseudo: string
  email: string
  age: string
  country: string
  languages: string
  motivation: string
  availability: string
  current_status: string
  interview_availability: string
  source?: string
}

export interface RecruitmentApplication {
  id: number
  first_name: string
  last_name: string
  pseudo: string
  email: string
  age: string
  country: string
  languages: string
  motivation: string
  availability: string
  current_status: string
  interview_availability: string
  status: 'NEW' | 'REVIEWED' | 'INTERVIEW_SCHEDULED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'
  source: string
  submitted_at: string
  reviewed_at: string | null
  reviewed_by_id: number | null
  admin_notes: string | null
}

export interface RecruitmentStats {
  total: number
  new: number
  reviewed: number
  accepted: number
  rejected: number
}

const recruitmentService = {
  /**
   * Submit a new recruitment application (public - no auth)
   */
  async submitApplication(data: RecruitmentApplicationCreate): Promise<RecruitmentApplication> {
    const response = await api.post('/recruitment/submit', data)
    return response.data
  },

  /**
   * Get all applications (Coach/Manager only)
   */
  async getAllApplications(
    status?: string,
    skip = 0,
    limit = 50
  ): Promise<{ total: number; applications: RecruitmentApplication[] }> {
    const params = new URLSearchParams()
    if (status) params.append('status_filter', status)
    params.append('skip', skip.toString())
    params.append('limit', limit.toString())

    const response = await api.get(`/recruitment/applications?${params.toString()}`)
    return response.data
  },

  /**
   * Get a single application by ID
   */
  async getApplication(id: number): Promise<RecruitmentApplication> {
    const response = await api.get(`/recruitment/applications/${id}`)
    return response.data
  },

  /**
   * Update application status/notes
   */
  async updateApplication(
    id: number,
    data: { status?: string; admin_notes?: string }
  ): Promise<RecruitmentApplication> {
    const response = await api.put(`/recruitment/applications/${id}`, data)
    return response.data
  },

  /**
   * Delete an application (Manager only)
   */
  async deleteApplication(id: number): Promise<void> {
    await api.delete(`/recruitment/applications/${id}`)
  },

  /**
   * Get recruitment statistics
   */
  async getStats(): Promise<RecruitmentStats> {
    const response = await api.get('/recruitment/stats')
    return response.data
  },
}

export default recruitmentService
