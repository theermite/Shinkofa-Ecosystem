/**
 * Media Page - Media library with upload and player
 */

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardHeader, CardBody, Button, Badge, Input } from '@/components/ui'
import mediaService from '@/services/mediaService'
import { useAuthStore } from '@/store/authStore'
import type { Media, MediaType, MediaCategory, FileUploadResponse } from '@/types/media'
import {
  MEDIA_TYPE_LABELS,
  MEDIA_TYPE_EMOJIS,
  MEDIA_CATEGORY_LABELS,
  MEDIA_CATEGORY_COLORS,
} from '@/types/media'

export default function MediaPage() {
  const { user } = useAuthStore()

  const [media, setMedia] = useState<Media[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null)
  const [showPlayer, setShowPlayer] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingMedia, setEditingMedia] = useState<Media | null>(null)

  // Filters
  const [typeFilter, setTypeFilter] = useState<MediaType | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<MediaCategory | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Upload form state
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<MediaCategory>('coaching' as MediaCategory)
  const [isPublic, setIsPublic] = useState(false)
  const [tags, setTags] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')

  // Edit form state
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editCategory, setEditCategory] = useState<MediaCategory>('coaching' as MediaCategory)
  const [editIsPublic, setEditIsPublic] = useState(false)
  const [editTags, setEditTags] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const isCoachOrManager = user?.role === 'COACH' || user?.role === 'MANAGER'

  useEffect(() => {
    loadMedia()
  }, [typeFilter, categoryFilter])

  const loadMedia = async () => {
    setIsLoading(true)
    try {
      const response = await mediaService.getMedia({
        media_type: typeFilter || undefined,
        category: categoryFilter || undefined,
        search: searchQuery || undefined,
      })
      setMedia(response.media)
    } catch (error) {
      console.error('Failed to load media:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    loadMedia()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      if (!title) {
        setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const getMediaType = (mimeType: string): MediaType => {
    if (mimeType.startsWith('video/')) return 'video' as MediaType
    if (mimeType.startsWith('audio/')) return 'audio' as MediaType
    if (mimeType.startsWith('image/')) return 'image' as MediaType
    return 'document' as MediaType
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    setError('')
    setUploadProgress(0)

    try {
      // Upload file
      setUploadProgress(30)
      const uploadResponse: FileUploadResponse = await mediaService.uploadFile(file)

      // Create media entry
      setUploadProgress(70)
      await mediaService.createMedia({
        title,
        description: description || undefined,
        media_type: getMediaType(file.type),
        category,
        file_url: uploadResponse.file_url,
        file_name: uploadResponse.file_name,
        file_size: uploadResponse.file_size,
        mime_type: uploadResponse.mime_type,
        is_public: isPublic,
        tags: tags || undefined,
      })

      setUploadProgress(100)

      // Reset form
      setFile(null)
      setTitle('')
      setDescription('')
      setCategory('coaching' as MediaCategory)
      setIsPublic(false)
      setTags('')
      setShowUploadForm(false)

      // Reload media
      await loadMedia()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors du téléchargement')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async (mediaId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce média ?')) return

    try {
      await mediaService.deleteMedia(mediaId)
      await loadMedia()
    } catch (error) {
      console.error('Failed to delete media:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleEdit = (mediaItem: Media) => {
    setEditingMedia(mediaItem)
    setEditTitle(mediaItem.title)
    setEditDescription(mediaItem.description || '')
    setEditCategory(mediaItem.category)
    setEditIsPublic(mediaItem.is_public)
    setEditTags(mediaItem.tags || '')
    setShowEditForm(true)
  }

  const handleUpdateMedia = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMedia) return

    setIsUpdating(true)
    setError('')

    try {
      await mediaService.updateMedia(editingMedia.id, {
        title: editTitle,
        description: editDescription || undefined,
        category: editCategory,
        is_public: editIsPublic,
        tags: editTags || undefined,
      })

      // Reset form
      setShowEditForm(false)
      setEditingMedia(null)
      setEditTitle('')
      setEditDescription('')
      setEditCategory('coaching' as MediaCategory)
      setEditIsPublic(false)
      setEditTags('')

      // Reload media
      await loadMedia()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la mise à jour')
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePlayMedia = (mediaItem: Media) => {
    setSelectedMedia(mediaItem)
    setShowPlayer(true)
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">📚 Médiathèque</h1>
              <p className="text-primary-100">
                Vidéos, audios, documents de coaching et méditation
              </p>
            </div>
            {isCoachOrManager && (
              <Button
                variant="accent"
                size="lg"
                onClick={() => setShowUploadForm(true)}
              >
                + Télécharger un fichier
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardBody>
            <div className="space-y-4">
              {/* Search */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSearch()
                  }}
                />
                <Button variant="primary" onClick={handleSearch}>
                  Rechercher
                </Button>
              </div>

              {/* Type filter */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Type de média</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={typeFilter === null ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setTypeFilter(null)}
                  >
                    Tous
                  </Button>
                  {Object.entries(MEDIA_TYPE_LABELS).map(([key, label]) => (
                    <Button
                      key={key}
                      variant={typeFilter === key ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setTypeFilter(key as MediaType)}
                    >
                      {MEDIA_TYPE_EMOJIS[key as MediaType]} {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category filter */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Catégorie</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={categoryFilter === null ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter(null)}
                  >
                    Toutes
                  </Button>
                  {Object.entries(MEDIA_CATEGORY_LABELS).map(([key, label]) => (
                    <Button
                      key={key}
                      variant={categoryFilter === key ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setCategoryFilter(key as MediaCategory)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Upload Form */}
        {showUploadForm && isCoachOrManager && (
          <Card>
            <CardHeader title="📤 Télécharger un fichier" />
            <CardBody>
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleUpload} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fichier *
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="video/*,audio/*,application/pdf,image/*"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formats acceptés: Vidéo (mp4, webm), Audio (mp3, wav), PDF, Images (jpg, png)
                  </p>
                </div>

                <Input
                  label="Titre *"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titre du média"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description du média..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Catégorie *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MediaCategory)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                  >
                    {Object.entries(MEDIA_CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Tags (séparés par des virgules)"
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="mental, gameplay, stratégie"
                />

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="is_public" className="text-sm text-gray-700 dark:text-gray-300">
                    Visible par tous les joueurs
                  </label>
                </div>

                {isUploading && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Téléchargement...</span>
                      <span className="font-semibold text-primary-600">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUploadForm(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" variant="primary" isLoading={isUploading}>
                    Télécharger
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        {/* Media Grid */}
        <Card>
          <CardHeader title="Bibliothèque" subtitle={`${media.length} médias`} />
          <CardBody>
            {media.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-6xl mb-4">📚</p>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Aucun média pour le moment
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {isCoachOrManager
                    ? 'Commence à télécharger des ressources !'
                    : 'Les ressources seront bientôt disponibles.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {media.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow"
                  >
                    {/* Thumbnail or Icon */}
                    <div className="relative mb-3">
                      {item.thumbnail_url ? (
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          className="w-full h-40 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-primary-100 to-secondary/20 dark:from-primary-900/20 dark:to-secondary/10 rounded flex items-center justify-center">
                          <span className="text-6xl">
                            {MEDIA_TYPE_EMOJIS[item.media_type]}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge className={MEDIA_CATEGORY_COLORS[item.category]} size="sm">
                          {MEDIA_CATEGORY_LABELS[item.category]}
                        </Badge>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>{MEDIA_TYPE_LABELS[item.media_type]}</span>
                      <span>•</span>
                      <span>{formatFileSize(item.file_size)}</span>
                      <span>•</span>
                      <span>{item.view_count} vues</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {(item.media_type === 'video' || item.media_type === 'audio') && (
                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          onClick={() => handlePlayMedia(item)}
                        >
                          ▶️ Lire
                        </Button>
                      )}
                      {item.media_type === 'document' && (
                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          onClick={() => window.open(item.file_url, '_blank')}
                        >
                          📄 Ouvrir
                        </Button>
                      )}
                      {item.media_type === 'image' && (
                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          onClick={() => handlePlayMedia(item)}
                        >
                          👁️ Voir
                        </Button>
                      )}
                      {isCoachOrManager && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            ✏️
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            🗑️
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Edit Form */}
        {showEditForm && editingMedia && isCoachOrManager && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    ✏️ Éditer le média
                  </h2>
                  <button
                    onClick={() => setShowEditForm(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <form onSubmit={handleUpdateMedia} className="space-y-6">
                  <Input
                    label="Titre *"
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Titre du média"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description du média..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Catégorie *
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as MediaCategory)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                    >
                      {Object.entries(MEDIA_CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Tags (séparés par des virgules)"
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="mental, gameplay, stratégie"
                  />

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit_is_public"
                      checked={editIsPublic}
                      onChange={(e) => setEditIsPublic(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="edit_is_public" className="text-sm text-gray-700 dark:text-gray-300">
                      Visible par tous les joueurs
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowEditForm(false)}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" variant="primary" isLoading={isUpdating}>
                      💾 Enregistrer
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Media Player Modal */}
        {showPlayer && selectedMedia && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedMedia.title}
                  </h2>
                  <button
                    onClick={() => setShowPlayer(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>

                {/* Player */}
                <div className="mb-4">
                  {selectedMedia.media_type === 'video' && (
                    <video
                      controls
                      className="w-full rounded-lg"
                      src={selectedMedia.file_url}
                    >
                      Votre navigateur ne supporte pas la vidéo.
                    </video>
                  )}

                  {selectedMedia.media_type === 'audio' && (
                    <audio controls className="w-full" src={selectedMedia.file_url}>
                      Votre navigateur ne supporte pas l'audio.
                    </audio>
                  )}

                  {selectedMedia.media_type === 'image' && (
                    <img
                      src={selectedMedia.file_url}
                      alt={selectedMedia.title}
                      className="w-full rounded-lg"
                    />
                  )}
                </div>

                {selectedMedia.description && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {selectedMedia.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <Badge className={MEDIA_CATEGORY_COLORS[selectedMedia.category]}>
                    {MEDIA_CATEGORY_LABELS[selectedMedia.category]}
                  </Badge>
                  <Badge variant="secondary">
                    {MEDIA_TYPE_LABELS[selectedMedia.media_type]}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
