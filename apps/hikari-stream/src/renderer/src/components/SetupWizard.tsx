import { useState, useEffect, useCallback } from 'react'

interface SetupWizardProps {
  onComplete: () => void
}

interface DownloadProgress {
  ffmpeg: number
  scrcpy: number
}

function SetupWizard({ onComplete }: SetupWizardProps): JSX.Element {
  const [step, setStep] = useState<'checking' | 'downloading' | 'complete'>('checking')
  const [status, setStatus] = useState({
    ffmpeg: { installed: false, downloading: false, error: false },
    scrcpy: { installed: false, downloading: false, error: false }
  })
  const [progress, setProgress] = useState<DownloadProgress>({ ffmpeg: 0, scrcpy: 0 })

  const checkDependencies = useCallback(async (): Promise<void> => {
    try {
      const depsStatus = await window.api.checkDepsStatus()

      setStatus({
        ffmpeg: { installed: depsStatus.ffmpeg.installed, downloading: false, error: false },
        scrcpy: { installed: depsStatus.scrcpy.installed, downloading: false, error: false }
      })

      if (depsStatus.ffmpeg.installed && depsStatus.scrcpy.installed) {
        setStep('complete')
        setTimeout(onComplete, 1000)
      } else {
        setStep('downloading')
      }
    } catch (error) {
      console.error('Failed to check dependencies:', error)
    }
  }, [onComplete])

  useEffect(() => {
    checkDependencies()

    // Listen for download progress
    const cleanup = window.api.on('deps:progress', (data: unknown) => {
      const { type, percent } = data as { type: 'ffmpeg' | 'scrcpy'; percent: number }
      setProgress((prev) => ({ ...prev, [type]: percent }))
    })

    return cleanup
  }, [checkDependencies])


  const downloadDependencies = async (): Promise<void> => {
    // Download FFmpeg if needed
    if (!status.ffmpeg.installed) {
      setStatus((prev) => ({
        ...prev,
        ffmpeg: { ...prev.ffmpeg, downloading: true }
      }))

      const ffmpegSuccess = await window.api.downloadFFmpeg()

      setStatus((prev) => ({
        ...prev,
        ffmpeg: { installed: ffmpegSuccess, downloading: false, error: !ffmpegSuccess }
      }))
    }

    // Download scrcpy if needed
    if (!status.scrcpy.installed) {
      setStatus((prev) => ({
        ...prev,
        scrcpy: { ...prev.scrcpy, downloading: true }
      }))

      const scrcpySuccess = await window.api.downloadScrcpy()

      setStatus((prev) => ({
        ...prev,
        scrcpy: { installed: scrcpySuccess, downloading: false, error: !scrcpySuccess }
      }))
    }

    // Check if all done
    const finalStatus = await window.api.checkDepsStatus()
    if (finalStatus.ffmpeg.installed && finalStatus.scrcpy.installed) {
      setStep('complete')
      setTimeout(onComplete, 1500)
    }
  }

  const renderStepContent = (): JSX.Element => {
    switch (step) {
      case 'checking':
        return (
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-hikari-500 border-t-transparent mx-auto" />
            <p className="text-hikari-300">Vérification des composants...</p>
          </div>
        )

      case 'downloading':
        return (
          <div className="space-y-6">
            <p className="text-center text-hikari-300 mb-6">
              Hikari Stream a besoin de télécharger quelques composants pour fonctionner.
            </p>

            {/* FFmpeg */}
            <DependencyItem
              name="FFmpeg"
              description="Capture et encodage vidéo"
              installed={status.ffmpeg.installed}
              downloading={status.ffmpeg.downloading}
              error={status.ffmpeg.error}
              progress={progress.ffmpeg}
            />

            {/* scrcpy */}
            <DependencyItem
              name="scrcpy"
              description="Cast mobile Android"
              installed={status.scrcpy.installed}
              downloading={status.scrcpy.downloading}
              error={status.scrcpy.error}
              progress={progress.scrcpy}
            />

            {/* Download button */}
            {!status.ffmpeg.downloading && !status.scrcpy.downloading && (
              <button
                onClick={downloadDependencies}
                className="btn-primary w-full mt-6"
                disabled={status.ffmpeg.installed && status.scrcpy.installed}
              >
                Télécharger les composants manquants
              </button>
            )}
          </div>
        )

      case 'complete':
        return (
          <div className="text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-600 mx-auto">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-medium text-white">Configuration terminée !</p>
            <p className="text-hikari-400 mt-2">Hikari Stream est prêt à être utilisé.</p>
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-hikari-950 z-50">
      <div className="w-full max-w-md rounded-2xl bg-hikari-900 p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white">Bienvenue sur Hikari Stream</h1>
          <p className="text-hikari-400 mt-2">Configuration initiale</p>
        </div>

        {renderStepContent()}
      </div>
    </div>
  )
}

function DependencyItem({
  name,
  description,
  installed,
  downloading,
  error,
  progress
}: {
  name: string
  description: string
  installed: boolean
  downloading: boolean
  error: boolean
  progress: number
}): JSX.Element {
  return (
    <div className="rounded-lg bg-hikari-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-medium text-white">{name}</h3>
          <p className="text-sm text-hikari-400">{description}</p>
        </div>
        <StatusIcon installed={installed} downloading={downloading} error={error} />
      </div>

      {downloading && (
        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-hikari-700">
            <div
              className="h-full bg-hikari-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-hikari-400 mt-1 text-right">{progress}%</p>
        </div>
      )}
    </div>
  )
}

function StatusIcon({
  installed,
  downloading,
  error
}: {
  installed: boolean
  downloading: boolean
  error: boolean
}): JSX.Element {
  if (error) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600">
        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    )
  }

  if (downloading) {
    return (
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-hikari-500 border-t-transparent" />
    )
  }

  if (installed) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600">
        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    )
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-hikari-700">
      <svg className="h-4 w-4 text-hikari-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
    </div>
  )
}

export default SetupWizard
