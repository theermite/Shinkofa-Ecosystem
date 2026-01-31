import { useEffect, useState } from 'react'

interface AndroidDevice {
  serial: string
  status: 'device' | 'offline' | 'unauthorized' | 'no permissions'
  model?: string
  product?: string
}

interface MobileSelectorProps {
  isOpen: boolean
  onClose: () => void
  onStartCast: (device: AndroidDevice) => void
}

function MobileSelector({ isOpen, onClose, onStartCast }: MobileSelectorProps): JSX.Element | null {
  const [devices, setDevices] = useState<AndroidDevice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isScrcpyRunning, setIsScrcpyRunning] = useState(false)
  const [currentDevice, setCurrentDevice] = useState<AndroidDevice | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadDevices()
      checkScrcpyStatus()
    }
  }, [isOpen])

  // Listen for scrcpy events
  useEffect(() => {
    const cleanupStarted = window.api.on('scrcpy:started', (device: unknown) => {
      setIsScrcpyRunning(true)
      setCurrentDevice(device as AndroidDevice)
    })

    const cleanupStopped = window.api.on('scrcpy:stopped', () => {
      setIsScrcpyRunning(false)
      setCurrentDevice(null)
    })

    const cleanupError = window.api.on('scrcpy:error', (message: unknown) => {
      setError(message as string)
      setIsScrcpyRunning(false)
    })

    return () => {
      cleanupStarted()
      cleanupStopped()
      cleanupError()
    }
  }, [])

  const loadDevices = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const deviceList = await window.api.listMobileDevices()
      setDevices(deviceList)

      if (deviceList.length === 0) {
        setError('Aucun appareil Android detecte. Verifiez que le debogage USB est active.')
      }
    } catch (err) {
      console.error('[MobileSelector] Failed to load devices:', err)
      setError('Erreur lors de la detection des appareils')
    } finally {
      setLoading(false)
    }
  }

  const checkScrcpyStatus = async (): Promise<void> => {
    const running = await window.api.isScrcpyRunning()
    setIsScrcpyRunning(running)
    if (running) {
      const device = await window.api.getScrcpyCurrentDevice()
      setCurrentDevice(device)
    }
  }

  const handleStartCast = async (device: AndroidDevice): Promise<void> => {
    setError(null)
    try {
      const defaults = await window.api.getScrcpyDefaults()
      const success = await window.api.startScrcpy({
        serial: device.serial,
        ...defaults
      })

      if (success) {
        onStartCast(device)
        onClose()
      } else {
        setError('Echec du demarrage de scrcpy')
      }
    } catch (err) {
      console.error('[MobileSelector] Failed to start cast:', err)
      setError('Erreur lors du demarrage du cast')
    }
  }

  const handleStopCast = (): void => {
    window.api.stopScrcpy()
  }

  const getStatusColor = (status: AndroidDevice['status']): string => {
    switch (status) {
      case 'device':
        return 'bg-green-500'
      case 'offline':
        return 'bg-gray-500'
      case 'unauthorized':
        return 'bg-yellow-500'
      default:
        return 'bg-red-500'
    }
  }

  const getStatusText = (status: AndroidDevice['status']): string => {
    switch (status) {
      case 'device':
        return 'Connecte'
      case 'offline':
        return 'Hors ligne'
      case 'unauthorized':
        return 'Non autorise - Acceptez sur le telephone'
      case 'no permissions':
        return 'Permissions manquantes'
      default:
        return status
    }
  }

  const getDeviceName = (device: AndroidDevice): string => {
    if (device.model) {
      return device.model.replace(/_/g, ' ')
    }
    return device.serial
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-hikari-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hikari-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-hikari-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <h2 className="text-lg font-semibold text-white">Cast Mobile</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-hikari-400 transition-colors hover:bg-hikari-800 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current cast info */}
          {isScrcpyRunning && currentDevice && (
            <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
                  <div>
                    <p className="font-medium text-green-400">Cast en cours</p>
                    <p className="text-sm text-green-300/70">{getDeviceName(currentDevice)}</p>
                  </div>
                </div>
                <button
                  onClick={handleStopCast}
                  className="rounded-lg bg-red-500/20 px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-500/30"
                >
                  Arreter
                </button>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Instructions */}
          <div className="mb-4 rounded-lg bg-hikari-800/50 p-3 text-sm text-hikari-300">
            <p className="font-medium text-hikari-200">Pour caster votre telephone :</p>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-hikari-400">
              <li>Activez le debogage USB dans les options developpeur</li>
              <li>Connectez votre telephone via USB</li>
              <li>Acceptez la demande d'autorisation sur votre telephone</li>
            </ol>
          </div>

          {/* Device list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-hikari-300">Appareils detectes</h3>
              <button
                onClick={loadDevices}
                disabled={loading}
                className="rounded-lg px-3 py-1 text-sm text-hikari-400 transition-colors hover:bg-hikari-800 hover:text-white disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Recherche...
                  </span>
                ) : (
                  'Actualiser'
                )}
              </button>
            </div>

            {devices.length === 0 && !loading ? (
              <div className="py-8 text-center text-hikari-500">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-3">Aucun appareil detecte</p>
              </div>
            ) : (
              <div className="space-y-2">
                {devices.map((device) => (
                  <div
                    key={device.serial}
                    className="flex items-center justify-between rounded-lg border border-hikari-700 bg-hikari-800 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${getStatusColor(device.status)}`}
                        title={getStatusText(device.status)}
                      />
                      <div>
                        <p className="font-medium text-hikari-200">{getDeviceName(device)}</p>
                        <p className="text-xs text-hikari-500">{device.serial}</p>
                      </div>
                    </div>
                    {device.status === 'device' && !isScrcpyRunning && (
                      <button
                        onClick={() => handleStartCast(device)}
                        className="rounded-lg bg-hikari-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-hikari-500"
                      >
                        Caster
                      </button>
                    )}
                    {device.status === 'unauthorized' && (
                      <span className="text-xs text-yellow-500">Autorisez sur le tel</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-hikari-800 px-6 py-4">
          <button onClick={onClose} className="btn-secondary">
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

export default MobileSelector
