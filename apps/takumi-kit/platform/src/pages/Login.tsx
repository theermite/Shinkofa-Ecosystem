/**
 * Login Page - Simple password authentication
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import ThemeToggle from '@/components/ThemeToggle'
import api from '@/lib/api'

export default function Login() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { access_token } = await api.login(password)
      login(access_token)
      navigate('/')
    } catch {
      setError('Invalid password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ermite-bg dark:bg-ermite-bg light:bg-gray-50 flex items-center justify-center p-4">
      {/* Theme toggle in corner */}
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/Logo The Ermite.png"
            alt="The Ermite"
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 object-contain"
          />
          <h1 className="text-xl sm:text-2xl font-bold text-ermite-text dark:text-ermite-text light:text-gray-900">The Ermite</h1>
          <p className="text-ermite-text-secondary dark:text-ermite-text-secondary light:text-gray-700 mt-2 text-sm sm:text-base">Control Center</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-ermite-card dark:bg-ermite-card light:bg-white rounded-xl p-6 sm:p-8 border border-ermite-border dark:border-ermite-border light:border-gray-200"
        >
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-ermite-text dark:text-ermite-text light:text-gray-900 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-ermite-bg-secondary dark:bg-ermite-bg-secondary light:bg-gray-50 border border-ermite-border dark:border-ermite-border light:border-gray-200 rounded-lg text-ermite-text dark:text-ermite-text light:text-gray-900 placeholder-ermite-text-secondary dark:placeholder-ermite-text-secondary light:placeholder-gray-400 focus:border-ermite-primary focus:outline-none transition-colors"
                placeholder="Enter your password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ermite-text-secondary dark:text-ermite-text-secondary light:text-gray-700 hover:text-ermite-text dark:hover:text-ermite-text light:hover:text-gray-600 transition-colors touch-manipulation p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-ermite-error/20 border border-ermite-error/50 rounded-lg text-ermite-error text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-ermite-primary hover:bg-ermite-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 touch-manipulation"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <p className="text-center text-ermite-text-secondary dark:text-ermite-text-secondary light:text-gray-700 text-sm mt-6">
          Personal dashboard for widget management
        </p>
      </div>
    </div>
  )
}
