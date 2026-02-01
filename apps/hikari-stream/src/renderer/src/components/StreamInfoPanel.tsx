import { useState, useEffect, useCallback, useRef } from 'react'

const STORAGE_KEY = 'hikari-stream-settings'
const PANEL_STATE_KEY = 'hikari-stream-info-panel'

interface TwitchGame {
  id: string
  name: string
  boxArtUrl: string
}

interface TwitchChannelInfo {
  title: string
  gameName: string
  gameId: string
  tags: string[]
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

function StreamInfoPanel(): JSX.Element {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const saved = localStorage.getItem(PANEL_STATE_KEY)
      return saved ? JSON.parse(saved) : true
    } catch {
      return true
    }
  })

  // Twitch state
  const [hasCredentials, setHasCredentials] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [twitchUser, setTwitchUser] = useState<{ login: string; userId: string } | null>(null)
  const [channelInfo, setChannelInfo] = useState<TwitchChannelInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showCredentialsForm, setShowCredentialsForm] = useState(false)
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')

  // Game search
  const [gameQuery, setGameQuery] = useState('')
  const [gameResults, setGameResults] = useState<TwitchGame[]>([])
  const [showGameDropdown, setShowGameDropdown] = useState(false)
  const gameSearchRef = useRef<HTMLDivElement>(null)

  // Local edits (before saving to Twitch)
  const [editTitle, setEditTitle] = useState('')
  const [editGame, setEditGame] = useState('')
  const [editGameId, setEditGameId] = useState('')
  const [editTags, setEditTags] = useState('')

  // YouTube state
  const [ytHasCredentials, setYtHasCredentials] = useState(false)
  const [ytIsAuthenticated, setYtIsAuthenticated] = useState(false)
  const [ytChannelInfo, setYtChannelInfo] = useState<YouTubeChannelInfo | null>(null)
  const [ytShowCredentialsForm, setYtShowCredentialsForm] = useState(false)
  const [ytClientId, setYtClientId] = useState('')
  const [ytClientSecret, setYtClientSecret] = useState('')
  const [ytBroadcasts, setYtBroadcasts] = useState<YouTubeBroadcast[]>([])
  const [ytEditTitle, setYtEditTitle] = useState('')
  const [ytEditDescription, setYtEditDescription] = useState('')
  const [ytIsSaving, setYtIsSaving] = useState(false)

  // Check Twitch and YouTube status on mount
  useEffect(() => {
    checkTwitchStatus()
    checkYouTubeStatus()
  }, [])

  // Save panel state
  useEffect(() => {
    localStorage.setItem(PANEL_STATE_KEY, JSON.stringify(isOpen))
  }, [isOpen])

  // Close game dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (gameSearchRef.current && !gameSearchRef.current.contains(e.target as Node)) {
        setShowGameDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const checkTwitchStatus = async (): Promise<void> => {
    setIsLoading(true)
    try {
      const hasCreds = await window.api.hasTwitchCredentials()
      setHasCredentials(hasCreds)

      if (hasCreds) {
        const isAuth = await window.api.isTwitchAuthenticated()
        setIsAuthenticated(isAuth)

        if (isAuth) {
          const user = await window.api.getTwitchUserInfo()
          setTwitchUser(user)

          const info = await window.api.getTwitchChannelInfo()
          setChannelInfo(info)

          if (info) {
            setEditTitle(info.title)
            setEditGame(info.gameName)
            setEditGameId(info.gameId)
            setEditTags(info.tags.join(', '))
          }
        }
      }
    } catch (error) {
      console.error('[StreamInfoPanel] Error checking Twitch status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveCredentials = async (): Promise<void> => {
    console.log('[StreamInfoPanel] handleSaveCredentials called', { clientId: clientId.trim(), hasSecret: !!clientSecret.trim() })
    if (!clientId.trim() || !clientSecret.trim()) {
      console.log('[StreamInfoPanel] Missing credentials, aborting')
      return
    }

    try {
      console.log('[StreamInfoPanel] Calling setTwitchCredentials...')
      const result = await window.api.setTwitchCredentials(clientId.trim(), clientSecret.trim())
      console.log('[StreamInfoPanel] setTwitchCredentials result:', result)
      setHasCredentials(true)
      setShowCredentialsForm(false)
      setClientId('')
      setClientSecret('')
    } catch (error) {
      console.error('[StreamInfoPanel] Error saving credentials:', error)
    }
  }

  const handleAuthenticate = async (): Promise<void> => {
    try {
      setIsLoading(true)
      const success = await window.api.authenticateTwitch()
      if (success) {
        await checkTwitchStatus()
      }
    } catch (error) {
      console.error('[StreamInfoPanel] Authentication error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async (): Promise<void> => {
    try {
      await window.api.disconnectTwitch()
      setIsAuthenticated(false)
      setTwitchUser(null)
      setChannelInfo(null)
    } catch (error) {
      console.error('[StreamInfoPanel] Disconnect error:', error)
    }
  }

  const handleGameSearch = useCallback(async (query: string): Promise<void> => {
    setGameQuery(query)
    if (query.length < 2) {
      setGameResults([])
      setShowGameDropdown(false)
      return
    }

    try {
      const results = await window.api.searchTwitchGames(query)
      setGameResults(results)
      setShowGameDropdown(true)
    } catch (error) {
      console.error('[StreamInfoPanel] Game search error:', error)
    }
  }, [])

  const handleSelectGame = (game: TwitchGame): void => {
    setEditGame(game.name)
    setEditGameId(game.id)
    setGameQuery(game.name)
    setShowGameDropdown(false)
  }

  const handleUpdateChannel = async (): Promise<void> => {
    if (!isAuthenticated) return

    setIsSaving(true)
    try {
      const tags = editTags.split(',').map(t => t.trim()).filter(Boolean)
      const success = await window.api.updateTwitchChannelInfo(
        editTitle || undefined,
        editGameId || undefined,
        tags.length > 0 ? tags : undefined
      )

      if (success) {
        // Refresh channel info
        const info = await window.api.getTwitchChannelInfo()
        setChannelInfo(info)
        console.log('[StreamInfoPanel] Channel updated successfully')
      }
    } catch (error) {
      console.error('[StreamInfoPanel] Update error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Check if there are unsaved changes
  const hasChanges = channelInfo && (
    editTitle !== channelInfo.title ||
    editGameId !== channelInfo.gameId ||
    editTags !== channelInfo.tags.join(', ')
  )

  // ============ YouTube Functions ============
  const checkYouTubeStatus = async (): Promise<void> => {
    try {
      const hasCreds = await window.api.hasYouTubeCredentials()
      setYtHasCredentials(hasCreds)

      if (hasCreds) {
        const isAuth = await window.api.isYouTubeAuthenticated()
        setYtIsAuthenticated(isAuth)

        if (isAuth) {
          const info = await window.api.getYouTubeChannelInfo()
          setYtChannelInfo(info)

          const broadcasts = await window.api.getYouTubeBroadcasts()
          setYtBroadcasts(broadcasts)
        }
      }
    } catch (error) {
      console.error('[StreamInfoPanel] Error checking YouTube status:', error)
    }
  }

  const handleYtSaveCredentials = async (): Promise<void> => {
    if (!ytClientId.trim() || !ytClientSecret.trim()) return

    try {
      await window.api.setYouTubeCredentials(ytClientId.trim(), ytClientSecret.trim())
      setYtHasCredentials(true)
      setYtShowCredentialsForm(false)
      setYtClientId('')
      setYtClientSecret('')
    } catch (error) {
      console.error('[StreamInfoPanel] Error saving YouTube credentials:', error)
    }
  }

  const handleYtAuthenticate = async (): Promise<void> => {
    try {
      setIsLoading(true)
      const success = await window.api.authenticateYouTube()
      if (success) {
        await checkYouTubeStatus()
      }
    } catch (error) {
      console.error('[StreamInfoPanel] YouTube authentication error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleYtDisconnect = async (): Promise<void> => {
    try {
      await window.api.disconnectYouTube()
      setYtIsAuthenticated(false)
      setYtChannelInfo(null)
      setYtBroadcasts([])
    } catch (error) {
      console.error('[StreamInfoPanel] YouTube disconnect error:', error)
    }
  }

  const handleYtCreateBroadcast = async (): Promise<void> => {
    if (!ytEditTitle.trim()) return

    setYtIsSaving(true)
    try {
      const broadcast = await window.api.createYouTubeBroadcast(
        ytEditTitle.trim(),
        ytEditDescription.trim(),
        'public'
      )
      if (broadcast) {
        // Also create stream and bind
        const stream = await window.api.createYouTubeStream(ytEditTitle.trim())
        if (stream) {
          await window.api.bindYouTubeStreamToBroadcast(broadcast.id, stream.id)
          console.log('[StreamInfoPanel] Broadcast created and bound to stream')
          console.log('[StreamInfoPanel] RTMP URL:', stream.rtmpUrl)
          console.log('[StreamInfoPanel] Stream Key:', stream.streamKey)
        }
        // Refresh broadcasts
        const broadcasts = await window.api.getYouTubeBroadcasts()
        setYtBroadcasts(broadcasts)
        setYtEditTitle('')
        setYtEditDescription('')
      }
    } catch (error) {
      console.error('[StreamInfoPanel] Create broadcast error:', error)
    } finally {
      setYtIsSaving(false)
    }
  }

  return (
    <div className={`relative flex transition-all duration-300 ${isOpen ? 'w-80' : 'w-8'}`}>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-8 shrink-0 flex-col items-center justify-center bg-hikari-900 text-hikari-400 hover:bg-hikari-800 hover:text-white transition-colors border-l border-hikari-800"
        title={isOpen ? 'Fermer le panneau' : 'Ouvrir Infos Stream'}
      >
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-0' : 'rotate-180'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {!isOpen && (
          <span className="mt-2 text-[10px] font-medium uppercase tracking-wider" style={{ writingMode: 'vertical-rl' }}>
            Infos
          </span>
        )}
      </button>

      {/* Panel content */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto bg-hikari-900 border-l border-hikari-800">
          <div className="p-3">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-hikari-400">
              Infos Stream
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-hikari-500 border-t-transparent" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Twitch Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-purple-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
                      </svg>
                      <span className="text-sm font-medium text-purple-400">Twitch</span>
                    </div>
                    {isAuthenticated && (
                      <button
                        onClick={handleDisconnect}
                        className="text-[10px] text-hikari-500 hover:text-red-400"
                      >
                        Deconnecter
                      </button>
                    )}
                  </div>

                  {/* Not configured */}
                  {!hasCredentials && !showCredentialsForm && (
                    <div className="rounded-lg bg-hikari-800/50 p-3 text-center">
                      <p className="text-xs text-hikari-400 mb-2">API Twitch non configuree</p>
                      <button
                        onClick={() => setShowCredentialsForm(true)}
                        className="rounded bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-500"
                      >
                        Configurer
                      </button>
                    </div>
                  )}

                  {/* Credentials form */}
                  {showCredentialsForm && (
                    <div className="space-y-2 rounded-lg bg-hikari-800/50 p-3">
                      <p className="text-[10px] text-hikari-400 mb-2">
                        Entrez vos identifiants depuis dev.twitch.tv
                      </p>
                      <input
                        type="text"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="Client ID"
                        className="w-full rounded border border-hikari-700 bg-hikari-800 px-2 py-1.5 text-xs text-white placeholder-hikari-500 focus:border-purple-500 focus:outline-none"
                      />
                      <input
                        type="password"
                        value={clientSecret}
                        onChange={(e) => setClientSecret(e.target.value)}
                        placeholder="Client Secret"
                        className="w-full rounded border border-hikari-700 bg-hikari-800 px-2 py-1.5 text-xs text-white placeholder-hikari-500 focus:border-purple-500 focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowCredentialsForm(false)}
                          className="flex-1 rounded bg-hikari-700 px-2 py-1.5 text-xs text-hikari-300 hover:bg-hikari-600"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={handleSaveCredentials}
                          disabled={!clientId.trim() || !clientSecret.trim()}
                          className="flex-1 rounded bg-purple-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-purple-500 disabled:opacity-50"
                        >
                          Enregistrer
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Has credentials but not authenticated */}
                  {hasCredentials && !isAuthenticated && !showCredentialsForm && (
                    <div className="rounded-lg bg-hikari-800/50 p-3 text-center">
                      <p className="text-xs text-hikari-400 mb-2">Connectez votre compte Twitch</p>
                      <button
                        onClick={handleAuthenticate}
                        className="rounded bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-500"
                      >
                        Se connecter a Twitch
                      </button>
                    </div>
                  )}

                  {/* Authenticated - show channel editor */}
                  {isAuthenticated && twitchUser && (
                    <div className="space-y-3">
                      {/* User info */}
                      <div className="flex items-center gap-2 rounded bg-hikari-800/50 px-2 py-1.5">
                        <div className="h-5 w-5 rounded-full bg-purple-600 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white">
                            {twitchUser.login.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs text-white">{twitchUser.login}</span>
                        <span className="ml-auto rounded bg-green-600/20 px-1.5 py-0.5 text-[10px] text-green-400">
                          Connecte
                        </span>
                      </div>

                      {/* Title */}
                      <div>
                        <label className="mb-1 block text-[10px] uppercase text-hikari-500">Titre</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Titre du stream..."
                          maxLength={140}
                          className="w-full rounded border border-hikari-700 bg-hikari-800 px-2 py-1.5 text-xs text-white placeholder-hikari-500 focus:border-purple-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-hikari-600">{editTitle.length}/140</span>
                      </div>

                      {/* Category / Game */}
                      <div ref={gameSearchRef} className="relative">
                        <label className="mb-1 block text-[10px] uppercase text-hikari-500">Categorie / Jeu</label>
                        <input
                          type="text"
                          value={gameQuery || editGame}
                          onChange={(e) => handleGameSearch(e.target.value)}
                          onFocus={() => gameQuery && setShowGameDropdown(true)}
                          placeholder="Rechercher un jeu..."
                          className="w-full rounded border border-hikari-700 bg-hikari-800 px-2 py-1.5 text-xs text-white placeholder-hikari-500 focus:border-purple-500 focus:outline-none"
                        />
                        {/* Game dropdown */}
                        {showGameDropdown && gameResults.length > 0 && (
                          <div className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-hikari-700 bg-hikari-800 shadow-xl">
                            {gameResults.map((game) => (
                              <button
                                key={game.id}
                                onClick={() => handleSelectGame(game)}
                                className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs text-white hover:bg-hikari-700"
                              >
                                <img
                                  src={game.boxArtUrl.replace('{width}', '20').replace('{height}', '27')}
                                  alt=""
                                  className="h-5 w-4 rounded object-cover"
                                />
                                <span className="truncate">{game.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="mb-1 block text-[10px] uppercase text-hikari-500">Tags</label>
                        <input
                          type="text"
                          value={editTags}
                          onChange={(e) => setEditTags(e.target.value)}
                          placeholder="tag1, tag2, tag3 (max 10)"
                          className="w-full rounded border border-hikari-700 bg-hikari-800 px-2 py-1.5 text-xs text-white placeholder-hikari-500 focus:border-purple-500 focus:outline-none"
                        />
                      </div>

                      {/* Update button */}
                      <button
                        onClick={handleUpdateChannel}
                        disabled={!hasChanges || isSaving}
                        className={`w-full rounded py-2 text-xs font-medium transition-colors ${
                          hasChanges
                            ? 'bg-purple-600 text-white hover:bg-purple-500'
                            : 'bg-hikari-800 text-hikari-500 cursor-not-allowed'
                        }`}
                      >
                        {isSaving ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Mise a jour...
                          </span>
                        ) : hasChanges ? (
                          'Mettre a jour sur Twitch'
                        ) : (
                          'Aucune modification'
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* YouTube Section */}
                <div className="space-y-3 border-t border-hikari-800 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                      <span className="text-sm font-medium text-red-400">YouTube</span>
                    </div>
                    {ytIsAuthenticated && (
                      <button
                        onClick={handleYtDisconnect}
                        className="text-[10px] text-hikari-500 hover:text-red-400"
                      >
                        Deconnecter
                      </button>
                    )}
                  </div>

                  {/* Not configured */}
                  {!ytHasCredentials && !ytShowCredentialsForm && (
                    <div className="rounded-lg bg-hikari-800/50 p-3 text-center">
                      <p className="text-xs text-hikari-400 mb-2">API YouTube non configuree</p>
                      <button
                        onClick={() => setYtShowCredentialsForm(true)}
                        className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500"
                      >
                        Configurer
                      </button>
                    </div>
                  )}

                  {/* Credentials form */}
                  {ytShowCredentialsForm && (
                    <div className="space-y-2 rounded-lg bg-hikari-800/50 p-3">
                      <p className="text-[10px] text-hikari-400 mb-2">
                        Entrez vos identifiants depuis console.cloud.google.com
                      </p>
                      <input
                        type="text"
                        value={ytClientId}
                        onChange={(e) => setYtClientId(e.target.value)}
                        placeholder="Client ID"
                        className="w-full rounded border border-hikari-700 bg-hikari-800 px-2 py-1.5 text-xs text-white placeholder-hikari-500 focus:border-red-500 focus:outline-none"
                      />
                      <input
                        type="password"
                        value={ytClientSecret}
                        onChange={(e) => setYtClientSecret(e.target.value)}
                        placeholder="Client Secret"
                        className="w-full rounded border border-hikari-700 bg-hikari-800 px-2 py-1.5 text-xs text-white placeholder-hikari-500 focus:border-red-500 focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setYtShowCredentialsForm(false)}
                          className="flex-1 rounded bg-hikari-700 px-2 py-1.5 text-xs text-hikari-300 hover:bg-hikari-600"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={handleYtSaveCredentials}
                          disabled={!ytClientId.trim() || !ytClientSecret.trim()}
                          className="flex-1 rounded bg-red-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-50"
                        >
                          Enregistrer
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Has credentials but not authenticated */}
                  {ytHasCredentials && !ytIsAuthenticated && !ytShowCredentialsForm && (
                    <div className="rounded-lg bg-hikari-800/50 p-3 text-center">
                      <p className="text-xs text-hikari-400 mb-2">Connectez votre compte YouTube</p>
                      <button
                        onClick={handleYtAuthenticate}
                        className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500"
                      >
                        Se connecter a YouTube
                      </button>
                    </div>
                  )}

                  {/* Authenticated - show channel info and broadcast editor */}
                  {ytIsAuthenticated && ytChannelInfo && (
                    <div className="space-y-3">
                      {/* Channel info */}
                      <div className="flex items-center gap-2 rounded bg-hikari-800/50 px-2 py-1.5">
                        {ytChannelInfo.thumbnailUrl && (
                          <img
                            src={ytChannelInfo.thumbnailUrl}
                            alt=""
                            className="h-5 w-5 rounded-full"
                          />
                        )}
                        <span className="text-xs text-white truncate">{ytChannelInfo.title}</span>
                        <span className="ml-auto rounded bg-green-600/20 px-1.5 py-0.5 text-[10px] text-green-400">
                          Connecte
                        </span>
                      </div>

                      {/* Existing broadcasts */}
                      {ytBroadcasts.length > 0 && (
                        <div>
                          <label className="mb-1 block text-[10px] uppercase text-hikari-500">
                            Broadcasts programmes
                          </label>
                          <div className="space-y-1">
                            {ytBroadcasts.slice(0, 3).map((broadcast) => (
                              <div
                                key={broadcast.id}
                                className="rounded bg-hikari-800/50 px-2 py-1.5 text-xs text-white"
                              >
                                <div className="truncate">{broadcast.title}</div>
                                <div className="text-[10px] text-hikari-500">
                                  {broadcast.privacyStatus} • {broadcast.status}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Create new broadcast */}
                      <div>
                        <label className="mb-1 block text-[10px] uppercase text-hikari-500">
                          Nouveau broadcast
                        </label>
                        <input
                          type="text"
                          value={ytEditTitle}
                          onChange={(e) => setYtEditTitle(e.target.value)}
                          placeholder="Titre du live..."
                          className="w-full rounded border border-hikari-700 bg-hikari-800 px-2 py-1.5 text-xs text-white placeholder-hikari-500 focus:border-red-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <input
                          type="text"
                          value={ytEditDescription}
                          onChange={(e) => setYtEditDescription(e.target.value)}
                          placeholder="Description..."
                          className="w-full rounded border border-hikari-700 bg-hikari-800 px-2 py-1.5 text-xs text-white placeholder-hikari-500 focus:border-red-500 focus:outline-none"
                        />
                      </div>

                      <button
                        onClick={handleYtCreateBroadcast}
                        disabled={!ytEditTitle.trim() || ytIsSaving}
                        className="w-full rounded bg-red-600 py-2 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-50"
                      >
                        {ytIsSaving ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Creation...
                          </span>
                        ) : (
                          'Creer broadcast YouTube'
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Info text */}
                <p className="text-[10px] text-hikari-600 border-t border-hikari-800 pt-3">
                  Les modifications sont envoyees directement aux plateformes.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default StreamInfoPanel
