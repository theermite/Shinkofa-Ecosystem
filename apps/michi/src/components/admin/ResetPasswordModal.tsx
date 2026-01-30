/**
 * Reset Password Modal
 * Modal pour reset le mot de passe d'un utilisateur
 */

'use client'

import { useState } from 'react'

interface ResetPasswordModalProps {
  username: string
  hasEmail: boolean
  onClose: () => void
  onReset: (method: 'email' | 'temp') => Promise<{ temporary_password?: string }>
}

export default function ResetPasswordModal({
  username,
  hasEmail,
  onClose,
  onReset,
}: ResetPasswordModalProps) {
  const [method, setMethod] = useState<'email' | 'temp'>(hasEmail ? 'email' : 'temp')
  const [isLoading, setIsLoading] = useState(false)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleReset = async () => {
    setIsLoading(true)
    try {
      const result = await onReset(method)
      if (result.temporary_password) {
        setTempPassword(result.temporary_password)
      } else {
        onClose()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (tempPassword) {
      await navigator.clipboard.writeText(tempPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Show temp password result
  if (tempPassword) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>✅</span>
            Mot de passe temporaire
          </h2>

          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-300 mb-2">
              Nouveau mot de passe pour <strong>{username}</strong> :
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-white dark:bg-gray-700 rounded border font-mono text-lg">
                {tempPassword}
              </code>
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                {copied ? '✓' : 'Copier'}
              </button>
            </div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg mb-4">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Communiquez ce mot de passe de maniere securisee a l'utilisateur.
              Il devra le changer a sa prochaine connexion.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Fermer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>🔑</span>
          Reset mot de passe - {username}
        </h2>

        <div className="space-y-4 mb-6">
          {/* Email option */}
          <label
            className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
              method === 'email'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            } ${!hasEmail ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="method"
                value="email"
                checked={method === 'email'}
                onChange={() => setMethod('email')}
                disabled={!hasEmail}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <span>📧</span> Envoyer email de reset
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  L'utilisateur recevra un lien pour choisir un nouveau mot de passe
                </p>
                {!hasEmail && (
                  <p className="text-sm text-red-500 mt-1">
                    Cet utilisateur n'a pas d'email
                  </p>
                )}
              </div>
            </div>
          </label>

          {/* Temp password option */}
          <label
            className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
              method === 'temp'
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="method"
                value="temp"
                checked={method === 'temp'}
                onChange={() => setMethod('temp')}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <span>🔐</span> Generer mot de passe temporaire
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Un mot de passe sera genere et affiche. Vous devrez le communiquer manuellement.
                </p>
              </div>
            </div>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Annuler
          </button>
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'En cours...' : 'Reset'}
          </button>
        </div>
      </div>
    </div>
  )
}
