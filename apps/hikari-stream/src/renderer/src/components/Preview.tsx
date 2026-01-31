import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../stores/appStore'

function Preview(): JSX.Element {
  const { scenes, activeSceneId, streamStatus, streamStats, activeSource } = useAppStore()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const activeScene = scenes.find((s) => s.id === activeSceneId)

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Start video capture when source is selected
  useEffect(() => {
    if (!activeSource || !videoRef.current) return

    const startCapture = async (): Promise<void> => {
      try {
        setIsCapturing(true)
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            // @ts-expect-error - Electron-specific constraint
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: activeSource.id
            }
          }
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      } catch (error) {
        console.error('[Preview] Failed to start capture:', error)
        setIsCapturing(false)
      }
    }

    startCapture()

    return () => {
      // Cleanup: stop all tracks
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
        videoRef.current.srcObject = null
      }
      setIsCapturing(false)
    }
  }, [activeSource])

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-hikari-950 p-4">
      {/* Preview header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white">Aperçu</h2>
          <span className="rounded-md bg-hikari-800 px-2 py-1 text-xs text-hikari-300">
            {activeScene?.name || 'Aucune scène'}
          </span>
        </div>

        {/* Stream stats (visible when live) */}
        {streamStatus === 'live' && (
          <div className="flex items-center gap-4 text-xs text-hikari-400">
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {formatDuration(streamStats.duration)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              {streamStats.bitrate} kbps
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {streamStats.viewers.twitch + streamStats.viewers.youtube}
            </span>
          </div>
        )}
      </div>

      {/* Preview canvas */}
      <div className="flex flex-1 items-center justify-center overflow-hidden rounded-xl bg-black">
        <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-lg bg-hikari-900">
          {/* Video element for live capture */}
          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-contain ${
              isCapturing ? 'opacity-100' : 'opacity-0'
            }`}
            muted
            playsInline
          />

          {/* Thumbnail fallback when not capturing but source selected */}
          {activeSource && !isCapturing && (
            <img
              src={activeSource.thumbnail}
              alt={activeSource.name}
              className="absolute inset-0 h-full w-full object-contain"
            />
          )}

          {/* Placeholder content when no source */}
          {!activeSource && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-hikari-500">
              <svg className="mb-4 h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm">Aucune source active</p>
              <p className="mt-1 text-xs text-hikari-600">
                Ajoutez une capture d'écran ou une webcam pour commencer
              </p>
            </div>
          )}

          {/* Source name badge */}
          {activeSource && (
            <div className="absolute left-3 top-3 rounded-md bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm">
              {activeSource.type === 'screen' ? 'Ecran' : 'Fenetre'}: {activeSource.name}
            </div>
          )}

          {/* 16:9 guide overlay (dev mode) */}
          <div className="pointer-events-none absolute inset-0 border border-dashed border-hikari-700 opacity-50" />
        </div>
      </div>

      {/* Preview controls */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <button className="btn-secondary text-sm">
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
            />
          </svg>
          Plein écran
        </button>
        <button className="btn-secondary text-sm">
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          Éditer layout
        </button>
      </div>
    </div>
  )
}

export default Preview
