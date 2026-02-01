import { useState, useEffect, useRef } from 'react'
import { useAppStore, WebcamSource } from '../stores/appStore'

interface WebcamSelectorProps {
  isOpen: boolean
  onClose: () => void
}

function WebcamSelector({ isOpen, onClose }: WebcamSelectorProps): JSX.Element | null {
  const { availableWebcams, setAvailableWebcams, setWebcam, webcam } = useAppStore()
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(webcam?.deviceId || null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null)
  const previewRef = useRef<HTMLVideoElement>(null)

  // Detect available webcams
  useEffect(() => {
    if (!isOpen) return

    const detectWebcams = async (): Promise<void> => {
      setIsLoading(true)
      setError(null)

      try {
        // Request camera permission first (needed to get device labels)
        await navigator.mediaDevices.getUserMedia({ video: true })
          .then(stream => {
            // Stop the stream immediately, we just needed permission
            stream.getTracks().forEach(track => track.stop())
          })

        // Now enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === 'videoinput')

        console.log('[WebcamSelector] Detected webcams:', videoDevices)
        setAvailableWebcams(videoDevices)

        if (videoDevices.length === 0) {
          setError('Aucune webcam detectee')
        } else if (!selectedDeviceId && videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId)
        }
      } catch (err) {
        console.error('[WebcamSelector] Failed to detect webcams:', err)
        setError('Impossible de detecter les webcams. Verifiez les permissions.')
      } finally {
        setIsLoading(false)
      }
    }

    detectWebcams()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, setAvailableWebcams])

  // Start preview when a device is selected
  useEffect(() => {
    if (!selectedDeviceId || !isOpen) {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop())
        setPreviewStream(null)
      }
      return
    }

    const startPreview = async (): Promise<void> => {
      try {
        // Stop any existing preview
        if (previewStream) {
          previewStream.getTracks().forEach(track => track.stop())
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: selectedDeviceId },
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        })

        setPreviewStream(stream)

        if (previewRef.current) {
          previewRef.current.srcObject = stream
          previewRef.current.play()
        }
      } catch (err) {
        console.error('[WebcamSelector] Failed to start preview:', err)
      }
    }

    startPreview()

    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop())
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeviceId, isOpen])

  // Cleanup on close
  useEffect(() => {
    if (!isOpen && previewStream) {
      previewStream.getTracks().forEach(track => track.stop())
      setPreviewStream(null)
    }
  }, [isOpen, previewStream])

  const handleSelect = (): void => {
    if (!selectedDeviceId) return

    const selectedDevice = availableWebcams.find(d => d.deviceId === selectedDeviceId)
    if (!selectedDevice) return

    const newWebcam: WebcamSource = {
      id: `webcam-${Date.now()}`,
      deviceId: selectedDeviceId,
      label: selectedDevice.label || 'Webcam',
      enabled: true,
      position: 'bottom-right',
      size: 'medium',
      zIndex: 20 // Default layer (higher = on top of phone)
    }

    console.log('[WebcamSelector] Selected webcam:', newWebcam)
    setWebcam(newWebcam)

    // Clean up preview stream before closing
    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop())
      setPreviewStream(null)
    }

    onClose()
  }

  const handleDisconnect = (): void => {
    setWebcam(null)
    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop())
      setPreviewStream(null)
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-hikari-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Selectionner une webcam</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-hikari-400 hover:bg-hikari-800 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-hikari-600 border-t-hikari-300" />
            <p className="text-hikari-400">Detection des webcams...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-900/30 p-4 text-center text-red-400">
            {error}
          </div>
        ) : (
          <>
            {/* Preview */}
            <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-black">
              <video
                ref={previewRef}
                className="h-full w-full object-cover"
                muted
                playsInline
                autoPlay
              />
            </div>

            {/* Webcam list */}
            <div className="mb-4 space-y-2">
              <label className="text-sm text-hikari-400">Webcam</label>
              <select
                value={selectedDeviceId || ''}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full rounded-lg border border-hikari-700 bg-hikari-800 px-4 py-2 text-white focus:border-hikari-500 focus:outline-none"
              >
                {availableWebcams.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Webcam ${device.deviceId.slice(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {webcam && (
            <button
              onClick={handleDisconnect}
              className="flex-1 rounded-lg border border-red-600 px-4 py-2 text-red-400 hover:bg-red-900/30"
            >
              Deconnecter
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-hikari-700 px-4 py-2 text-hikari-300 hover:bg-hikari-800"
          >
            Annuler
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedDeviceId || isLoading}
            className="flex-1 rounded-lg bg-hikari-600 px-4 py-2 text-white hover:bg-hikari-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Utiliser
          </button>
        </div>
      </div>
    </div>
  )
}

export default WebcamSelector
