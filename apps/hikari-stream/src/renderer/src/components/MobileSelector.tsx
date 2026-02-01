import { useEffect, useState } from 'react'
import { useAppStore, SavedDevice } from '../stores/appStore'

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

type ConnectionMode = 'usb' | 'wifi'

function MobileSelector({ isOpen, onClose, onStartCast }: MobileSelectorProps): JSX.Element | null {
  const { savedDevices, saveDevice, updateSavedDevice, removeSavedDevice } = useAppStore()
  const [devices, setDevices] = useState<AndroidDevice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isScrcpyRunning, setIsScrcpyRunning] = useState(false)
  const [currentDevice, setCurrentDevice] = useState<AndroidDevice | null>(null)
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('usb')

  // WiFi specific state
  const [wifiIp, setWifiIp] = useState('')
  const [wifiConnecting, setWifiConnecting] = useState(false)
  const [preparingWifi, setPreparingWifi] = useState(false)
  const [detectedIp, setDetectedIp] = useState<string | null>(null)

  // Renaming state
  const [renamingSerial, setRenamingSerial] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

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

      if (deviceList.length === 0 && connectionMode === 'usb') {
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

  // Prepare device for WiFi (enable tcpip and get IP)
  const handlePrepareWifi = async (device: AndroidDevice): Promise<void> => {
    setPreparingWifi(true)
    setError(null)
    try {
      // Enable tcpip mode
      const tcpipSuccess = await window.api.enableScrcpyTcpip(device.serial)
      if (!tcpipSuccess) {
        setError('Echec de l\'activation du mode WiFi')
        return
      }

      // Get device IP
      const ip = await window.api.getScrcpyDeviceIp(device.serial)
      if (ip) {
        setDetectedIp(ip)
        setWifiIp(ip)
        setConnectionMode('wifi')
        setError(null)

        // Save device info for future WiFi reconnection
        saveDevice({
          serial: device.serial,
          model: device.model || 'Unknown',
          wifiIp: ip,
          wifiPort: 5555
        })
      } else {
        setError('Impossible de detecter l\'adresse IP du telephone. Verifiez qu\'il est sur le meme reseau WiFi.')
      }
    } catch (err) {
      console.error('[MobileSelector] Failed to prepare WiFi:', err)
      setError('Erreur lors de la preparation WiFi')
    } finally {
      setPreparingWifi(false)
    }
  }

  // Start rename
  const handleStartRename = (device: AndroidDevice | SavedDevice): void => {
    const serial = device.serial
    const saved = savedDevices.find((d) => d.serial === serial)
    setRenamingSerial(serial)
    setRenameValue(saved?.customLabel || ('model' in device ? device.model || '' : ''))
  }

  // Save rename
  const handleSaveRename = (): void => {
    if (renamingSerial && renameValue.trim()) {
      const device = devices.find((d) => d.serial === renamingSerial)
      if (device) {
        // Save or update the device
        saveDevice({
          serial: device.serial,
          model: device.model || 'Unknown',
          customLabel: renameValue.trim()
        })
      } else {
        // Update existing saved device
        updateSavedDevice(renamingSerial, { customLabel: renameValue.trim() })
      }
    }
    setRenamingSerial(null)
    setRenameValue('')
  }

  // Connect via WiFi and start cast
  const handleWifiConnect = async (): Promise<void> => {
    if (!wifiIp.trim()) {
      setError('Entrez l\'adresse IP du telephone')
      return
    }

    setWifiConnecting(true)
    setError(null)

    try {
      // Connect via adb
      const connected = await window.api.connectScrcpyWifi(wifiIp.trim())
      if (!connected) {
        setError('Impossible de se connecter. Verifiez l\'adresse IP et que le telephone est sur le meme reseau.')
        return
      }

      // Start scrcpy with tcpip option
      const defaults = await window.api.getScrcpyDefaults()
      const success = await window.api.startScrcpy({
        tcpip: wifiIp.trim(),
        ...defaults
      })

      if (success) {
        onStartCast({
          serial: `${wifiIp.trim()}:5555`,
          status: 'device',
          model: 'WiFi Device'
        })
        onClose()
      } else {
        setError('Connexion etablie mais echec du demarrage de scrcpy')
      }
    } catch (err) {
      console.error('[MobileSelector] WiFi connect failed:', err)
      setError('Erreur de connexion WiFi')
    } finally {
      setWifiConnecting(false)
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
    // Check for saved custom label first
    const saved = savedDevices.find((d) => d.serial === device.serial)
    if (saved?.customLabel) {
      return saved.customLabel
    }
    if (device.model) {
      return device.model.replace(/_/g, ' ')
    }
    return device.serial
  }

  // Get saved device by original serial (for WiFi devices)
  const getSavedDeviceForWifi = (ip: string): SavedDevice | undefined => {
    return savedDevices.find((d) => d.wifiIp === ip)
  }

  // Check if device is connected via WiFi (serial is IP:port format)
  const isWifiDevice = (device: AndroidDevice): boolean => {
    return /^\d+\.\d+\.\d+\.\d+:\d+$/.test(device.serial)
  }

  // Get connection type badge
  const getConnectionType = (device: AndroidDevice): 'usb' | 'wifi' => {
    return isWifiDevice(device) ? 'wifi' : 'usb'
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-hikari-800">
          <button
            onClick={() => setConnectionMode('usb')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              connectionMode === 'usb'
                ? 'border-b-2 border-hikari-500 text-hikari-300'
                : 'text-hikari-500 hover:text-hikari-400'
            }`}
          >
            USB
          </button>
          <button
            onClick={() => setConnectionMode('wifi')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              connectionMode === 'wifi'
                ? 'border-b-2 border-hikari-500 text-hikari-300'
                : 'text-hikari-500 hover:text-hikari-400'
            }`}
          >
            WiFi
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

          {/* USB Mode */}
          {connectionMode === 'usb' && (
            <>
              {/* Instructions */}
              <div className="mb-4 rounded-lg bg-hikari-800/50 p-3 text-sm text-hikari-300">
                <p className="font-medium text-hikari-200">Pour caster via USB :</p>
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
                    {loading ? 'Recherche...' : 'Actualiser'}
                  </button>
                </div>

                {devices.length === 0 && !loading ? (
                  <div className="py-8 text-center text-hikari-500">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
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
                            {renamingSerial === device.serial ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={renameValue}
                                  onChange={(e) => setRenameValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveRename()
                                    if (e.key === 'Escape') setRenamingSerial(null)
                                  }}
                                  className="w-32 rounded bg-hikari-700 px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-hikari-500"
                                  autoFocus
                                />
                                <button
                                  onClick={handleSaveRename}
                                  className="text-green-400 hover:text-green-300"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => setRenamingSerial(null)}
                                  className="text-hikari-400 hover:text-white"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-hikari-200">{getDeviceName(device)}</p>
                                <button
                                  onClick={() => handleStartRename(device)}
                                  className="text-hikari-500 hover:text-hikari-300"
                                  title="Renommer"
                                >
                                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                  getConnectionType(device) === 'wifi'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-hikari-600/50 text-hikari-400'
                                }`}>
                                  {getConnectionType(device) === 'wifi' ? 'WiFi' : 'USB'}
                                </span>
                              </div>
                            )}
                            <p className="text-xs text-hikari-500">{device.serial}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {device.status === 'device' && !isScrcpyRunning && (
                            <>
                              {/* Only show WiFi button for USB devices */}
                              {!isWifiDevice(device) && (
                                <button
                                  onClick={() => handlePrepareWifi(device)}
                                  disabled={preparingWifi}
                                  className="rounded-lg bg-hikari-700 px-2 py-1.5 text-xs text-hikari-300 transition-colors hover:bg-hikari-600 disabled:opacity-50"
                                  title="Preparer pour WiFi"
                                >
                                  {preparingWifi ? '...' : 'WiFi'}
                                </button>
                              )}
                              <button
                                onClick={() => handleStartCast(device)}
                                className="rounded-lg bg-hikari-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-hikari-500"
                              >
                                Caster
                              </button>
                            </>
                          )}
                          {device.status === 'unauthorized' && (
                            <span className="text-xs text-yellow-500">Autorisez sur le tel</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* WiFi Mode */}
          {connectionMode === 'wifi' && (
            <>
              {/* Instructions */}
              <div className="mb-4 rounded-lg bg-hikari-800/50 p-3 text-sm text-hikari-300">
                <p className="font-medium text-hikari-200">Pour caster via WiFi :</p>
                <ol className="mt-2 list-inside list-decimal space-y-1 text-hikari-400">
                  <li>Connectez d'abord en USB et cliquez sur "WiFi" pour preparer</li>
                  <li>Ou entrez l'adresse IP de votre telephone</li>
                  <li>Votre telephone et PC doivent etre sur le meme reseau</li>
                </ol>
              </div>

              {/* Saved devices with WiFi */}
              {savedDevices.filter(d => d.wifiIp).length > 0 && (
                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-medium text-hikari-300">Appareils sauvegardes</h3>
                  <div className="space-y-2">
                    {savedDevices.filter(d => d.wifiIp).map((device) => (
                      <div
                        key={device.serial}
                        className="flex items-center justify-between rounded-lg border border-hikari-700 bg-hikari-800/50 p-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400">📱</span>
                          <div>
                            <p className="text-sm font-medium text-hikari-200">
                              {device.customLabel || device.model}
                            </p>
                            <p className="text-xs text-hikari-500 font-mono">{device.wifiIp}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setWifiIp(device.wifiIp || '')
                              handleWifiConnect()
                            }}
                            disabled={isScrcpyRunning || wifiConnecting}
                            className="rounded bg-hikari-600 px-2 py-1 text-xs text-white hover:bg-hikari-500 disabled:opacity-50"
                          >
                            Connecter
                          </button>
                          <button
                            onClick={() => removeSavedDevice(device.serial)}
                            className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-400 hover:bg-red-500/30"
                            title="Supprimer"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detected IP */}
              {detectedIp && (
                <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                  <p className="text-sm text-green-400">
                    IP detectee : <span className="font-mono font-bold">{detectedIp}</span>
                  </p>
                  <p className="mt-1 text-xs text-green-300/70">
                    Vous pouvez maintenant debrancher le cable USB
                  </p>
                </div>
              )}

              {/* IP Input */}
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-hikari-300">
                    Adresse IP du telephone
                  </label>
                  <input
                    type="text"
                    value={wifiIp}
                    onChange={(e) => setWifiIp(e.target.value)}
                    placeholder="192.168.1.100"
                    className="w-full rounded-lg border border-hikari-700 bg-hikari-800 px-4 py-2 text-white placeholder-hikari-500 focus:border-hikari-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleWifiConnect}
                  disabled={wifiConnecting || !wifiIp.trim() || isScrcpyRunning}
                  className="w-full rounded-lg bg-hikari-600 px-4 py-2 font-medium text-white transition-colors hover:bg-hikari-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {wifiConnecting ? 'Connexion...' : 'Connecter en WiFi'}
                </button>
              </div>
            </>
          )}
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
