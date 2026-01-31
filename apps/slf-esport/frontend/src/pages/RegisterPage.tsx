/**
 * Register Page
 */

import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button, Input, Card } from '@/components/ui'
import { UserRole } from '@/types/user'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, error, isLoading, clearError } = useAuthStore()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: UserRole.JOUEUR,
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (formData.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères'
    }

    if (!/(?=.*[A-Z])/.test(formData.password)) {
      errors.password = 'Le mot de passe doit contenir au moins une majuscule'
    }

    if (!/(?=.*\d)/.test(formData.password)) {
      errors.password = 'Le mot de passe doit contenir au moins un chiffre'
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()

    if (!validateForm()) {
      return
    }

    try {
      const { confirmPassword, ...registerData } = formData
      await register(registerData)
      navigate('/dashboard')
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Clear field error when user types
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: '',
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            SLF E-Sport
          </h1>
          <p className="text-primary-200">
            Rejoindre La Salade de Fruits
          </p>
        </div>

        {/* Register Card */}
        <Card className="animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Créer un compte
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nom complet"
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Jean Dupont"
              required
            />

            <Input
              label="Nom d'utilisateur"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="jean_dupont"
              required
              autoComplete="username"
              helperText="Uniquement lettres, chiffres, tirets et underscores"
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="jean@example.com"
              required
              autoComplete="email"
            />

            <div>
              <label className="label">
                Rôle <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input"
                required
              >
                <option value={UserRole.JOUEUR}>Joueur</option>
                <option value={UserRole.COACH}>Coach</option>
                <option value={UserRole.MANAGER}>Manager</option>
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formData.role === UserRole.JOUEUR && 'Accès aux entraînements et exercices'}
                {formData.role === UserRole.COACH && 'Accès coach : suivi équipe, upload contenus'}
                {formData.role === UserRole.MANAGER && 'Accès complet : analytics, gestion équipe'}
              </p>
            </div>

            <Input
              label="Mot de passe"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              error={formErrors.password}
              helperText={!formErrors.password ? 'Min. 8 caractères, 1 majuscule, 1 chiffre' : undefined}
            />

            <Input
              label="Confirmer le mot de passe"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              error={formErrors.confirmPassword}
            />

            <div className="flex items-start">
              <input
                type="checkbox"
                required
                className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                J'accepte les{' '}
                <a href="/terms" className="text-primary-600 hover:text-primary-700">
                  conditions d'utilisation
                </a>{' '}
                et la{' '}
                <a href="/privacy" className="text-primary-600 hover:text-primary-700">
                  politique de confidentialité
                </a>
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              className="mt-6"
            >
              Créer mon compte
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Déjà un compte ?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </Card>

        <p className="mt-8 text-center text-sm text-primary-200">
          © 2024 La Voie Shinkofa - Tous droits réservés
        </p>
      </div>
    </div>
  )
}
