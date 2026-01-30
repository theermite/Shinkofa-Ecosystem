'use client'

import { useState, useEffect, useRef } from 'react'
import type { User } from '@/types/auth'
import { useTheme } from '@/hooks/useTheme'
import { useAuth, getAccessToken } from '@/contexts/AuthContext'
import { AvatarCropModal } from './AvatarCropModal'
import { useTranslations } from 'next-intl'

interface EditProfileFormProps {
  user: User
  onUpdate: () => void
}

export function EditProfileForm({ user, onUpdate }: EditProfileFormProps) {
  const t = useTranslations('profile.editForm')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { setTheme } = useTheme()
  const { refreshUser } = useAuth()

  const [formData, setFormData] = useState({
    // Account
    username: user.username || '',
    // Profile
    first_name: user.profile?.first_name || '',
    last_name: user.profile?.last_name || '',
    birth_date: user.profile?.birth_date || '',
    avatar_url: user.profile?.avatar_url || '',
    // Preferences
    theme: user.preferences?.theme || 'dark',
    pomodoro_focus_duration: user.preferences?.pomodoro_settings?.focus_duration || 45,
    pomodoro_short_break: user.preferences?.pomodoro_settings?.short_break_duration || 10,
    pomodoro_long_break: user.preferences?.pomodoro_settings?.long_break_duration || 30,
    pomodoro_cycles: user.preferences?.pomodoro_settings?.cycles_before_long_break || 2,
  })

  // Preview for avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // Crop modal states
  const [showCropModal, setShowCropModal] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)

  // Update form data when user prop changes
  useEffect(() => {
    setFormData({
      username: user.username || '',
      first_name: user.profile?.first_name || '',
      last_name: user.profile?.last_name || '',
      birth_date: user.profile?.birth_date || '',
      avatar_url: user.profile?.avatar_url || '',
      theme: user.preferences?.theme || 'dark',
      pomodoro_focus_duration: user.preferences?.pomodoro_settings?.focus_duration || 45,
      pomodoro_short_break: user.preferences?.pomodoro_settings?.short_break_duration || 10,
      pomodoro_long_break: user.preferences?.pomodoro_settings?.long_break_duration || 30,
      pomodoro_cycles: user.preferences?.pomodoro_settings?.cycles_before_long_break || 2,
    })
    setAvatarPreview(user.profile?.avatar_url || null)
  }, [user])

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError(t('errorImageSize'))
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError(t('errorImageType'))
        return
      }

      // Read file and show crop modal
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageToCrop(reader.result as string)
        setShowCropModal(true)
      }
      reader.readAsDataURL(file)
    }

    // Reset input so the same file can be selected again
    e.target.value = ''
  }

  const handleCropComplete = (croppedImageBlob: Blob) => {
    // Convert blob to File
    const croppedFile = new File([croppedImageBlob], 'avatar.jpg', { type: 'image/jpeg' })
    setAvatarFile(croppedFile)

    // Create preview from blob
    const previewUrl = URL.createObjectURL(croppedImageBlob)
    setAvatarPreview(previewUrl)

    // Close modal
    setShowCropModal(false)
    setImageToCrop(null)
  }

  const handleCropCancel = () => {
    setShowCropModal(false)
    setImageToCrop(null)
  }

  const uploadAvatar = async (token: string): Promise<string | null> => {
    if (!avatarFile) return null

    const formData = new FormData()
    formData.append('file', avatarFile)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/users/me/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Erreur lors de l\'upload de l\'avatar')
      }

      const data = await response.json()
      return data.avatar_url
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de l\'upload de l\'avatar')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const token = getAccessToken()
      if (!token) {
        throw new Error(t('errorNotAuth'))
      }

      // Upload avatar first if a new file was selected
      let avatarUrl = formData.avatar_url
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar(token)
        if (uploadedUrl) {
          avatarUrl = uploadedUrl
        }
      }

      // Update profile data (excluding avatar since it was handled separately)
      // Only send fields that have values (filter out empty strings and null)
      const profileData: Record<string, any> = {}

      if (formData.username && formData.username.trim()) profileData.username = formData.username.trim()
      if (formData.first_name && formData.first_name.trim()) profileData.first_name = formData.first_name.trim()
      if (formData.last_name && formData.last_name.trim()) profileData.last_name = formData.last_name.trim()
      if (formData.birth_date && formData.birth_date.trim()) profileData.birth_date = formData.birth_date.trim()
      if (formData.theme) profileData.theme = formData.theme
      if (formData.pomodoro_focus_duration) profileData.pomodoro_focus_duration = formData.pomodoro_focus_duration
      if (formData.pomodoro_short_break) profileData.pomodoro_short_break = formData.pomodoro_short_break
      if (formData.pomodoro_long_break) profileData.pomodoro_long_break = formData.pomodoro_long_break
      if (formData.pomodoro_cycles) profileData.pomodoro_cycles = formData.pomodoro_cycles

      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Erreur lors de la mise à jour')
      }

      // Apply theme change immediately
      if (formData.theme === 'light' || formData.theme === 'dark') {
        setTheme(formData.theme)
      }

      // Refresh user data in global context
      await refreshUser()

      setSuccess(`✅ ${t('successMessage')}`)
      setIsEditing(false)
      setAvatarFile(null) // Reset avatar file after successful upload
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorUpdate'))
    } finally {
      setIsSaving(false)
    }
  }

  // Display mode (not editing)
  if (!isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">⚙️ {t('title')}</h2>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ✏️ {t('editButton')}
          </button>
        </div>

        {/* Profile Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - Avatar & Username */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  formData.username?.charAt(0).toUpperCase() || '?'
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('usernameLabel')}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formData.username}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('firstNameLabel')}</p>
              <p className="text-gray-900 dark:text-gray-100">{formData.first_name || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('lastNameLabel')}</p>
              <p className="text-gray-900 dark:text-gray-100">{formData.last_name || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('birthDateLabel')}</p>
              <p className="text-gray-900 dark:text-gray-100">
                {formData.birth_date ? new Date(formData.birth_date).toLocaleDateString('fr-FR') : '—'}
              </p>
            </div>
          </div>

          {/* Right column - Preferences */}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('themeLabel').split(' ')[0]}</p>
              <p className="text-gray-900 dark:text-gray-100">
                {formData.theme === 'dark' ? `🌙 ${t('themeDarkOption')}` : `☀️ ${t('themeLightOption')}`}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">🍅 {t('pomodoroTitle')}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Focus :</span>
                <span className="text-gray-900 dark:text-gray-100">{formData.pomodoro_focus_duration} min</span>
                <span className="text-gray-600 dark:text-gray-400">Pause courte :</span>
                <span className="text-gray-900 dark:text-gray-100">{formData.pomodoro_short_break} min</span>
                <span className="text-gray-600 dark:text-gray-400">Pause longue :</span>
                <span className="text-gray-900 dark:text-gray-100">{formData.pomodoro_long_break} min</span>
                <span className="text-gray-600 dark:text-gray-400">Cycles :</span>
                <span className="text-gray-900 dark:text-gray-100">{formData.pomodoro_cycles}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Edit mode
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">✏️ {t('editTitle')}</h2>

      {/* Error/Success messages */}
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

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'profile'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          👤 {t('tabProfile')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'preferences'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          ⚙️ {t('tabPreferences')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <>
            {/* Avatar */}
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                  ) : (
                    formData.username?.charAt(0).toUpperCase() || '?'
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-lg"
                >
                  📷
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>{t('avatarChangeText')}</p>
                <p className="text-xs mt-1">{t('avatarFormatText')}</p>
              </div>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('usernameLabel')} *
              </label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder={t('usernamePlaceholder')}
                minLength={3}
                maxLength={50}
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('usernameHelp')}
              </p>
            </div>

            {/* First name */}
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('firstNameLabel')}
              </label>
              <input
                type="text"
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder={t('firstNamePlaceholder')}
              />
            </div>

            {/* Last name */}
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('lastNameLabel')}
              </label>
              <input
                type="text"
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder={t('lastNamePlaceholder')}
              />
            </div>

            {/* Birth date */}
            <div>
              <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('birthDateLabel')}
              </label>
              <input
                type="date"
                id="birth_date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          </>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <>
            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🎨 {t('themeLabel')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'light', label: `☀️ ${t('themeLightOption')}`, desc: t('themeLightDesc') },
                  { value: 'dark', label: `🌙 ${t('themeDarkOption')}`, desc: t('themeDarkDesc') },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, theme: option.value })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.theme === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <span className="text-3xl block mb-2">{option.label.split(' ')[0]}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 block">{option.label.split(' ')[1]}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{option.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pomodoro Settings */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">🍅 {t('pomodoroTitle')}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Focus duration */}
                <div>
                  <label htmlFor="pomodoro_focus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('pomodoroFocusLabel')}
                  </label>
                  <input
                    type="number"
                    id="pomodoro_focus"
                    value={formData.pomodoro_focus_duration}
                    onChange={(e) => setFormData({ ...formData, pomodoro_focus_duration: parseInt(e.target.value) || 25 })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-100"
                    min={5}
                    max={120}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('pomodoroFocusHelp')}</p>
                </div>

                {/* Short break */}
                <div>
                  <label htmlFor="pomodoro_short" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('pomodoroShortLabel')}
                  </label>
                  <input
                    type="number"
                    id="pomodoro_short"
                    value={formData.pomodoro_short_break}
                    onChange={(e) => setFormData({ ...formData, pomodoro_short_break: parseInt(e.target.value) || 5 })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-100"
                    min={1}
                    max={30}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('pomodoroShortHelp')}</p>
                </div>

                {/* Long break */}
                <div>
                  <label htmlFor="pomodoro_long" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('pomodoroLongLabel')}
                  </label>
                  <input
                    type="number"
                    id="pomodoro_long"
                    value={formData.pomodoro_long_break}
                    onChange={(e) => setFormData({ ...formData, pomodoro_long_break: parseInt(e.target.value) || 15 })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-100"
                    min={5}
                    max={60}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('pomodoroLongHelp')}</p>
                </div>

                {/* Cycles */}
                <div>
                  <label htmlFor="pomodoro_cycles" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('pomodoroCyclesLabel')}
                  </label>
                  <input
                    type="number"
                    id="pomodoro_cycles"
                    value={formData.pomodoro_cycles}
                    onChange={(e) => setFormData({ ...formData, pomodoro_cycles: parseInt(e.target.value) || 4 })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-gray-100"
                    min={1}
                    max={10}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('pomodoroCyclesHelp')}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? t('savingButton') : `💾 ${t('saveButton')}`}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsEditing(false)
              setError(null)
              setSuccess(null)
              setActiveTab('profile')
              // Reset form to original values
              setFormData({
                username: user.username || '',
                first_name: user.profile?.first_name || '',
                last_name: user.profile?.last_name || '',
                birth_date: user.profile?.birth_date || '',
                avatar_url: user.profile?.avatar_url || '',
                theme: user.preferences?.theme || 'dark',
                pomodoro_focus_duration: user.preferences?.pomodoro_settings?.focus_duration || 45,
                pomodoro_short_break: user.preferences?.pomodoro_settings?.short_break_duration || 10,
                pomodoro_long_break: user.preferences?.pomodoro_settings?.long_break_duration || 30,
                pomodoro_cycles: user.preferences?.pomodoro_settings?.cycles_before_long_break || 2,
              })
              setAvatarPreview(user.profile?.avatar_url || null)
              setAvatarFile(null) // Reset avatar file
            }}
            className="px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          >
            {t('cancelButton')}
          </button>
        </div>
      </form>

      {/* Crop Modal */}
      {showCropModal && imageToCrop && (
        <AvatarCropModal
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  )
}
