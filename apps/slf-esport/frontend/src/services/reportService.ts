/**
 * Report service - API calls for reports management
 */

import api from './api'

// Types
export interface Report {
  id: number
  title: string
  report_type: string
  format: string
  filename: string
  file_size: number | null
  file_path: string | null
  generated_by_id: number
  generated_at: string
  parameters: string | null
  is_available: boolean
}

export interface ReportWithContent extends Report {
  content: string | null
}

export interface ReportGenerateRequest {
  report_type: string
  format?: string
  title?: string
  parameters?: Record<string, unknown>
}

export interface ReportCreate {
  title: string
  report_type: string
  format: string
  filename: string
  file_size?: number
  file_path?: string
  content?: string
  parameters?: string
}

export interface ReportListResponse {
  total: number
  reports: Report[]
}

// Report types for UI
export const REPORT_TYPES = {
  analytics: {
    label: 'Analytics',
    description: 'Statistiques globales de performance',
    icon: '📊',
  },
  progression: {
    label: 'Progression',
    description: 'Évolution des joueurs dans le temps',
    icon: '📈',
  },
  attendance: {
    label: 'Assiduité',
    description: 'Taux de présence aux sessions',
    icon: '📅',
  },
  exercises: {
    label: 'Exercices',
    description: 'Performances aux exercices cognitifs',
    icon: '🎯',
  },
  team: {
    label: 'Équipe',
    description: 'Vue d\'ensemble de l\'équipe',
    icon: '👥',
  },
} as const

export type ReportType = keyof typeof REPORT_TYPES

const reportService = {
  /**
   * Generate a new report
   */
  async generateReport(request: ReportGenerateRequest): Promise<Report> {
    const response = await api.post<Report>('/reports/generate', request)
    return response.data
  },

  /**
   * Save a report with content
   */
  async saveReport(data: ReportCreate): Promise<Report> {
    const response = await api.post<Report>('/reports/save', data)
    return response.data
  },

  /**
   * Get user's reports
   */
  async getMyReports(reportType?: string, skip = 0, limit = 50): Promise<Report[]> {
    const params = new URLSearchParams()
    if (reportType) params.append('report_type', reportType)
    params.append('skip', skip.toString())
    params.append('limit', limit.toString())

    const response = await api.get<Report[]>(`/reports/my?${params}`)
    return response.data
  },

  /**
   * Get all reports (managers only)
   */
  async getAllReports(reportType?: string, skip = 0, limit = 50): Promise<ReportListResponse> {
    const params = new URLSearchParams()
    if (reportType) params.append('report_type', reportType)
    params.append('skip', skip.toString())
    params.append('limit', limit.toString())

    const response = await api.get<ReportListResponse>(`/reports/all?${params}`)
    return response.data
  },

  /**
   * Get a single report with content
   */
  async getReport(reportId: number): Promise<ReportWithContent> {
    const response = await api.get<ReportWithContent>(`/reports/${reportId}`)
    return response.data
  },

  /**
   * Delete a report
   */
  async deleteReport(reportId: number): Promise<void> {
    await api.delete(`/reports/${reportId}`)
  },

  /**
   * Get report statistics
   */
  async getReportStats(): Promise<Record<string, number>> {
    const response = await api.get<Record<string, number>>('/reports/stats/summary')
    return response.data
  },

  /**
   * Download report as Markdown file
   */
  downloadAsMarkdown(report: ReportWithContent): void {
    if (!report.content) {
      console.error('No content to download')
      return
    }

    // Create blob and download
    const blob = new Blob([report.content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = report.filename.replace(/\.[^/.]+$/, '') + '.md'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  },
}

export default reportService
