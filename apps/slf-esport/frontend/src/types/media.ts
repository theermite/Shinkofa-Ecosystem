/**
 * Media types
 */

export enum MediaType {
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  IMAGE = 'image',
}

export enum MediaCategory {
  MEDITATION = 'meditation',
  COACHING = 'coaching',
  REPLAY = 'replay',
  TUTORIAL = 'tutorial',
  STRATEGY = 'strategy',
  OTHER = 'other',
}

export interface Media {
  id: number
  title: string
  description?: string
  media_type: MediaType
  category: MediaCategory
  file_url: string
  file_name: string
  file_size?: number
  mime_type?: string
  duration_seconds?: number
  thumbnail_url?: string
  uploaded_by_id: number
  is_public: boolean
  view_count: number
  tags?: string
  created_at: string
  updated_at: string
}

export interface MediaCreate {
  title: string
  description?: string
  media_type: MediaType
  category: MediaCategory
  file_url: string
  file_name: string
  file_size?: number
  mime_type?: string
  duration_seconds?: number
  thumbnail_url?: string
  is_public?: boolean
  tags?: string
}

export interface MediaListResponse {
  total: number
  media: Media[]
  page: number
  page_size: number
}

export interface Playlist {
  id: number
  title: string
  description?: string
  created_by_id: number
  is_public: boolean
  created_at: string
  updated_at: string
  media_items: PlaylistMediaItem[]
}

export interface PlaylistMediaItem {
  id: number
  media_id: number
  order: number
  media: Media
}

export interface PlaylistCreate {
  title: string
  description?: string
  is_public?: boolean
  media_ids?: number[]
}

export interface FileUploadResponse {
  file_url: string
  file_name: string
  file_size: number
  mime_type: string
}

// UI constants
export const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  [MediaType.VIDEO]: 'Vidéo',
  [MediaType.AUDIO]: 'Audio',
  [MediaType.DOCUMENT]: 'Document',
  [MediaType.IMAGE]: 'Image',
}

export const MEDIA_TYPE_EMOJIS: Record<MediaType, string> = {
  [MediaType.VIDEO]: '🎥',
  [MediaType.AUDIO]: '🎵',
  [MediaType.DOCUMENT]: '📄',
  [MediaType.IMAGE]: '🖼️',
}

export const MEDIA_CATEGORY_LABELS: Record<MediaCategory, string> = {
  [MediaCategory.MEDITATION]: 'Méditation',
  [MediaCategory.COACHING]: 'Coaching',
  [MediaCategory.REPLAY]: 'Replay',
  [MediaCategory.TUTORIAL]: 'Tutoriel',
  [MediaCategory.STRATEGY]: 'Stratégie',
  [MediaCategory.OTHER]: 'Autre',
}

export const MEDIA_CATEGORY_COLORS: Record<MediaCategory, string> = {
  [MediaCategory.MEDITATION]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
  [MediaCategory.COACHING]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  [MediaCategory.REPLAY]: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  [MediaCategory.TUTORIAL]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
  [MediaCategory.STRATEGY]: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  [MediaCategory.OTHER]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
}
