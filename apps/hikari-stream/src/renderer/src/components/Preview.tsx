import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useAppStore, PipPosition, PipSize, CustomPosition, CustomSize, Overlay, ImageOverlay, TextOverlay, VideoOverlay, TransitionType } from '../stores/appStore'

function Preview(): JSX.Element {
  const {
    scenes, activeSceneId, streamStatus, streamStats, activeSource,
    webcam, updateWebcamPosition, updateWebcamCustomPosition, updateWebcamSize, updateWebcamCustomSize, toggleWebcam,
    phone, updatePhonePosition, updatePhoneCustomPosition, updatePhoneSize, updatePhoneCustomSize, togglePhone,
    overlays, updateOverlayCustomPosition, updateOverlayCustomSize, toggleOverlay,
    transitionConfig, isTransitioning
  } = useAppStore()
  const videoRef = useRef<HTMLVideoElement>(null)
  const webcamRef = useRef<HTMLVideoElement>(null)
  const phoneRef = useRef<HTMLVideoElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isWebcamCapturing, setIsWebcamCapturing] = useState(false)
  const [isPhoneCapturing, setIsPhoneCapturing] = useState(false)
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null)
  const [phoneStream, setPhoneStream] = useState<MediaStream | null>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const [isDraggingWebcam, setIsDraggingWebcam] = useState(false)
  const [isDraggingPhone, setIsDraggingPhone] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isResizingWebcam, setIsResizingWebcam] = useState(false)
  const [isResizingPhone, setIsResizingPhone] = useState(false)
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, mouseX: 0, mouseY: 0 })
  const [draggingOverlayId, setDraggingOverlayId] = useState<string | null>(null)
  const [resizingOverlayId, setResizingOverlayId] = useState<string | null>(null)
  const activeScene = scenes.find((s) => s.id === activeSceneId)

  // Transition animation styles
  const getTransitionStyle = useMemo((): React.CSSProperties => {
    const { type, duration, easing } = transitionConfig
    const easingMap = {
      'linear': 'linear',
      'ease-in': 'ease-in',
      'ease-out': 'ease-out',
      'ease-in-out': 'ease-in-out'
    }

    if (!isTransitioning) {
      return {
        opacity: 1,
        transform: 'translate(0, 0) scale(1)',
        transition: `all ${duration}ms ${easingMap[easing]}`
      }
    }

    // Apply transition effect based on type
    switch (type) {
      case 'fade':
        return {
          opacity: 0,
          transition: `opacity ${duration}ms ${easingMap[easing]}`
        }
      case 'slide-left':
        return {
          transform: 'translateX(-100%)',
          transition: `transform ${duration}ms ${easingMap[easing]}`
        }
      case 'slide-right':
        return {
          transform: 'translateX(100%)',
          transition: `transform ${duration}ms ${easingMap[easing]}`
        }
      case 'slide-up':
        return {
          transform: 'translateY(-100%)',
          transition: `transform ${duration}ms ${easingMap[easing]}`
        }
      case 'slide-down':
        return {
          transform: 'translateY(100%)',
          transition: `transform ${duration}ms ${easingMap[easing]}`
        }
      case 'zoom':
        return {
          opacity: 0,
          transform: 'scale(0.8)',
          transition: `all ${duration}ms ${easingMap[easing]}`
        }
      case 'wipe':
        return {
          clipPath: 'inset(0 100% 0 0)',
          transition: `clip-path ${duration}ms ${easingMap[easing]}`
        }
      case 'move':
        return {
          opacity: 0,
          transform: 'translate(50%, 50%) scale(0.9)',
          transition: `all ${duration}ms ${easingMap[easing]}`
        }
      case 'cut':
      default:
        return {}
    }
  }, [transitionConfig, isTransitioning])

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

  // Start webcam capture when enabled
  useEffect(() => {
    if (!webcam?.enabled || !webcam.deviceId) {
      // Stop webcam if disabled or removed
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop())
        setWebcamStream(null)
        setIsWebcamCapturing(false)
      }
      return
    }

    // Small delay to ensure the video element is rendered
    const timer = setTimeout(() => {
      const startWebcamCapture = async (): Promise<void> => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: webcam.deviceId },
              width: { ideal: 640 },
              height: { ideal: 480 }
            }
          })

          setWebcamStream(stream)
          setIsWebcamCapturing(true)

          if (webcamRef.current) {
            webcamRef.current.srcObject = stream
            webcamRef.current.play()
          }
        } catch (error) {
          console.error('[Preview] Failed to start webcam:', error)
          setIsWebcamCapturing(false)
        }
      }

      startWebcamCapture()
    }, 100)

    return () => {
      clearTimeout(timer)
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop())
        setWebcamStream(null)
      }
      setIsWebcamCapturing(false)
    }
  }, [webcam?.enabled, webcam?.deviceId])

  // Start phone capture when enabled (captures scrcpy window)
  useEffect(() => {
    if (!phone?.enabled || !phone.sourceId) {
      // Stop phone capture if disabled or removed
      if (phoneStream) {
        phoneStream.getTracks().forEach((track) => track.stop())
        setPhoneStream(null)
        setIsPhoneCapturing(false)
      }
      return
    }

    // Small delay to ensure the video element is rendered
    const timer = setTimeout(() => {
      const startPhoneCapture = async (): Promise<void> => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              // @ts-expect-error - Electron-specific constraint
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: phone.sourceId
              }
            }
          })

          setPhoneStream(stream)
          setIsPhoneCapturing(true)

          if (phoneRef.current) {
            phoneRef.current.srcObject = stream
            phoneRef.current.play()
          }
        } catch (error) {
          console.error('[Preview] Failed to start phone capture:', error)
          setIsPhoneCapturing(false)
        }
      }

      startPhoneCapture()
    }, 100)

    return () => {
      clearTimeout(timer)
      if (phoneStream) {
        phoneStream.getTracks().forEach((track) => track.stop())
        setPhoneStream(null)
      }
      setIsPhoneCapturing(false)
    }
  }, [phone?.enabled, phone?.sourceId])

  // Helper to get PiP position classes (for predefined positions)
  const getPositionClasses = (position: PipPosition, size: PipSize): string => {
    if (size === 'full') return 'inset-0'
    if (position === 'custom') return '' // Custom position uses inline styles
    const positions = {
      'top-left': 'top-3 left-3',
      'top-right': 'top-3 right-3',
      'bottom-left': 'bottom-3 left-3',
      'bottom-right': 'bottom-3 right-3',
      'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
    }
    return positions[position] || ''
  }

  // Helper to get custom position styles
  const getCustomPositionStyle = (customPosition?: CustomPosition): React.CSSProperties => {
    if (!customPosition) return {}
    return {
      left: `${customPosition.x}%`,
      top: `${customPosition.y}%`,
      transform: 'translate(-50%, -50%)'
    }
  }

  // Drag handlers for webcam
  const handleWebcamDragStart = useCallback((e: React.MouseEvent) => {
    if (webcam?.size === 'full') return
    e.preventDefault()
    setIsDraggingWebcam(true)
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2
    })
  }, [webcam?.size])

  const handleWebcamDrag = useCallback((e: React.MouseEvent) => {
    if (!isDraggingWebcam || !previewContainerRef.current) return
    const container = previewContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - container.left - dragOffset.x) / container.width) * 100
    const y = ((e.clientY - container.top - dragOffset.y) / container.height) * 100
    // Clamp values between 5 and 95 to keep overlay visible
    updateWebcamCustomPosition(
      Math.max(5, Math.min(95, x)),
      Math.max(5, Math.min(95, y))
    )
  }, [isDraggingWebcam, dragOffset, updateWebcamCustomPosition])

  const handleWebcamDragEnd = useCallback(() => {
    setIsDraggingWebcam(false)
  }, [])

  // Drag handlers for phone
  const handlePhoneDragStart = useCallback((e: React.MouseEvent) => {
    if (phone?.size === 'full') return
    e.preventDefault()
    setIsDraggingPhone(true)
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2
    })
  }, [phone?.size])

  const handlePhoneDrag = useCallback((e: React.MouseEvent) => {
    if (!isDraggingPhone || !previewContainerRef.current) return
    const container = previewContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - container.left - dragOffset.x) / container.width) * 100
    const y = ((e.clientY - container.top - dragOffset.y) / container.height) * 100
    updatePhoneCustomPosition(
      Math.max(5, Math.min(95, x)),
      Math.max(5, Math.min(95, y))
    )
  }, [isDraggingPhone, dragOffset, updatePhoneCustomPosition])

  const handlePhoneDragEnd = useCallback(() => {
    setIsDraggingPhone(false)
  }, [])

  // Resize handlers for webcam
  const handleWebcamResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!previewContainerRef.current) return
    const container = previewContainerRef.current.getBoundingClientRect()
    const currentWidth = webcam?.customSize?.width || (webcam?.size === 'small' ? 15 : webcam?.size === 'medium' ? 25 : webcam?.size === 'large' ? 35 : 100)
    const currentHeight = webcam?.customSize?.height || (currentWidth * 0.5625) // 16:9 ratio
    setResizeStart({
      width: currentWidth,
      height: currentHeight,
      mouseX: e.clientX,
      mouseY: e.clientY
    })
    setIsResizingWebcam(true)
  }, [webcam?.customSize, webcam?.size])

  const handleWebcamResize = useCallback((e: React.MouseEvent) => {
    if (!isResizingWebcam || !previewContainerRef.current) return
    const container = previewContainerRef.current.getBoundingClientRect()
    const deltaX = ((e.clientX - resizeStart.mouseX) / container.width) * 100
    const deltaY = ((e.clientY - resizeStart.mouseY) / container.height) * 100
    // Use max of deltaX and deltaY to maintain aspect ratio feel
    const delta = Math.max(deltaX, deltaY)
    const newWidth = Math.max(10, Math.min(80, resizeStart.width + delta))
    const newHeight = newWidth * 0.5625 // Maintain 16:9 aspect ratio
    updateWebcamCustomSize(newWidth, newHeight)
  }, [isResizingWebcam, resizeStart, updateWebcamCustomSize])

  const handleWebcamResizeEnd = useCallback(() => {
    setIsResizingWebcam(false)
  }, [])

  // Resize handlers for phone (free-form - adapts to any orientation)
  const handlePhoneResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!previewContainerRef.current) return
    // Get current size or defaults
    const currentWidth = phone?.customSize?.width || (phone?.size === 'small' ? 15 : phone?.size === 'medium' ? 22 : phone?.size === 'large' ? 30 : 100)
    const currentHeight = phone?.customSize?.height || (phone?.size === 'small' ? 30 : phone?.size === 'medium' ? 45 : phone?.size === 'large' ? 60 : 100)
    setResizeStart({
      width: currentWidth,
      height: currentHeight,
      mouseX: e.clientX,
      mouseY: e.clientY
    })
    setIsResizingPhone(true)
  }, [phone?.customSize, phone?.size])

  const handlePhoneResize = useCallback((e: React.MouseEvent) => {
    if (!isResizingPhone || !previewContainerRef.current) return
    const container = previewContainerRef.current.getBoundingClientRect()
    const deltaX = ((e.clientX - resizeStart.mouseX) / container.width) * 100
    const deltaY = ((e.clientY - resizeStart.mouseY) / container.height) * 100
    // Free-form resize - both width and height change independently
    const newWidth = Math.max(10, Math.min(80, resizeStart.width + deltaX))
    const newHeight = Math.max(10, Math.min(90, resizeStart.height + deltaY))
    updatePhoneCustomSize(newWidth, newHeight)
  }, [isResizingPhone, resizeStart, updatePhoneCustomSize])

  const handlePhoneResizeEnd = useCallback(() => {
    setIsResizingPhone(false)
  }, [])

  // Overlay drag handlers
  const handleOverlayDragStart = useCallback((overlayId: string, e: React.MouseEvent) => {
    const overlay = overlays.find(o => o.id === overlayId)
    if (!overlay || overlay.size === 'full') return
    e.preventDefault()
    setDraggingOverlayId(overlayId)
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2
    })
  }, [overlays])

  const handleOverlayDrag = useCallback((e: React.MouseEvent) => {
    if (!draggingOverlayId || !previewContainerRef.current) return
    const container = previewContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - container.left - dragOffset.x) / container.width) * 100
    const y = ((e.clientY - container.top - dragOffset.y) / container.height) * 100
    updateOverlayCustomPosition(
      draggingOverlayId,
      Math.max(5, Math.min(95, x)),
      Math.max(5, Math.min(95, y))
    )
  }, [draggingOverlayId, dragOffset, updateOverlayCustomPosition])

  const handleOverlayDragEnd = useCallback(() => {
    setDraggingOverlayId(null)
  }, [])

  // Overlay resize handlers
  const handleOverlayResizeStart = useCallback((overlayId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const overlay = overlays.find(o => o.id === overlayId)
    if (!overlay) return
    const currentWidth = overlay.customSize?.width || 25
    const currentHeight = overlay.customSize?.height || 25
    setResizeStart({
      width: currentWidth,
      height: currentHeight,
      mouseX: e.clientX,
      mouseY: e.clientY
    })
    setResizingOverlayId(overlayId)
  }, [overlays])

  const handleOverlayResize = useCallback((e: React.MouseEvent) => {
    if (!resizingOverlayId || !previewContainerRef.current) return
    const container = previewContainerRef.current.getBoundingClientRect()
    const deltaX = ((e.clientX - resizeStart.mouseX) / container.width) * 100
    const deltaY = ((e.clientY - resizeStart.mouseY) / container.height) * 100
    const newWidth = Math.max(5, Math.min(80, resizeStart.width + deltaX))
    const newHeight = Math.max(5, Math.min(80, resizeStart.height + deltaY))
    updateOverlayCustomSize(resizingOverlayId, newWidth, newHeight)
  }, [resizingOverlayId, resizeStart, updateOverlayCustomSize])

  const handleOverlayResizeEnd = useCallback(() => {
    setResizingOverlayId(null)
  }, [])

  // Helper to get overlay size style
  const getOverlaySizeStyle = (overlay: Overlay): React.CSSProperties => {
    if (overlay.customSize) {
      return { width: `${overlay.customSize.width}%`, height: `${overlay.customSize.height}%` }
    }
    const sizes = {
      small: { width: '15%', height: '15%' },
      medium: { width: '25%', height: '25%' },
      large: { width: '40%', height: '40%' },
      full: { width: '100%', height: '100%' }
    }
    return sizes[overlay.size]
  }

  // Helper to get webcam size style (supports custom size)
  const getWebcamSizeStyle = (size: PipSize, customSize?: CustomSize): React.CSSProperties => {
    if (customSize) {
      return { width: `${customSize.width}%`, aspectRatio: '16/9' }
    }
    if (size === 'full') {
      return { width: '100%', height: '100%' }
    }
    const widths = { small: '15%', medium: '25%', large: '35%', full: '100%' }
    return { width: widths[size], aspectRatio: '16/9' }
  }

  // Helper to get webcam size classes (for non-custom)
  const getWebcamSizeClasses = (size: PipSize, customSize?: CustomSize): string => {
    if (customSize || size === 'full') return ''
    return 'aspect-video'
  }

  // Helper to get phone size style (supports custom size) - Free-form, adapts to any orientation
  const getPhoneSizeStyle = (size: PipSize, customSize?: CustomSize): React.CSSProperties => {
    if (customSize) {
      // Free-form size - no forced aspect ratio
      return {
        width: `${customSize.width}%`,
        height: `${customSize.height}%`
      }
    }
    if (size === 'full') {
      return { width: '100%', height: '100%' }
    }
    const sizes = {
      small: { maxWidth: '15%', maxHeight: '30%' },
      medium: { maxWidth: '22%', maxHeight: '45%' },
      large: { maxWidth: '30%', maxHeight: '60%' },
      full: { width: '100%', height: '100%' }
    }
    return sizes[size]
  }

  // Helper to get phone size classes (for non-custom)
  const getPhoneSizeClasses = (size: PipSize, customSize?: CustomSize): string => {
    if (customSize || size === 'full') return ''
    return ''
  }

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
      <div className="flex flex-1 items-center justify-center overflow-hidden rounded-xl bg-black p-2">
        <div
          ref={previewContainerRef}
          className="relative aspect-video h-full max-h-full w-auto overflow-hidden rounded-lg bg-hikari-900"
          onMouseMove={(e) => {
            if (isDraggingWebcam) handleWebcamDrag(e)
            if (isDraggingPhone) handlePhoneDrag(e)
            if (isResizingWebcam) handleWebcamResize(e)
            if (isResizingPhone) handlePhoneResize(e)
            if (draggingOverlayId) handleOverlayDrag(e)
            if (resizingOverlayId) handleOverlayResize(e)
          }}
          onMouseUp={() => {
            handleWebcamDragEnd()
            handlePhoneDragEnd()
            handleWebcamResizeEnd()
            handlePhoneResizeEnd()
            handleOverlayDragEnd()
            handleOverlayResizeEnd()
          }}
          onMouseLeave={() => {
            handleWebcamDragEnd()
            handlePhoneDragEnd()
            handleWebcamResizeEnd()
            handlePhoneResizeEnd()
            handleOverlayDragEnd()
            handleOverlayResizeEnd()
          }}
        >
          {/* Transition wrapper */}
          <div
            className="absolute inset-0"
            style={getTransitionStyle}
          >
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

          {/* Webcam PiP overlay */}
          {webcam?.enabled && (
            <div
              className={`absolute ${getPositionClasses(webcam.position, webcam.size)} ${getWebcamSizeClasses(webcam.size, webcam.customSize)} ${webcam.size !== 'full' ? 'rounded-lg border-2 border-hikari-500 shadow-lg cursor-move' : ''} overflow-hidden ${isWebcamCapturing ? 'opacity-100' : 'opacity-50'} ${isDraggingWebcam || isResizingWebcam ? 'ring-2 ring-hikari-400' : ''}`}
              style={{
                zIndex: webcam.zIndex || 20,
                ...getWebcamSizeStyle(webcam.size, webcam.customSize),
                ...(webcam.position === 'custom' ? getCustomPositionStyle(webcam.customPosition) : {})
              }}
              onMouseDown={handleWebcamDragStart}
            >
              <video
                ref={webcamRef}
                className="h-full w-full object-cover"
                muted
                playsInline
                autoPlay
              />
              {/* Loading indicator when not capturing yet */}
              {!isWebcamCapturing && (
                <div className="absolute inset-0 flex items-center justify-center bg-hikari-900">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-hikari-600 border-t-hikari-300" />
                </div>
              )}
              {/* Webcam controls overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                {/* Position buttons */}
                <button
                  onClick={() => updateWebcamPosition('top-left')}
                  className={`rounded p-1 ${webcam.position === 'top-left' && webcam.size !== 'full' ? 'bg-hikari-500' : 'bg-hikari-700 hover:bg-hikari-600'}`}
                  title="Haut gauche"
                >
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17V7h10" />
                  </svg>
                </button>
                <button
                  onClick={() => updateWebcamPosition('top-right')}
                  className={`rounded p-1 ${webcam.position === 'top-right' && webcam.size !== 'full' ? 'bg-hikari-500' : 'bg-hikari-700 hover:bg-hikari-600'}`}
                  title="Haut droite"
                >
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17V7H7" />
                  </svg>
                </button>
                <button
                  onClick={() => updateWebcamPosition('center')}
                  className={`rounded p-1 ${webcam.position === 'center' && webcam.size !== 'full' ? 'bg-hikari-500' : 'bg-hikari-700 hover:bg-hikari-600'}`}
                  title="Centre"
                >
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="3" strokeWidth={2} />
                  </svg>
                </button>
                <button
                  onClick={() => updateWebcamPosition('bottom-left')}
                  className={`rounded p-1 ${webcam.position === 'bottom-left' && webcam.size !== 'full' ? 'bg-hikari-500' : 'bg-hikari-700 hover:bg-hikari-600'}`}
                  title="Bas gauche"
                >
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7v10h10" />
                  </svg>
                </button>
                <button
                  onClick={() => updateWebcamPosition('bottom-right')}
                  className={`rounded p-1 ${webcam.position === 'bottom-right' && webcam.size !== 'full' ? 'bg-hikari-500' : 'bg-hikari-700 hover:bg-hikari-600'}`}
                  title="Bas droite"
                >
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7v10H7" />
                  </svg>
                </button>
                {/* Size buttons */}
                <div className="ml-1 flex gap-0.5 border-l border-hikari-600 pl-1">
                  <button
                    onClick={() => updateWebcamSize('small')}
                    className={`rounded px-1 py-0.5 text-[8px] text-white ${webcam.size === 'small' ? 'bg-hikari-500' : 'bg-hikari-700 hover:bg-hikari-600'}`}
                    title="Petit"
                  >
                    S
                  </button>
                  <button
                    onClick={() => updateWebcamSize('medium')}
                    className={`rounded px-1 py-0.5 text-[8px] text-white ${webcam.size === 'medium' ? 'bg-hikari-500' : 'bg-hikari-700 hover:bg-hikari-600'}`}
                    title="Moyen"
                  >
                    M
                  </button>
                  <button
                    onClick={() => updateWebcamSize('large')}
                    className={`rounded px-1 py-0.5 text-[8px] text-white ${webcam.size === 'large' ? 'bg-hikari-500' : 'bg-hikari-700 hover:bg-hikari-600'}`}
                    title="Grand"
                  >
                    L
                  </button>
                  <button
                    onClick={() => updateWebcamSize('full')}
                    className={`rounded px-1 py-0.5 text-[8px] text-white ${webcam.size === 'full' ? 'bg-hikari-500' : 'bg-hikari-700 hover:bg-hikari-600'}`}
                    title="Plein ecran"
                  >
                    F
                  </button>
                </div>
                {/* Hide button */}
                <button
                  onClick={toggleWebcam}
                  className="ml-1 rounded bg-red-600 p-1 hover:bg-red-500"
                  title="Masquer"
                >
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
              {/* Resize handle */}
              {webcam.size !== 'full' && (
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-hikari-500 opacity-70 hover:opacity-100"
                  style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
                  onMouseDown={handleWebcamResizeStart}
                  title="Redimensionner"
                />
              )}
            </div>
          )}

          {/* Phone PiP overlay */}
          {phone?.enabled && (
            <div
              className={`absolute ${getPositionClasses(phone.position, phone.size)} ${getPhoneSizeClasses(phone.size, phone.customSize)} overflow-hidden ${phone.size !== 'full' ? 'rounded-lg border-2 border-green-500 shadow-lg cursor-move' : ''} ${isPhoneCapturing ? 'opacity-100' : 'opacity-50'} ${isDraggingPhone || isResizingPhone ? 'ring-2 ring-green-400' : ''}`}
              style={{
                zIndex: phone.zIndex || 10,
                ...getPhoneSizeStyle(phone.size, phone.customSize),
                ...(phone.position === 'custom' ? getCustomPositionStyle(phone.customPosition) : {})
              }}
              onMouseDown={handlePhoneDragStart}
            >
              <video
                ref={phoneRef}
                className={phone.customSize ? "h-full w-full object-contain" : "h-auto w-auto max-h-full max-w-full"}
                muted
                playsInline
                autoPlay
              />
              {/* Loading indicator when not capturing yet */}
              {!isPhoneCapturing && (
                <div className="absolute inset-0 flex items-center justify-center bg-hikari-900">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-600 border-t-green-300" />
                </div>
              )}
              {/* Phone controls overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                {/* Position buttons */}
                <button
                  onClick={() => updatePhonePosition('top-left')}
                  className={`rounded p-1 ${phone.position === 'top-left' && phone.size !== 'full' ? 'bg-green-500' : 'bg-hikari-700 hover:bg-hikari-600'}`}
                  title="Haut gauche"
                >
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17V7h10" />
                  </svg>
                </button>
                <button
                  onClick={() => updatePhonePosition('top-right')}
                  className={`rounded p-1 ${phone.position === 'top-right' && phone.size !== 'full' ? 'bg-green-500' : 'bg-hikari-700 hover:bg-hikari-600'}`}
                  title="Haut droite"
                >
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17V7H7" />
                  </svg>
                </button>
                <button
                  onClick={() => updatePhonePosition('center')}
                  className={`rounded p-1 ${phone.position === 'center' && phone.size !== 'full' ? 'bg-green-500' : 'bg-hikari-700 hover:bg-hikari-600'}`}
                  title="Centre"
                >
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="3" strokeWidth={2} />
                  </svg>
                </button>
                <button
                  onClick={() => updatePhonePosition('bottom-left')}
                  className={`rounded p-1 ${phone.position === 'bottom-left' && phone.size !== 'full' ? 'bg-green-500' : 'bg-hikari-700 hover:bg-hikari-600'}`}
                  title="Bas gauche"
                >
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7v10h10" />
                  </svg>
                </button>
                <button
                  onClick={() => updatePhonePosition('bottom-right')}
                  className={`rounded p-1 ${phone.position === 'bottom-right' && phone.size !== 'full' ? 'bg-green-500' : 'bg-hikari-700 hover:bg-hikari-600'}`}
                  title="Bas droite"
                >
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7v10H7" />
                  </svg>
                </button>
                {/* Size buttons */}
                <div className="ml-1 flex gap-0.5 border-l border-hikari-600 pl-1">
                  <button
                    onClick={() => updatePhoneSize('small')}
                    className={`rounded px-1 py-0.5 text-[8px] text-white ${phone.size === 'small' ? 'bg-green-500' : 'bg-hikari-700 hover:bg-hikari-600'}`}
                    title="Petit"
                  >
                    S
                  </button>
                  <button
                    onClick={() => updatePhoneSize('medium')}
                    className={`rounded px-1 py-0.5 text-[8px] text-white ${phone.size === 'medium' ? 'bg-green-500' : 'bg-hikari-700 hover:bg-hikari-600'}`}
                    title="Moyen"
                  >
                    M
                  </button>
                  <button
                    onClick={() => updatePhoneSize('large')}
                    className={`rounded px-1 py-0.5 text-[8px] text-white ${phone.size === 'large' ? 'bg-green-500' : 'bg-hikari-700 hover:bg-hikari-600'}`}
                    title="Grand"
                  >
                    L
                  </button>
                  <button
                    onClick={() => updatePhoneSize('full')}
                    className={`rounded px-1 py-0.5 text-[8px] text-white ${phone.size === 'full' ? 'bg-green-500' : 'bg-hikari-700 hover:bg-hikari-600'}`}
                    title="Plein ecran"
                  >
                    F
                  </button>
                </div>
                {/* Hide button */}
                <button
                  onClick={togglePhone}
                  className="ml-1 rounded bg-red-600 p-1 hover:bg-red-500"
                  title="Masquer"
                >
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
              {/* Resize handle */}
              {phone.size !== 'full' && (
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-green-500 opacity-70 hover:opacity-100"
                  style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
                  onMouseDown={handlePhoneResizeStart}
                  title="Redimensionner"
                />
              )}
            </div>
          )}

          {/* Custom overlays (images, text, video, browser) */}
          {overlays.filter(o => o.enabled).map((overlay) => (
            <div
              key={overlay.id}
              className={`absolute ${getPositionClasses(overlay.position, overlay.size)} overflow-hidden ${
                overlay.size !== 'full' ? 'rounded-lg border-2 border-purple-500 shadow-lg cursor-move' : ''
              } ${draggingOverlayId === overlay.id || resizingOverlayId === overlay.id ? 'ring-2 ring-purple-400' : ''}`}
              style={{
                zIndex: overlay.zIndex || 30,
                opacity: overlay.opacity / 100,
                ...getOverlaySizeStyle(overlay),
                ...(overlay.position === 'custom' ? getCustomPositionStyle(overlay.customPosition) : {})
              }}
              onMouseDown={(e) => handleOverlayDragStart(overlay.id, e)}
            >
              {/* Image overlay */}
              {overlay.type === 'image' && (
                <img
                  src={(overlay as ImageOverlay).src}
                  alt={overlay.name}
                  className="h-full w-full"
                  style={{ objectFit: (overlay as ImageOverlay).fit }}
                  draggable={false}
                />
              )}

              {/* Text overlay */}
              {overlay.type === 'text' && (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{
                    fontFamily: (overlay as TextOverlay).fontFamily,
                    fontSize: `${(overlay as TextOverlay).fontSize}px`,
                    fontWeight: (overlay as TextOverlay).fontWeight,
                    color: (overlay as TextOverlay).color,
                    backgroundColor: (overlay as TextOverlay).backgroundColor,
                    textAlign: (overlay as TextOverlay).textAlign,
                    padding: `${(overlay as TextOverlay).padding}px`,
                    borderRadius: `${(overlay as TextOverlay).borderRadius}px`,
                    textShadow: (overlay as TextOverlay).shadow ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none'
                  }}
                >
                  {(overlay as TextOverlay).content}
                </div>
              )}

              {/* Video overlay */}
              {overlay.type === 'video' && (
                <video
                  src={(overlay as VideoOverlay).src}
                  className="h-full w-full object-contain"
                  loop={(overlay as VideoOverlay).loop}
                  muted={(overlay as VideoOverlay).muted}
                  autoPlay={(overlay as VideoOverlay).autoplay}
                  playsInline
                />
              )}

              {/* Browser overlay - placeholder for now */}
              {overlay.type === 'browser' && (
                <div className="flex h-full w-full items-center justify-center bg-hikari-800 text-hikari-400 text-xs">
                  <span>Widget: {overlay.name}</span>
                </div>
              )}

              {/* Overlay controls on hover */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleOverlay(overlay.id)
                  }}
                  className="rounded bg-red-600 p-1 hover:bg-red-500"
                  title="Masquer"
                >
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>

              {/* Resize handle for overlays */}
              {overlay.size !== 'full' && (
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-purple-500 opacity-70 hover:opacity-100"
                  style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
                  onMouseDown={(e) => handleOverlayResizeStart(overlay.id, e)}
                  title="Redimensionner"
                />
              )}
            </div>
          ))}

          {/* Source name badge */}
          {activeSource && (
            <div className="absolute left-3 top-3 rounded-md bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm">
              {activeSource.type === 'screen' ? 'Ecran' : 'Fenetre'}: {activeSource.name}
            </div>
          )}
          </div>
          {/* End transition wrapper */}

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
