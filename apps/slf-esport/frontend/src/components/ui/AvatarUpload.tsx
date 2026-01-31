/**
 * Avatar Upload Component
 * Upload avatar image with preview and validation
 */

import { useState, useRef } from 'react'
import Button from './Button'
import api from '@/services/api'

interface AvatarUploadProps {
  currentAvatar?: string
  onUploadSuccess: (avatarUrl: string) => void
  onUploadError?: (error: string) => void
}

export default function AvatarUpload({ currentAvatar, onUploadSuccess, onUploadError }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = 'Format non supporté. Utilisez JPG, PNG ou WebP.'
      setError(errorMsg)
      if (onUploadError) onUploadError(errorMsg)
      return
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      const errorMsg = 'Fichier trop volumineux. Taille maximum : 10MB'
      setError(errorMsg)
      if (onUploadError) onUploadError(errorMsg)
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    await uploadAvatar(file)
  }

  const uploadAvatar = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Extract avatar URL from response
      const avatarUrl = response.data.avatar_url
      onUploadSuccess(avatarUrl)
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Erreur lors de l\'upload'
      setError(errorMsg)
      if (onUploadError) onUploadError(errorMsg)
      // Reset preview on error
      setPreview(currentAvatar || null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteAvatar = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre photo de profil ?')) {
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      await api.delete('/upload/avatar')
      setPreview(null)
      onUploadSuccess('')
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Erreur lors de la suppression'
      setError(errorMsg)
      if (onUploadError) onUploadError(errorMsg)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        {/* Avatar Preview */}
        <div className="relative">
          {preview ? (
            <img
              src={preview.startsWith('data:') || preview.startsWith('http') ? preview : preview}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-gray-200 dark:border-gray-600">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        {/* Upload Buttons */}
        <div className="flex-1 space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              📤 {preview ? 'Changer' : 'Télécharger'} la photo
            </Button>

            {preview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDeleteAvatar}
                disabled={isUploading}
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                🗑️ Supprimer
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            JPG, PNG ou WebP. Maximum 10MB.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}
