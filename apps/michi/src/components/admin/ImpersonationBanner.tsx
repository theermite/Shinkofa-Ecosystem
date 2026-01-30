/**
 * Impersonation Banner
 * Bannière affichée quand un admin impersonne un utilisateur
 */

'use client'

interface ImpersonationBannerProps {
  impersonatedUsername: string
  onStopImpersonation: () => void
}

export default function ImpersonationBanner({
  impersonatedUsername,
  onStopImpersonation,
}: ImpersonationBannerProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white py-2 px-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">👤</span>
          <div>
            <span className="font-semibold">Mode Impersonation</span>
            <span className="mx-2">-</span>
            <span>
              Vous voyez l'application comme{' '}
              <strong className="bg-white/20 px-2 py-0.5 rounded">
                {impersonatedUsername}
              </strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm opacity-75 hidden sm:inline">
            Les modifications ne sont pas sauvegardées
          </span>
          <button
            onClick={onStopImpersonation}
            className="flex items-center gap-2 px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium"
          >
            <span>Arreter</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
