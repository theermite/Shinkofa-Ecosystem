/**
 * Chart Upload Component
 * Shinkofa Platform - Frontend
 *
 * Allows users to upload Design Humain and Astrology charts
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuth, getAccessToken } from '@/contexts/AuthContext'

interface ChartUploadProps {
  sessionId: string
  onUploadComplete?: () => void
}

type ChartType = 'design_humain' | 'astrology_natal' | 'astrology_chinese'

interface UploadState {
  design_humain: File | null
  astrology_natal: File | null
}

export function ChartUpload({ sessionId, onUploadComplete }: ChartUploadProps) {
  const [uploads, setUploads] = useState<UploadState>({
    design_humain: null,
    astrology_natal: null,
  })
  const [uploading, setUploading] = useState<Record<ChartType, boolean>>({
    design_humain: false,
    astrology_natal: false,
    astrology_chinese: false,
  })
  const [uploadedCharts, setUploadedCharts] = useState<Set<ChartType>>(new Set())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { user } = useAuth()

  const apiUrl = process.env.NEXT_PUBLIC_API_SHIZEN_URL || 'https://localhost:8001/api'

  const handleFileSelect = (chartType: 'design_humain' | 'astrology_natal', file: File | null) => {
    setUploads(prev => ({ ...prev, [chartType]: file }))
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[chartType]
      return newErrors
    })
  }

  const handleUpload = async (chartType: ChartType) => {
    const file = uploads[chartType as keyof UploadState]

    if (!file) {
      setErrors(prev => ({ ...prev, [chartType]: 'Veuillez sélectionner un fichier' }))
      return
    }

    // Verify authentication
    if (!user) {
      setErrors(prev => ({ ...prev, [chartType]: 'Vous devez être connecté pour uploader un fichier.' }))
      return
    }

    const token = getAccessToken()
    if (!token) {
      setErrors(prev => ({ ...prev, [chartType]: 'Session expirée. Veuillez vous reconnecter.' }))
      return
    }

    setUploading(prev => ({ ...prev, [chartType]: true }))
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[chartType]
      return newErrors
    })

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(
        `${apiUrl}/questionnaire/upload-chart/${sessionId}?chart_type=${chartType}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-ID': user.id,
          },
          body: formData,
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Upload failed')
      }

      setUploadedCharts(prev => new Set(prev).add(chartType))
      onUploadComplete?.()
    } catch (error) {
      console.error(`Upload error (${chartType}):`, error)
      setErrors(prev => ({
        ...prev,
        [chartType]: error instanceof Error ? error.message : 'Upload failed',
      }))
    } finally {
      setUploading(prev => ({ ...prev, [chartType]: false }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Design Humain Upload */}
      <Card variant="elevated">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl" aria-hidden="true">
              🔮
            </span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                Carte Design Humain
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Uploadez votre carte de Design Humain (PDF, PNG ou JPG)
              </p>

              {uploadedCharts.has('design_humain') ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Carte uploadée avec succès</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => handleFileSelect('design_humain', e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-600 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-purple-50 file:text-purple-700
                      hover:file:bg-purple-100
                      dark:file:bg-purple-900 dark:file:text-purple-300
                      dark:hover:file:bg-purple-800"
                  />
                  {errors.design_humain && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.design_humain}</p>
                  )}
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleUpload('design_humain')}
                    disabled={!uploads.design_humain || uploading.design_humain}
                  >
                    {uploading.design_humain ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Upload en cours...
                      </>
                    ) : (
                      'Uploader'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Astrology Chart Upload */}
      <Card variant="elevated">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl" aria-hidden="true">
              ✨
            </span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                Carte du Ciel (Astrologie Natale)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Uploadez votre carte du ciel astrologique (PDF, PNG ou JPG)
              </p>

              {uploadedCharts.has('astrology_natal') ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Carte uploadée avec succès</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => handleFileSelect('astrology_natal', e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-600 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                      dark:file:bg-blue-900 dark:file:text-blue-300
                      dark:hover:file:bg-blue-800"
                  />
                  {errors.astrology_natal && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.astrology_natal}</p>
                  )}
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleUpload('astrology_natal')}
                    disabled={!uploads.astrology_natal || uploading.astrology_natal}
                  >
                    {uploading.astrology_natal ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Upload en cours...
                      </>
                    ) : (
                      'Uploader'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden="true">
              💡
            </span>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                Formats acceptés
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                PDF, PNG, JPG/JPEG - Taille max 10MB. Les charts seront analysés via OCR pour
                enrichir votre profil holistique.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
