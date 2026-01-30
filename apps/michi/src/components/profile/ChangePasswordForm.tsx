'use client'

import { useState } from 'react'
import { getAccessToken } from '@/contexts/AuthContext'
import { useTranslations } from 'next-intl'

interface ChangePasswordFormProps {
  onUpdate: () => void
}

export function ChangePasswordForm({ onUpdate }: ChangePasswordFormProps) {
  const t = useTranslations('profile.changePassword')
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPasswords, setShowPasswords] = useState(false)

  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    // Validation
    if (formData.new_password !== formData.confirm_password) {
      setError(t('errorMismatch'))
      setIsSaving(false)
      return
    }

    if (formData.new_password.length < 8) {
      setError(t('errorTooShort'))
      setIsSaving(false)
      return
    }

    try {
      const token = getAccessToken()
      if (!token) {
        throw new Error(t('errorNotAuth'))
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/users/me/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: formData.current_password,
          new_password: formData.new_password,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || t('errorGeneric'))
      }

      setSuccess(`✅ ${t('successMessage')}`)
      setFormData({ current_password: '', new_password: '', confirm_password: '' })
      setTimeout(() => {
        setIsOpen(false)
        setSuccess(null)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorGeneric'))
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">🔒 {t('securityTitle')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('securityDesc')}
            </p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            {t('changeButton')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">🔒 {t('changeTitle')}</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-green-800 dark:text-green-200">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('currentPasswordLabel')}
          </label>
          <div className="relative">
            <input
              type={showPasswords ? 'text' : 'password'}
              id="current_password"
              value={formData.current_password}
              onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('newPasswordLabel')}
          </label>
          <input
            type={showPasswords ? 'text' : 'password'}
            id="new_password"
            value={formData.new_password}
            onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
            required
            minLength={8}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-100"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('confirmPasswordLabel')}
          </label>
          <input
            type={showPasswords ? 'text' : 'password'}
            id="confirm_password"
            value={formData.confirm_password}
            onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
            required
            minLength={8}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-100"
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="show_passwords"
            checked={showPasswords}
            onChange={(e) => setShowPasswords(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="show_passwords" className="text-sm text-gray-600 dark:text-gray-400">
            {t('showPasswordsLabel')}
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? t('submittingButton') : `🔐 ${t('submitButton')}`}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              setError(null)
              setSuccess(null)
              setFormData({ current_password: '', new_password: '', confirm_password: '' })
            }}
            className="px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          >
            {t('cancelButton')}
          </button>
        </div>
      </form>
    </div>
  )
}
