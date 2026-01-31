/**
 * Reports Page - Generate and view team reports
 * @author Jay "The Ermite" Goncalves
 * @copyright La Voie Shinkofa - La Salade de Fruits
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardHeader, CardBody, Button, Badge } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import reportService, { REPORT_TYPES, type Report, type ReportType } from '@/services/reportService'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function ReportsPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<ReportType | 'all'>('all')

  const isManager = user?.role === 'MANAGER' || user?.is_super_admin

  useEffect(() => {
    loadReports()
  }, [filterType])

  const loadReports = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const typeFilter = filterType === 'all' ? undefined : filterType
      if (isManager) {
        const response = await reportService.getAllReports(typeFilter)
        setReports(response.reports)
      } else {
        const data = await reportService.getMyReports(typeFilter)
        setReports(data)
      }
    } catch (err: any) {
      console.error('Failed to load reports:', err)
      setError(err.response?.data?.detail || 'Erreur lors du chargement des rapports')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = async (reportType: ReportType) => {
    setIsGenerating(reportType)
    setError(null)
    setSuccess(null)

    try {
      const report = await reportService.generateReport({
        report_type: reportType,
        format: 'markdown',
        title: `${REPORT_TYPES[reportType].label} - ${format(new Date(), 'dd/MM/yyyy')}`,
      })

      setSuccess(`Rapport "${report.title}" généré avec succès`)
      await loadReports()

      // Navigate to report viewer
      navigate(`/reports/${report.id}`)
    } catch (err: any) {
      console.error('Failed to generate report:', err)
      setError(err.response?.data?.detail || 'Erreur lors de la génération du rapport')
    } finally {
      setIsGenerating(null)
    }
  }

  const handleViewReport = (reportId: number) => {
    navigate(`/reports/${reportId}`)
  }

  const handleDeleteReport = async (reportId: number) => {
    if (!confirm('Supprimer ce rapport ?')) return

    try {
      await reportService.deleteReport(reportId)
      setSuccess('Rapport supprimé')
      await loadReports()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la suppression')
    }
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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">📊 Rapports</h1>
          <p className="text-blue-100">
            Génère et consulte les rapports d'analyse de l'équipe
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg text-red-800 dark:text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-lg text-green-800 dark:text-green-200">
            {success}
          </div>
        )}

        {/* Generate New Report */}
        <Card>
          <CardHeader
            title="Générer un nouveau rapport"
            subtitle="Sélectionne le type de rapport à générer"
          />
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {(Object.entries(REPORT_TYPES) as [ReportType, typeof REPORT_TYPES[ReportType]][]).map(
                ([type, info]) => (
                  <button
                    key={type}
                    onClick={() => handleGenerateReport(type)}
                    disabled={isGenerating !== null}
                    className={`
                      p-6 rounded-xl border-2 transition-all text-left
                      ${isGenerating === type
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10'
                      }
                      ${isGenerating !== null && isGenerating !== type ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <span className="text-3xl mb-3 block">{info.icon}</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {info.label}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {info.description}
                    </p>
                    {isGenerating === type && (
                      <div className="mt-3 flex items-center gap-2 text-primary-600 dark:text-primary-400">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Génération...</span>
                      </div>
                    )}
                  </button>
                )
              )}
            </div>
          </CardBody>
        </Card>

        {/* Reports List */}
        <Card>
          <CardHeader
            title="Rapports générés"
            subtitle={`${reports.length} rapport${reports.length > 1 ? 's' : ''}`}
          />
          <CardBody>
            {/* Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Tous
              </button>
              {(Object.entries(REPORT_TYPES) as [ReportType, typeof REPORT_TYPES[ReportType]][]).map(
                ([type, info]) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      filterType === type
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>{info.icon}</span>
                    {info.label}
                  </button>
                )
              )}
            </div>

            {/* List */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-5xl mb-4 block">📭</span>
                <p className="text-gray-600 dark:text-gray-400">
                  Aucun rapport trouvé. Génère ton premier rapport !
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => {
                  const typeInfo = REPORT_TYPES[report.report_type as ReportType]
                  return (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{typeInfo?.icon || '📄'}</span>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {report.title}
                          </h4>
                          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <span>
                              {formatDistanceToNow(new Date(report.generated_at), {
                                addSuffix: true,
                                locale: fr,
                              })}
                            </span>
                            <Badge variant="info" size="sm">
                              {report.format.toUpperCase()}
                            </Badge>
                            {report.file_size && (
                              <span>{(report.file_size / 1024).toFixed(1)} KB</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleViewReport(report.id)}
                        >
                          Voir
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReport(report.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Help */}
        <Card>
          <CardHeader
            title="💡 À propos des rapports"
          />
          <CardBody>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p>
                <strong>Format Markdown :</strong> Les rapports sont générés en Markdown,
                un format lisible et facilement exportable vers Obsidian ou d'autres outils.
              </p>
              <p>
                <strong>Export :</strong> Depuis la vue d'un rapport, tu peux télécharger
                le fichier .md pour l'ajouter à ta base de notes.
              </p>
              <p>
                <strong>Historique :</strong> Les rapports sont conservés pour consultation ultérieure.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </MainLayout>
  )
}
