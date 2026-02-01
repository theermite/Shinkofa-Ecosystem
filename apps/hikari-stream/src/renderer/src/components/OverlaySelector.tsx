import { useState, useRef } from 'react'
import { useAppStore, ImageOverlay, TextOverlay, VideoOverlay, BrowserOverlay } from '../stores/appStore'

interface OverlaySelectorProps {
  isOpen: boolean
  onClose: () => void
}

type OverlayCategory = 'image' | 'text' | 'video' | 'browser'

function OverlaySelector({ isOpen, onClose }: OverlaySelectorProps): JSX.Element | null {
  const { addOverlay } = useAppStore()
  const [activeCategory, setActiveCategory] = useState<OverlayCategory>('image')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Image state
  const [imageName, setImageName] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Text state
  const [textName, setTextName] = useState('')
  const [textContent, setTextContent] = useState('')
  const [textFontSize, setTextFontSize] = useState(24)
  const [textColor, setTextColor] = useState('#ffffff')
  const [textBgColor, setTextBgColor] = useState('transparent')
  const [textFontWeight, setTextFontWeight] = useState<'normal' | 'bold'>('normal')
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center')

  // Video state
  const [videoName, setVideoName] = useState('')
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [videoLoop, setVideoLoop] = useState(true)
  const [videoMuted, setVideoMuted] = useState(true)

  // Browser state
  const [browserName, setBrowserName] = useState('')
  const [browserUrl, setBrowserUrl] = useState('')

  const categories: { id: OverlayCategory; label: string; icon: JSX.Element }[] = [
    {
      id: 'image',
      label: 'Image',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'text',
      label: 'Texte',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      )
    },
    {
      id: 'video',
      label: 'Video',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'browser',
      label: 'URL',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      )
    }
  ]

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event): void => {
      setImagePreview(event.target?.result as string)
      if (!imageName) setImageName(file.name.replace(/\.[^/.]+$/, ''))
    }
    reader.readAsDataURL(file)
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event): void => {
      setVideoPreview(event.target?.result as string)
      if (!videoName) setVideoName(file.name.replace(/\.[^/.]+$/, ''))
    }
    reader.readAsDataURL(file)
  }

  const handleAddImage = (): void => {
    if (!imagePreview) return

    const overlay: ImageOverlay = {
      id: `overlay-${Date.now()}`,
      name: imageName || 'Image',
      type: 'image',
      enabled: true,
      position: 'center',
      size: 'medium',
      zIndex: 30,
      opacity: 100,
      src: imagePreview,
      fit: 'contain'
    }
    addOverlay(overlay)
    resetAndClose()
  }

  const handleAddText = (): void => {
    if (!textContent.trim()) return

    const overlay: TextOverlay = {
      id: `overlay-${Date.now()}`,
      name: textName || 'Texte',
      type: 'text',
      enabled: true,
      position: 'center',
      size: 'medium',
      zIndex: 30,
      opacity: 100,
      content: textContent,
      fontFamily: 'Arial',
      fontSize: textFontSize,
      fontWeight: textFontWeight,
      color: textColor,
      backgroundColor: textBgColor,
      textAlign: textAlign,
      padding: 12,
      borderRadius: 8,
      shadow: true
    }
    addOverlay(overlay)
    resetAndClose()
  }

  const handleAddVideo = (): void => {
    if (!videoPreview) return

    const overlay: VideoOverlay = {
      id: `overlay-${Date.now()}`,
      name: videoName || 'Video',
      type: 'video',
      enabled: true,
      position: 'center',
      size: 'medium',
      zIndex: 30,
      opacity: 100,
      src: videoPreview,
      loop: videoLoop,
      muted: videoMuted,
      autoplay: true
    }
    addOverlay(overlay)
    resetAndClose()
  }

  const handleAddBrowser = (): void => {
    if (!browserUrl.trim()) return

    const overlay: BrowserOverlay = {
      id: `overlay-${Date.now()}`,
      name: browserName || 'Widget',
      type: 'browser',
      enabled: true,
      position: 'bottom-right',
      size: 'medium',
      zIndex: 30,
      opacity: 100,
      url: browserUrl,
      refreshInterval: 0
    }
    addOverlay(overlay)
    resetAndClose()
  }

  const resetAndClose = (): void => {
    setImageName('')
    setImagePreview(null)
    setTextName('')
    setTextContent('')
    setTextFontSize(24)
    setTextColor('#ffffff')
    setTextBgColor('transparent')
    setVideoName('')
    setVideoPreview(null)
    setVideoLoop(true)
    setVideoMuted(true)
    setBrowserName('')
    setBrowserUrl('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-hikari-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hikari-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Ajouter un overlay</h2>
          <button
            onClick={resetAndClose}
            className="rounded-lg p-2 text-hikari-400 transition-colors hover:bg-hikari-800 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex border-b border-hikari-800">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? 'border-b-2 border-hikari-500 text-white'
                  : 'text-hikari-400 hover:text-hikari-300'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Image form */}
          {activeCategory === 'image' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-hikari-400">Nom</label>
                <input
                  type="text"
                  value={imageName}
                  onChange={(e) => setImageName(e.target.value)}
                  placeholder="Logo, Banniere, etc."
                  className="w-full rounded-lg border border-hikari-700 bg-hikari-800 px-3 py-2 text-sm text-white placeholder-hikari-500 focus:border-hikari-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-hikari-400">Image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="h-32 w-full rounded-lg object-contain bg-hikari-800" />
                    <button
                      onClick={() => {
                        setImagePreview(null)
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-500"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-hikari-700 py-8 text-hikari-400 transition-colors hover:border-hikari-500 hover:text-hikari-300"
                  >
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Cliquez pour selectionner une image</span>
                  </button>
                )}
              </div>

              <button
                onClick={handleAddImage}
                disabled={!imagePreview}
                className="w-full rounded-lg bg-hikari-600 py-2 text-sm font-medium text-white transition-colors hover:bg-hikari-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajouter l'image
              </button>
            </div>
          )}

          {/* Text form */}
          {activeCategory === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-hikari-400">Nom</label>
                <input
                  type="text"
                  value={textName}
                  onChange={(e) => setTextName(e.target.value)}
                  placeholder="Titre, Sous-titre, etc."
                  className="w-full rounded-lg border border-hikari-700 bg-hikari-800 px-3 py-2 text-sm text-white placeholder-hikari-500 focus:border-hikari-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-hikari-400">Contenu</label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Votre texte ici..."
                  rows={3}
                  className="w-full rounded-lg border border-hikari-700 bg-hikari-800 px-3 py-2 text-sm text-white placeholder-hikari-500 focus:border-hikari-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-hikari-400">Taille</label>
                  <input
                    type="number"
                    value={textFontSize}
                    onChange={(e) => setTextFontSize(parseInt(e.target.value) || 24)}
                    min={12}
                    max={200}
                    className="w-full rounded-lg border border-hikari-700 bg-hikari-800 px-3 py-2 text-sm text-white focus:border-hikari-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-hikari-400">Couleur</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="h-9 w-full rounded-lg border border-hikari-700 bg-hikari-800 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-hikari-400">Fond</label>
                  <input
                    type="color"
                    value={textBgColor === 'transparent' ? '#000000' : textBgColor}
                    onChange={(e) => setTextBgColor(e.target.value)}
                    className="h-9 w-full rounded-lg border border-hikari-700 bg-hikari-800 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-hikari-400">Style</label>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setTextFontWeight(textFontWeight === 'bold' ? 'normal' : 'bold')}
                      className={`flex-1 rounded-lg py-2 text-sm font-bold transition-colors ${
                        textFontWeight === 'bold' ? 'bg-hikari-600 text-white' : 'bg-hikari-800 text-hikari-400'
                      }`}
                    >
                      B
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-hikari-400">Alignement</label>
                  <div className="flex gap-1">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() => setTextAlign(align)}
                        className={`flex-1 rounded-lg py-2 text-xs transition-colors ${
                          textAlign === align ? 'bg-hikari-600 text-white' : 'bg-hikari-800 text-hikari-400'
                        }`}
                      >
                        {align === 'left' ? '←' : align === 'center' ? '↔' : '→'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview */}
              {textContent && (
                <div className="rounded-lg bg-hikari-800 p-4">
                  <p className="text-xs text-hikari-500 mb-2">Apercu</p>
                  <div
                    style={{
                      fontSize: `${Math.min(textFontSize, 48)}px`,
                      color: textColor,
                      backgroundColor: textBgColor,
                      fontWeight: textFontWeight,
                      textAlign: textAlign,
                      padding: '8px 12px',
                      borderRadius: '8px'
                    }}
                  >
                    {textContent}
                  </div>
                </div>
              )}

              <button
                onClick={handleAddText}
                disabled={!textContent.trim()}
                className="w-full rounded-lg bg-hikari-600 py-2 text-sm font-medium text-white transition-colors hover:bg-hikari-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajouter le texte
              </button>
            </div>
          )}

          {/* Video form */}
          {activeCategory === 'video' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-hikari-400">Nom</label>
                <input
                  type="text"
                  value={videoName}
                  onChange={(e) => setVideoName(e.target.value)}
                  placeholder="Animation, Intro, etc."
                  className="w-full rounded-lg border border-hikari-700 bg-hikari-800 px-3 py-2 text-sm text-white placeholder-hikari-500 focus:border-hikari-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-hikari-400">Video</label>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
                {videoPreview ? (
                  <div className="relative">
                    <video src={videoPreview} className="h-32 w-full rounded-lg object-contain bg-hikari-800" muted autoPlay loop />
                    <button
                      onClick={() => {
                        setVideoPreview(null)
                        if (videoInputRef.current) videoInputRef.current.value = ''
                      }}
                      className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-500"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-hikari-700 py-8 text-hikari-400 transition-colors hover:border-hikari-500 hover:text-hikari-300"
                  >
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Cliquez pour selectionner une video</span>
                  </button>
                )}
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-hikari-300">
                  <input
                    type="checkbox"
                    checked={videoLoop}
                    onChange={(e) => setVideoLoop(e.target.checked)}
                    className="rounded border-hikari-600"
                  />
                  Boucle
                </label>
                <label className="flex items-center gap-2 text-sm text-hikari-300">
                  <input
                    type="checkbox"
                    checked={videoMuted}
                    onChange={(e) => setVideoMuted(e.target.checked)}
                    className="rounded border-hikari-600"
                  />
                  Muet
                </label>
              </div>

              <button
                onClick={handleAddVideo}
                disabled={!videoPreview}
                className="w-full rounded-lg bg-hikari-600 py-2 text-sm font-medium text-white transition-colors hover:bg-hikari-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajouter la video
              </button>
            </div>
          )}

          {/* Browser form */}
          {activeCategory === 'browser' && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-hikari-400">Nom</label>
                <input
                  type="text"
                  value={browserName}
                  onChange={(e) => setBrowserName(e.target.value)}
                  placeholder="Alertes, Chat, Donation, etc."
                  className="w-full rounded-lg border border-hikari-700 bg-hikari-800 px-3 py-2 text-sm text-white placeholder-hikari-500 focus:border-hikari-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-hikari-400">URL</label>
                <input
                  type="url"
                  value={browserUrl}
                  onChange={(e) => setBrowserUrl(e.target.value)}
                  placeholder="https://streamelements.com/overlay/..."
                  className="w-full rounded-lg border border-hikari-700 bg-hikari-800 px-3 py-2 text-sm text-white placeholder-hikari-500 focus:border-hikari-500 focus:outline-none"
                />
              </div>

              <div className="rounded-lg bg-hikari-800/50 p-3 text-xs text-hikari-400">
                <p className="font-medium text-hikari-300 mb-1">URLs compatibles</p>
                <ul className="list-disc ml-4 space-y-0.5">
                  <li>StreamElements alerts/chat</li>
                  <li>Streamlabs widgets</li>
                  <li>Ko-fi overlays</li>
                  <li>Toute page web responsive</li>
                </ul>
              </div>

              <button
                onClick={handleAddBrowser}
                disabled={!browserUrl.trim()}
                className="w-full rounded-lg bg-hikari-600 py-2 text-sm font-medium text-white transition-colors hover:bg-hikari-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajouter le widget
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OverlaySelector
