import { shell, app } from 'electron'
import http from 'http'
import fs from 'fs'
import path from 'path'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3'
const CALLBACK_PORT = 8902 // Different from Twitch
const REDIRECT_URI = `http://localhost:${CALLBACK_PORT}/callback`

// Scopes needed for YouTube Live streaming
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.force-ssl', // Manage YouTube account
  'https://www.googleapis.com/auth/youtube.readonly' // Read channel info
].join(' ')

interface YouTubeTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
  channelId: string
  channelTitle: string
}

interface YouTubeCredentials {
  clientId: string
  clientSecret: string
}

interface YouTubeChannelInfo {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  subscriberCount: number
}

interface YouTubeBroadcast {
  id: string
  title: string
  description: string
  scheduledStartTime: string
  status: string
  privacyStatus: 'public' | 'private' | 'unlisted'
}

interface YouTubeStream {
  id: string
  rtmpUrl: string
  streamKey: string
}

interface StoredData {
  youtubeTokens?: YouTubeTokens
  youtubeCredentials?: YouTubeCredentials
}

// Simple JSON file store (shared with Twitch)
class SimpleStore {
  private filePath: string
  private data: StoredData

  constructor() {
    const userDataPath = app.getPath('userData')
    this.filePath = path.join(userDataPath, 'hikari-stream-youtube-auth.json')
    this.data = this.load()
  }

  private load(): StoredData {
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf-8')
        return JSON.parse(content)
      }
    } catch (error) {
      console.error('[YouTubeStore] Failed to load:', error)
    }
    return {}
  }

  private save(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2))
    } catch (error) {
      console.error('[YouTubeStore] Failed to save:', error)
    }
  }

  get<K extends keyof StoredData>(key: K): StoredData[K] | undefined {
    return this.data[key]
  }

  set<K extends keyof StoredData>(key: K, value: StoredData[K]): void {
    this.data[key] = value
    this.save()
  }

  delete<K extends keyof StoredData>(key: K): void {
    delete this.data[key]
    this.save()
  }
}

const store = new SimpleStore()

class YouTubeService {
  private tokens: YouTubeTokens | null = null
  private credentials: YouTubeCredentials | null = null

  constructor() {
    // Load saved tokens and credentials
    this.tokens = store.get('youtubeTokens') || null
    this.credentials = store.get('youtubeCredentials') || null
    console.log('[YouTubeService] Initialized, has tokens:', !!this.tokens, 'has credentials:', !!this.credentials)
  }

  /**
   * Save API credentials (Client ID and Secret)
   */
  setCredentials(clientId: string, clientSecret: string): void {
    this.credentials = { clientId, clientSecret }
    store.set('youtubeCredentials', this.credentials)
    console.log('[YouTubeService] Credentials saved')
  }

  /**
   * Check if credentials are configured
   */
  hasCredentials(): boolean {
    return !!this.credentials?.clientId && !!this.credentials?.clientSecret
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.tokens?.accessToken
  }

  /**
   * Get current user info
   */
  getUserInfo(): { channelId: string; channelTitle: string } | null {
    if (!this.tokens) return null
    return { channelId: this.tokens.channelId, channelTitle: this.tokens.channelTitle }
  }

  /**
   * Start OAuth2 flow
   */
  async authenticate(): Promise<boolean> {
    if (!this.credentials) {
      throw new Error('YouTube credentials not configured')
    }

    return new Promise((resolve, reject) => {
      // Create temporary HTTP server to receive callback
      const server = http.createServer(async (req, res) => {
        const url = new URL(req.url || '', `http://localhost:${CALLBACK_PORT}`)

        if (url.pathname === '/callback') {
          const code = url.searchParams.get('code')
          const error = url.searchParams.get('error')

          if (error) {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end('<html><body><h1>Erreur</h1><p>Autorisation refusee. Vous pouvez fermer cette fenetre.</p></body></html>')
            server.close()
            reject(new Error(error))
            return
          }

          if (code) {
            try {
              // Exchange code for tokens
              await this.exchangeCodeForTokens(code)

              res.writeHead(200, { 'Content-Type': 'text/html' })
              res.end('<html><body><h1>Connecte a YouTube !</h1><p>Vous pouvez fermer cette fenetre et retourner a Hikari Stream.</p><script>window.close()</script></body></html>')
              server.close()
              resolve(true)
            } catch (err) {
              res.writeHead(200, { 'Content-Type': 'text/html' })
              res.end('<html><body><h1>Erreur</h1><p>Echec de connexion. Vous pouvez fermer cette fenetre.</p></body></html>')
              server.close()
              reject(err)
            }
          }
        }
      })

      server.listen(CALLBACK_PORT, () => {
        console.log(`[YouTubeService] Callback server listening on port ${CALLBACK_PORT}`)

        // Build authorization URL
        const authUrl = new URL(GOOGLE_AUTH_URL)
        authUrl.searchParams.set('client_id', this.credentials!.clientId)
        authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
        authUrl.searchParams.set('response_type', 'code')
        authUrl.searchParams.set('scope', SCOPES)
        authUrl.searchParams.set('access_type', 'offline') // To get refresh token
        authUrl.searchParams.set('prompt', 'consent') // Force consent to get refresh token

        // Open in default browser
        shell.openExternal(authUrl.toString())
      })

      // Timeout after 5 minutes
      setTimeout(() => {
        server.close()
        reject(new Error('Authentication timeout'))
      }, 5 * 60 * 1000)
    })
  }

  /**
   * Exchange authorization code for access token
   */
  private async exchangeCodeForTokens(code: string): Promise<void> {
    if (!this.credentials) throw new Error('No credentials')

    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.credentials.clientId,
        client_secret: this.credentials.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Token exchange failed: ${error}`)
    }

    const data = await response.json()

    // Get channel info
    const channelInfo = await this.fetchChannelInfo(data.access_token)

    this.tokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
      channelId: channelInfo.id,
      channelTitle: channelInfo.title
    }

    store.set('youtubeTokens', this.tokens)
    console.log('[YouTubeService] Authenticated as:', channelInfo.title)
  }

  /**
   * Refresh access token
   */
  private async refreshTokens(): Promise<void> {
    if (!this.credentials || !this.tokens?.refreshToken) {
      throw new Error('Cannot refresh: missing credentials or refresh token')
    }

    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.credentials.clientId,
        client_secret: this.credentials.clientSecret,
        refresh_token: this.tokens.refreshToken,
        grant_type: 'refresh_token'
      })
    })

    if (!response.ok) {
      // Refresh failed, need to re-authenticate
      this.tokens = null
      store.delete('youtubeTokens')
      throw new Error('Token refresh failed, please re-authenticate')
    }

    const data = await response.json()

    this.tokens = {
      ...this.tokens,
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000
    }

    store.set('youtubeTokens', this.tokens)
    console.log('[YouTubeService] Tokens refreshed')
  }

  /**
   * Get valid access token (refresh if needed)
   */
  private async getValidToken(): Promise<string> {
    if (!this.tokens) throw new Error('Not authenticated')

    // Refresh if token expires in less than 5 minutes
    if (Date.now() > this.tokens.expiresAt - 5 * 60 * 1000) {
      await this.refreshTokens()
    }

    return this.tokens.accessToken
  }

  /**
   * Fetch channel info from YouTube API
   */
  private async fetchChannelInfo(accessToken: string): Promise<YouTubeChannelInfo> {
    const response = await fetch(`${YOUTUBE_API_URL}/channels?part=snippet,statistics&mine=true`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch channel info')
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      throw new Error('No YouTube channel found for this account')
    }

    const channel = data.items[0]

    return {
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnailUrl: channel.snippet.thumbnails?.default?.url || '',
      subscriberCount: parseInt(channel.statistics.subscriberCount || '0', 10)
    }
  }

  /**
   * Get channel info
   */
  async getChannelInfo(): Promise<YouTubeChannelInfo | null> {
    if (!this.tokens) return null

    try {
      const token = await this.getValidToken()
      return await this.fetchChannelInfo(token)
    } catch (error) {
      console.error('[YouTubeService] getChannelInfo error:', error)
      return null
    }
  }

  /**
   * Get upcoming/active broadcasts
   */
  async getBroadcasts(): Promise<YouTubeBroadcast[]> {
    if (!this.tokens) return []

    try {
      const token = await this.getValidToken()

      const response = await fetch(
        `${YOUTUBE_API_URL}/liveBroadcasts?part=snippet,status&broadcastStatus=upcoming&mine=true`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) return []

      const data = await response.json()
      return (data.items || []).map((item: { id: string; snippet: { title: string; description: string; scheduledStartTime: string }; status: { lifeCycleStatus: string; privacyStatus: 'public' | 'private' | 'unlisted' } }) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        scheduledStartTime: item.snippet.scheduledStartTime,
        status: item.status.lifeCycleStatus,
        privacyStatus: item.status.privacyStatus
      }))
    } catch (error) {
      console.error('[YouTubeService] getBroadcasts error:', error)
      return []
    }
  }

  /**
   * Create a new broadcast (scheduled or instant)
   */
  async createBroadcast(
    title: string,
    description: string,
    privacyStatus: 'public' | 'private' | 'unlisted' = 'public',
    scheduledStartTime?: Date
  ): Promise<YouTubeBroadcast | null> {
    if (!this.tokens) return null

    try {
      const token = await this.getValidToken()

      const startTime = scheduledStartTime || new Date(Date.now() + 60000) // 1 min from now if not specified

      const response = await fetch(
        `${YOUTUBE_API_URL}/liveBroadcasts?part=snippet,status,contentDetails`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            snippet: {
              title,
              description,
              scheduledStartTime: startTime.toISOString()
            },
            status: {
              privacyStatus,
              selfDeclaredMadeForKids: false
            },
            contentDetails: {
              enableAutoStart: true,
              enableAutoStop: true,
              latencyPreference: 'normal'
            }
          })
        }
      )

      if (!response.ok) {
        const error = await response.text()
        console.error('[YouTubeService] createBroadcast failed:', error)
        return null
      }

      const data = await response.json()
      console.log('[YouTubeService] Broadcast created:', data.id)

      return {
        id: data.id,
        title: data.snippet.title,
        description: data.snippet.description,
        scheduledStartTime: data.snippet.scheduledStartTime,
        status: data.status.lifeCycleStatus,
        privacyStatus: data.status.privacyStatus
      }
    } catch (error) {
      console.error('[YouTubeService] createBroadcast error:', error)
      return null
    }
  }

  /**
   * Create a stream resource (gets RTMP URL and key)
   */
  async createStream(title: string): Promise<YouTubeStream | null> {
    if (!this.tokens) return null

    try {
      const token = await this.getValidToken()

      const response = await fetch(
        `${YOUTUBE_API_URL}/liveStreams?part=snippet,cdn`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            snippet: {
              title
            },
            cdn: {
              frameRate: '60fps',
              ingestionType: 'rtmp',
              resolution: '1080p'
            }
          })
        }
      )

      if (!response.ok) {
        const error = await response.text()
        console.error('[YouTubeService] createStream failed:', error)
        return null
      }

      const data = await response.json()
      console.log('[YouTubeService] Stream created:', data.id)

      return {
        id: data.id,
        rtmpUrl: data.cdn.ingestionInfo.ingestionAddress,
        streamKey: data.cdn.ingestionInfo.streamName
      }
    } catch (error) {
      console.error('[YouTubeService] createStream error:', error)
      return null
    }
  }

  /**
   * Bind a stream to a broadcast
   */
  async bindStreamToBroadcast(broadcastId: string, streamId: string): Promise<boolean> {
    if (!this.tokens) return false

    try {
      const token = await this.getValidToken()

      const response = await fetch(
        `${YOUTUBE_API_URL}/liveBroadcasts/bind?id=${broadcastId}&part=id,contentDetails&streamId=${streamId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        const error = await response.text()
        console.error('[YouTubeService] bindStreamToBroadcast failed:', error)
        return false
      }

      console.log('[YouTubeService] Stream bound to broadcast')
      return true
    } catch (error) {
      console.error('[YouTubeService] bindStreamToBroadcast error:', error)
      return false
    }
  }

  /**
   * Transition broadcast to live
   */
  async transitionBroadcast(broadcastId: string, status: 'testing' | 'live' | 'complete'): Promise<boolean> {
    if (!this.tokens) return false

    try {
      const token = await this.getValidToken()

      const response = await fetch(
        `${YOUTUBE_API_URL}/liveBroadcasts/transition?id=${broadcastId}&part=status&broadcastStatus=${status}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        const error = await response.text()
        console.error('[YouTubeService] transitionBroadcast failed:', error)
        return false
      }

      console.log('[YouTubeService] Broadcast transitioned to:', status)
      return true
    } catch (error) {
      console.error('[YouTubeService] transitionBroadcast error:', error)
      return false
    }
  }

  /**
   * Update broadcast info (title, description)
   */
  async updateBroadcast(broadcastId: string, title: string, description?: string): Promise<boolean> {
    if (!this.tokens) return false

    try {
      const token = await this.getValidToken()

      // First, get the current broadcast to preserve the scheduled start time
      const getResponse = await fetch(
        `${YOUTUBE_API_URL}/liveBroadcasts?id=${broadcastId}&part=snippet`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!getResponse.ok) return false

      const getData = await getResponse.json()
      const currentSnippet = getData.items?.[0]?.snippet

      if (!currentSnippet) return false

      const response = await fetch(
        `${YOUTUBE_API_URL}/liveBroadcasts?part=snippet`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: broadcastId,
            snippet: {
              title,
              description: description ?? currentSnippet.description,
              scheduledStartTime: currentSnippet.scheduledStartTime
            }
          })
        }
      )

      if (!response.ok) {
        const error = await response.text()
        console.error('[YouTubeService] updateBroadcast failed:', error)
        return false
      }

      console.log('[YouTubeService] Broadcast updated')
      return true
    } catch (error) {
      console.error('[YouTubeService] updateBroadcast error:', error)
      return false
    }
  }

  /**
   * Search for video categories
   */
  async getCategories(): Promise<Array<{ id: string; title: string }>> {
    if (!this.tokens) return []

    try {
      const token = await this.getValidToken()

      const response = await fetch(
        `${YOUTUBE_API_URL}/videoCategories?part=snippet&regionCode=FR`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) return []

      const data = await response.json()
      return (data.items || [])
        .filter((item: { snippet: { assignable: boolean } }) => item.snippet.assignable)
        .map((item: { id: string; snippet: { title: string } }) => ({
          id: item.id,
          title: item.snippet.title
        }))
    } catch (error) {
      console.error('[YouTubeService] getCategories error:', error)
      return []
    }
  }

  /**
   * Disconnect (clear tokens)
   */
  disconnect(): void {
    this.tokens = null
    store.delete('youtubeTokens')
    console.log('[YouTubeService] Disconnected')
  }
}

// Singleton instance
export const youtubeService = new YouTubeService()
