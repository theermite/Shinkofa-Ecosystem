import { shell, app } from 'electron'
import http from 'http'
import fs from 'fs'
import path from 'path'

const TWITCH_AUTH_URL = 'https://id.twitch.tv/oauth2/authorize'
const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token'
const TWITCH_API_URL = 'https://api.twitch.tv/helix'
const CALLBACK_PORT = 8901
const REDIRECT_URI = `http://localhost:${CALLBACK_PORT}/callback`

// Scopes needed for updating channel info
const SCOPES = [
  'channel:manage:broadcast', // Update channel title, game
  'user:read:email' // Get user info
].join(' ')

interface TwitchTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
  userId: string
  login: string
}

interface TwitchCredentials {
  clientId: string
  clientSecret: string
}

interface TwitchUserInfo {
  id: string
  login: string
  displayName: string
  profileImageUrl: string
}

interface TwitchChannelInfo {
  title: string
  gameName: string
  gameId: string
  tags: string[]
}

interface TwitchStreamInfo {
  isLive: boolean
  viewerCount: number
  startedAt: string | null
  title: string
  gameName: string
  thumbnailUrl: string | null
}

interface StoredData {
  twitchTokens?: TwitchTokens
  twitchCredentials?: TwitchCredentials
}

// Simple JSON file store
class SimpleStore {
  private filePath: string
  private data: StoredData

  constructor() {
    const userDataPath = app.getPath('userData')
    this.filePath = path.join(userDataPath, 'hikari-stream-auth.json')
    this.data = this.load()
  }

  private load(): StoredData {
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf-8')
        return JSON.parse(content)
      }
    } catch (error) {
      console.error('[SimpleStore] Failed to load:', error)
    }
    return {}
  }

  private save(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2))
    } catch (error) {
      console.error('[SimpleStore] Failed to save:', error)
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

class TwitchService {
  private tokens: TwitchTokens | null = null
  private credentials: TwitchCredentials | null = null

  constructor() {
    // Load saved tokens and credentials
    this.tokens = store.get('twitchTokens') || null
    this.credentials = store.get('twitchCredentials') || null
    console.log('[TwitchService] Initialized, has tokens:', !!this.tokens, 'has credentials:', !!this.credentials)
  }

  /**
   * Save API credentials (Client ID and Secret)
   */
  setCredentials(clientId: string, clientSecret: string): void {
    this.credentials = { clientId, clientSecret }
    store.set('twitchCredentials', this.credentials)
    console.log('[TwitchService] Credentials saved')
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
  getUserInfo(): { login: string; userId: string } | null {
    if (!this.tokens) return null
    return { login: this.tokens.login, userId: this.tokens.userId }
  }

  /**
   * Start OAuth2 flow
   */
  async authenticate(): Promise<boolean> {
    if (!this.credentials) {
      throw new Error('Twitch credentials not configured')
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
              res.end('<html><body><h1>Connecte !</h1><p>Vous pouvez fermer cette fenetre et retourner a Hikari Stream.</p><script>window.close()</script></body></html>')
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
        console.log(`[TwitchService] Callback server listening on port ${CALLBACK_PORT}`)

        // Build authorization URL
        const authUrl = new URL(TWITCH_AUTH_URL)
        authUrl.searchParams.set('client_id', this.credentials!.clientId)
        authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
        authUrl.searchParams.set('response_type', 'code')
        authUrl.searchParams.set('scope', SCOPES)
        authUrl.searchParams.set('force_verify', 'true')

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

    const response = await fetch(TWITCH_TOKEN_URL, {
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

    // Get user info
    const userInfo = await this.fetchUserInfo(data.access_token)

    this.tokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
      userId: userInfo.id,
      login: userInfo.login
    }

    store.set('twitchTokens', this.tokens)
    console.log('[TwitchService] Authenticated as:', userInfo.login)
  }

  /**
   * Refresh access token
   */
  private async refreshTokens(): Promise<void> {
    if (!this.credentials || !this.tokens?.refreshToken) {
      throw new Error('Cannot refresh: missing credentials or refresh token')
    }

    const response = await fetch(TWITCH_TOKEN_URL, {
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
      store.delete('twitchTokens')
      throw new Error('Token refresh failed, please re-authenticate')
    }

    const data = await response.json()

    this.tokens = {
      ...this.tokens,
      accessToken: data.access_token,
      refreshToken: data.refresh_token || this.tokens.refreshToken,
      expiresAt: Date.now() + data.expires_in * 1000
    }

    store.set('twitchTokens', this.tokens)
    console.log('[TwitchService] Tokens refreshed')
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
   * Fetch user info from Twitch API
   */
  private async fetchUserInfo(accessToken: string): Promise<TwitchUserInfo> {
    if (!this.credentials) throw new Error('No credentials')

    const response = await fetch(`${TWITCH_API_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Client-Id': this.credentials.clientId
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user info')
    }

    const data = await response.json()
    const user = data.data[0]

    return {
      id: user.id,
      login: user.login,
      displayName: user.display_name,
      profileImageUrl: user.profile_image_url
    }
  }

  /**
   * Get current channel info
   */
  async getChannelInfo(): Promise<TwitchChannelInfo | null> {
    if (!this.tokens || !this.credentials) return null

    try {
      const token = await this.getValidToken()

      const response = await fetch(`${TWITCH_API_URL}/channels?broadcaster_id=${this.tokens.userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Client-Id': this.credentials.clientId
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch channel info')
      }

      const data = await response.json()
      const channel = data.data[0]

      return {
        title: channel.title,
        gameName: channel.game_name,
        gameId: channel.game_id,
        tags: channel.tags || []
      }
    } catch (error) {
      console.error('[TwitchService] getChannelInfo error:', error)
      return null
    }
  }

  /**
   * Update channel info (title, game, tags)
   */
  async updateChannelInfo(title?: string, gameId?: string, tags?: string[]): Promise<boolean> {
    if (!this.tokens || !this.credentials) {
      throw new Error('Not authenticated')
    }

    try {
      const token = await this.getValidToken()

      const body: Record<string, unknown> = {}
      if (title !== undefined) body.title = title
      if (gameId !== undefined) body.game_id = gameId
      if (tags !== undefined) body.tags = tags.slice(0, 10) // Max 10 tags

      const response = await fetch(`${TWITCH_API_URL}/channels?broadcaster_id=${this.tokens.userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Client-Id': this.credentials.clientId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('[TwitchService] updateChannelInfo failed:', error)
        return false
      }

      console.log('[TwitchService] Channel info updated')
      return true
    } catch (error) {
      console.error('[TwitchService] updateChannelInfo error:', error)
      return false
    }
  }

  /**
   * Search for games/categories
   */
  async searchGames(query: string): Promise<Array<{ id: string; name: string; boxArtUrl: string }>> {
    if (!this.tokens || !this.credentials) return []

    try {
      const token = await this.getValidToken()

      const response = await fetch(`${TWITCH_API_URL}/search/categories?query=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Client-Id': this.credentials.clientId
        }
      })

      if (!response.ok) return []

      const data = await response.json()
      return data.data.map((game: { id: string; name: string; box_art_url: string }) => ({
        id: game.id,
        name: game.name,
        boxArtUrl: game.box_art_url
      }))
    } catch (error) {
      console.error('[TwitchService] searchGames error:', error)
      return []
    }
  }

  /**
   * Get current stream info (viewer count, live status, etc.)
   */
  async getStreamInfo(): Promise<TwitchStreamInfo | null> {
    if (!this.tokens || !this.credentials) return null

    try {
      const token = await this.getValidToken()

      const response = await fetch(`${TWITCH_API_URL}/streams?user_id=${this.tokens.userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Client-Id': this.credentials.clientId
        }
      })

      if (!response.ok) {
        console.error('[TwitchService] getStreamInfo failed:', await response.text())
        return null
      }

      const data = await response.json()

      // If no stream data, user is offline
      if (!data.data || data.data.length === 0) {
        return {
          isLive: false,
          viewerCount: 0,
          startedAt: null,
          title: '',
          gameName: '',
          thumbnailUrl: null
        }
      }

      const stream = data.data[0]
      return {
        isLive: true,
        viewerCount: stream.viewer_count || 0,
        startedAt: stream.started_at || null,
        title: stream.title || '',
        gameName: stream.game_name || '',
        thumbnailUrl: stream.thumbnail_url?.replace('{width}', '320').replace('{height}', '180') || null
      }
    } catch (error) {
      console.error('[TwitchService] getStreamInfo error:', error)
      return null
    }
  }

  /**
   * Disconnect (clear tokens)
   */
  disconnect(): void {
    this.tokens = null
    store.delete('twitchTokens')
    console.log('[TwitchService] Disconnected')
  }
}

// Singleton instance
export const twitchService = new TwitchService()
