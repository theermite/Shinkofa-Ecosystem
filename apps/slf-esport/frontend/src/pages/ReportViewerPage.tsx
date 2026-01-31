/**
 * Report Viewer Page - Display a single report with Markdown rendering
 * @author Jay "The Ermite" Goncalves
 * @copyright La Voie Shinkofa - La Salade de Fruits
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardHeader, CardBody, Button } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import reportService, { REPORT_TYPES, type ReportWithContent, type ReportType } from '@/services/reportService'
import MarkdownViewer from '@/components/reports/MarkdownViewer'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function ReportViewerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [report, setReport] = useState<ReportWithContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadReport(parseInt(id, 10))
    }
  }, [id])

  const loadReport = async (reportId: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await reportService.getReport(reportId)
      setReport(data)
    } catch (err: any) {
      console.error('Failed to load report:', err)
      setError(err.response?.data?.detail || 'Erreur lors du chargement du rapport')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (report) {
      reportService.downloadAsMarkdown(report)
    }
  }

  const handleBack = () => {
    navigate('/reports')
  }

  // Check access permissions
  if (user?.role !== 'MANAGER' && user?.role !== 'COACH' && !user?.is_super_admin) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-12">
          <Card>
            <CardBody>
              <div className="text-center">
                <span className="text-6xl mb-4 block">⚠️</span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Accès refusé
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Cette page est réservée aux managers et coachs.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </MainLayout>
    )
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Chargement du rapport...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error || !report) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-12">
          <Card>
            <CardBody>
              <div className="text-center">
                <span className="text-6xl mb-4 block">❌</span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Rapport non trouvé
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {error || 'Ce rapport n\'existe pas ou a été supprimé.'}
                </p>
                <Button onClick={handleBack}>
                  ← Retour aux rapports
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </MainLayout>
    )
  }

  const typeInfo = REPORT_TYPES[report.report_type as ReportType]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Retour"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">{typeInfo?.icon || '📄'}</span>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {report.title}
                </h1>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Généré le {format(new Date(report.generated_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Télécharger .md
            </Button>
          </div>
        </div>

        {/* Report Content */}
        <Card>
          <CardBody>
            {report.content ? (
              <MarkdownViewer content={report.content} />
            ) : (
              <div className="text-center py-12">
                <span className="text-5xl mb-4 block">📝</span>
                <p className="text-gray-600 dark:text-gray-400">
                  Ce rapport ne contient pas encore de contenu.
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Report metadata */}
        <Card>
          <CardHeader title="Informations" />
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Type</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {typeInfo?.label || report.report_type}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Format</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {report.format.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Taille</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {report.file_size ? `${(report.file_size / 1024).toFixed(1)} KB` : '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Fichier</p>
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {report.filename}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  )
}
