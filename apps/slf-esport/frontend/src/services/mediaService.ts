/**
 * Media service - API calls for media library
 */

import api from './api'
import type {
  Media,
  MediaCreate,
  MediaListResponse,
  MediaType,
  MediaCategory,
  Playlist,
  PlaylistCreate,
  FileUploadResponse,
} from '@/types/media'

class MediaService {
  /**
   * Upload a file
   */
  async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<FileUploadResponse>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  /**
   * Create media entry
   */
  async createMedia(data: MediaCreate): Promise<Media> {
    const response = await api.post<Media>('/media', data)
    return response.data
  }

  /**
   * Get media library
   */
  async getMedia(params?: {
    media_type?: MediaType
    category?: MediaCategory
    search?: string
    page?: number
    page_size?: number
  }): Promise<MediaListResponse> {
    const response = await api.get<MediaListResponse>('/media', { params })
    return response.data
  }

  /**
   * Get media by ID
   */
  async getMediaById(mediaId: number): Promise<Media> {
    const response = await api.get<Media>(`/media/${mediaId}`)
    return response.data
  }

  /**
   * Update media
   */
  async updateMedia(
    mediaId: number,
    data: Partial<MediaCreate>
  ): Promise<Media> {
    const response = await api.put<Media>(`/media/${mediaId}`, data)
    return response.data
  }

  /**
   * Delete media
   */
  async deleteMedia(mediaId: number): Promise<void> {
    await api.delete(`/media/${mediaId}`)
  }

  // ========== Playlists ==========

  /**
   * Create playlist
   */
  async createPlaylist(data: PlaylistCreate): Promise<Playlist> {
    const response = await api.post<Playlist>('/media/playlists', data)
    return response.data
  }

  /**
   * Get playlists
   */
  async getPlaylists(params?: {
    page?: number
    page_size?: number
  }): Promise<Playlist[]> {
    const response = await api.get<Playlist[]>('/media/playlists', { params })
    return response.data
  }

  /**
   * Get playlist by ID
   */
  async getPlaylistById(playlistId: number): Promise<Playlist> {
    const response = await api.get<Playlist>(`/media/playlists/${playlistId}`)
    return response.data
  }

  /**
   * Update playlist
   */
  async updatePlaylist(
    playlistId: number,
    data: Partial<PlaylistCreate>
  ): Promise<Playlist> {
    const response = await api.put<Playlist>(`/media/playlists/${playlistId}`, data)
    return response.data
  }

  /**
   * Delete playlist
   */
  async deletePlaylist(playlistId: number): Promise<void> {
    await api.delete(`/media/playlists/${playlistId}`)
  }

  /**
   * Add media to playlist
   */
  async addMediaToPlaylist(playlistId: number, mediaId: number): Promise<void> {
    await api.post(`/media/playlists/${playlistId}/media/${mediaId}`)
  }

  /**
   * Remove media from playlist
   */
  async removeMediaFromPlaylist(playlistId: number, mediaId: number): Promise<void> {
    await api.delete(`/media/playlists/${playlistId}/media/${mediaId}`)
  }
}

export default new MediaService()
