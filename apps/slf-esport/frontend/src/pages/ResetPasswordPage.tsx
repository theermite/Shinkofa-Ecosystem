/**
 * Reset Password Page - Validate token and set new password
 */

import { useState, useEffect, FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import api from '@/services/api'

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [resetSuccess, setResetSuccess] = useState(false)

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setMessage({ type: 'error', text: 'Token de réinitialisation manquant' })
        setIsVerifying(false)
        return
      }

      try {
        await api.get(`/password-reset/verify/${token}`)
        setTokenValid(true)
      } catch (error: any) {
        setMessage({
          type: 'error',
          text: error.response?.data?.detail || 'Token invalide ou expiré'
        })
        setTokenValid(false)
      } finally {
        setIsVerifying(false)
      }
    }

    verifyToken()
  }, [token])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' })
      return
    }

    // Validate password strength
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères' })
      return
    }

    if (!/\d/.test(newPassword)) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 1 chiffre' })
      return
    }

    if (!/[A-Z]/.test(newPassword)) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 1 majuscule' })
      return
    }

    setIsLoading(true)

    try {
      await api.post('/password-reset/confirm', {
        token,
        new_password: newPassword
      })

      setResetSuccess(true)
      setMessage({
        type: 'success',
        text: 'Votre mot de passe a été réinitialisé avec succès !'
      })

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Erreur lors de la réinitialisation du mot de passe'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Vérification du lien...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              tokenValid
                ? 'bg-primary-100 dark:bg-primary-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
            }`}>
              <span className="text-3xl">{tokenValid ? '🔐' : '❌'}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {tokenValid ? 'Nouveau mot de passe' : 'Lien invalide'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {tokenValid
                ? 'Choisissez un nouveau mot de passe sécurisé pour votre compte.'
                : 'Ce lien de réinitialisation est invalide ou a expiré.'}
            </p>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
              }`}
            >
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          {tokenValid && !resetSuccess ? (
            /* Form */
            <>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 text-sm text-blue-600 dark:text-blue-400">
                <p className="font-medium">Exigences du mot de passe :</p>
                <ul className="mt-2 space-y-1">
                  <li>• Au moins 8 caractères</li>
                  <li>• Au moins 1 chiffre</li>
                  <li>• Au moins 1 lettre majuscule</li>
                </ul>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Nouveau mot de passe"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />

                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                >
                  Réinitialiser le mot de passe
                </Button>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                  >
                    ← Retour à la connexion
                  </Link>
                </div>
              </form>
            </>
          ) : resetSuccess ? (
            /* Success State */
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <span className="text-4xl">✅</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                Mot de passe réinitialisé !
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Vous allez être redirigé vers la page de connexion...
              </p>
              <div className="pt-4">
                <Link to="/login">
                  <Button variant="primary" fullWidth>
                    Se connecter maintenant
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Invalid Token State */
            <div className="text-center space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Ce lien a peut-être déjà été utilisé ou est expiré.
              </p>
              <Link to="/forgot-password">
                <Button variant="primary" fullWidth>
                  Demander un nouveau lien
                </Button>
              </Link>
              <Link
                to="/login"
                className="block text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                ← Retour à la connexion
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          © 2025 SLF Esport - La Salade de Fruits
        </p>
      </div>
    </div>
  )
}
