import { useAppStore } from '../stores/appStore'

function TitleBar(): JSX.Element {
  const { appInfo, streamStatus } = useAppStore()

  const handleMinimize = (): void => {
    window.api.minimizeWindow()
  }

  const handleMaximize = (): void => {
    window.api.maximizeWindow()
  }

  const handleClose = (): void => {
    window.api.closeWindow()
  }

  const getStatusColor = (): string => {
    switch (streamStatus) {
      case 'live':
        return 'bg-live'
      case 'connecting':
        return 'bg-connecting'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-offline'
    }
  }

  const getStatusText = (): string => {
    switch (streamStatus) {
      case 'live':
        return 'EN DIRECT'
      case 'connecting':
        return 'Connexion...'
      case 'error':
        return 'Erreur'
      default:
        return 'Hors ligne'
    }
  }

  return (
    <header className="drag-region flex h-10 items-center justify-between bg-hikari-900 px-4">
      {/* App title & status */}
      <div className="no-drag flex items-center gap-3">
        <h1 className="text-sm font-semibold text-hikari-100">
          {appInfo.name || 'Hikari Stream'}
        </h1>
        <span className="text-xs text-hikari-400">v{appInfo.version || '0.1.0'}</span>

        {/* Stream status indicator */}
        <div className="flex items-center gap-2 rounded-full bg-hikari-800 px-3 py-1">
          <span
            className={`h-2 w-2 rounded-full ${getStatusColor()} ${streamStatus === 'live' ? 'animate-live-pulse' : ''}`}
          />
          <span className="text-xs font-medium text-hikari-200">{getStatusText()}</span>
        </div>
      </div>

      {/* Window controls */}
      <div className="no-drag flex items-center gap-1">
        <button
          onClick={handleMinimize}
          className="flex h-7 w-10 items-center justify-center rounded text-hikari-400 hover:bg-hikari-800 hover:text-white"
          title="Réduire"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button
          onClick={handleMaximize}
          className="flex h-7 w-10 items-center justify-center rounded text-hikari-400 hover:bg-hikari-800 hover:text-white"
          title="Agrandir"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
            />
          </svg>
        </button>
        <button
          onClick={handleClose}
          className="flex h-7 w-10 items-center justify-center rounded text-hikari-400 hover:bg-red-600 hover:text-white"
          title="Fermer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </header>
  )
}

export default TitleBar
