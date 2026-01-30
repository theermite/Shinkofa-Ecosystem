'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import apiClient from '@/lib/api/client'

function BirthInfoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const t = useTranslations('questionnaire.birthInfo')
  const sessionId = searchParams.get('sessionId')

  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    birthDate: '',
    birthTime: '',
    birthCity: '',
    birthCountry: '',
    latitude: '',
    longitude: '',
    timezone: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGeolocating, setIsGeolocating] = useState(false)
  const [selectedLocationIndex, setSelectedLocationIndex] = useState<number | null>(null)
  const [geocodeResults, setGeocodeResults] = useState<Array<{
    display_name: string
    lat: string
    lon: string
    address?: {
      city?: string
      town?: string
      village?: string
      state?: string
      region?: string
      county?: string
      country?: string
    }
  }>>([])
  const [locationConfirmed, setLocationConfirmed] = useState(false)

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-red-900">
        <div className="max-w-md mx-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">{t('errorTitle')}</h2>
              <p className="text-red-700 dark:text-red-300">{t('errorMissingSession')}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Country to timezone mapping for common countries (fallback when API fails)
  const COUNTRY_TIMEZONE_MAP: Record<string, string> = {
    'france': 'Europe/Paris',
    'belgique': 'Europe/Brussels',
    'belgium': 'Europe/Brussels',
    'suisse': 'Europe/Zurich',
    'switzerland': 'Europe/Zurich',
    'canada': 'America/Toronto',
    'québec': 'America/Toronto',
    'maroc': 'Africa/Casablanca',
    'morocco': 'Africa/Casablanca',
    'algérie': 'Africa/Algiers',
    'algeria': 'Africa/Algiers',
    'tunisie': 'Africa/Tunis',
    'tunisia': 'Africa/Tunis',
    'espagne': 'Europe/Madrid',
    'spain': 'Europe/Madrid',
    'italie': 'Europe/Rome',
    'italy': 'Europe/Rome',
    'allemagne': 'Europe/Berlin',
    'germany': 'Europe/Berlin',
    'royaume-uni': 'Europe/London',
    'uk': 'Europe/London',
    'united kingdom': 'Europe/London',
    'états-unis': 'America/New_York',
    'usa': 'America/New_York',
    'united states': 'America/New_York',
    'portugal': 'Europe/Lisbon',
    'pays-bas': 'Europe/Amsterdam',
    'netherlands': 'Europe/Amsterdam',
    'luxembourg': 'Europe/Luxembourg',
    'monaco': 'Europe/Monaco',
    'sénégal': 'Africa/Dakar',
    'senegal': 'Africa/Dakar',
    'côte d\'ivoire': 'Africa/Abidjan',
    'cameroun': 'Africa/Douala',
    'cameroon': 'Africa/Douala',
    'togo': 'Africa/Lome',
    'bénin': 'Africa/Porto-Novo',
    'benin': 'Africa/Porto-Novo',
    'ghana': 'Africa/Accra',
    'nigeria': 'Africa/Lagos',
    'nigéria': 'Africa/Lagos',
    'mali': 'Africa/Bamako',
    'burkina faso': 'Africa/Ouagadougou',
    'guinée': 'Africa/Conakry',
    'guinea': 'Africa/Conakry',
    'gabon': 'Africa/Libreville',
    'congo': 'Africa/Brazzaville',
    'rdc': 'Africa/Kinshasa',
    'madagascar': 'Indian/Antananarivo',
    'maurice': 'Indian/Mauritius',
    'mauritius': 'Indian/Mauritius',
    'réunion': 'Indian/Reunion',
    'martinique': 'America/Martinique',
    'guadeloupe': 'America/Guadeloupe',
    'guyane': 'America/Cayenne',
    'haïti': 'America/Port-au-Prince',
    'haiti': 'America/Port-au-Prince',
  }

  const getTimezoneForCountry = (country: string): string => {
    const normalizedCountry = country.toLowerCase().trim()
    return COUNTRY_TIMEZONE_MAP[normalizedCountry] || 'Europe/Paris' // Default to Europe/Paris for French-speaking users
  }

  const selectLocation = async (location: any, index?: number) => {
    // Set loading state
    setIsGeolocating(true)
    if (index !== undefined) {
      setSelectedLocationIndex(index)
    }

    const lat = parseFloat(location.lat).toFixed(6)
    const lon = parseFloat(location.lon).toFixed(6)

    // Try to detect timezone from coordinates
    let detectedTimezone = getTimezoneForCountry(formData.birthCountry)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const tzResponse = await fetch(
        `https://timeapi.io/api/TimeZone/coordinate?latitude=${lat}&longitude=${lon}`,
        { signal: controller.signal }
      )
      clearTimeout(timeoutId)

      if (tzResponse.ok) {
        const tzData = await tzResponse.json()
        if (tzData && tzData.timeZone) {
          detectedTimezone = tzData.timeZone
          console.log(`✅ Timezone detected from API: ${detectedTimezone}`)
        }
      }
    } catch (tzErr: any) {
      if (tzErr.name === 'AbortError') {
        console.warn(`⚠️ Timezone API timeout, using country fallback: ${detectedTimezone}`)
      } else {
        console.warn(`⚠️ Timezone API failed, using country fallback: ${detectedTimezone}`, tzErr)
      }
    }

    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lon,
      timezone: detectedTimezone,
    }))

    setGeocodeResults([])
    setLocationConfirmed(true)
    setIsGeolocating(false)
    setSelectedLocationIndex(null)
  }

  const handleGeocode = async () => {
    if (!formData.birthCity || !formData.birthCountry) {
      setError(t('errorMissingLocation'))
      return
    }

    setIsGeolocating(true)
    setError(null)
    setLocationConfirmed(false)

    try {
      const query = `${formData.birthCity}, ${formData.birthCountry}`
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        if (data.length === 1) {
          // Single result - auto-select
          await selectLocation(data[0])
        } else {
          // Multiple results - show selection UI
          setGeocodeResults(data)
          setIsGeolocating(false)
        }
      } else {
        setError(t('errorLocationNotFound'))
        setIsGeolocating(false)
      }
    } catch (err) {
      console.error('Geocoding error:', err)
      setError(t('errorGeocoding'))
      setIsGeolocating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.lastName || !formData.firstName) {
      setError(t('errorMissingName'))
      return
    }

    if (!formData.birthDate || !formData.birthTime) {
      setError(t('errorMissingDateTime'))
      return
    }

    if (!formData.birthCity || !formData.birthCountry) {
      setError(t('errorMissingCityCountry'))
      return
    }

    if (!formData.latitude || !formData.longitude) {
      setError(t('errorMissingCoordinates'))
      return
    }

    setIsSubmitting(true)

    try {
      // Calculate UTC offset from birth location timezone (not browser timezone!)
      const birthTimezone = formData.timezone || 'UTC'
      const birthDateTime = new Date(`${formData.birthDate}T${formData.birthTime}:00`)

      // Get UTC offset for the birth location at the time of birth
      let utcOffset = '+00:00'
      try {
        // Use Intl API to get offset for specific timezone
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: birthTimezone,
          timeZoneName: 'longOffset'
        })
        const parts = formatter.formatToParts(birthDateTime)
        const offsetPart = parts.find(part => part.type === 'timeZoneName')
        if (offsetPart && offsetPart.value.includes('GMT')) {
          // Extract offset from "GMT+1" or "GMT-5"
          const match = offsetPart.value.match(/GMT([+-]\d+)/)
          if (match) {
            const hours = parseInt(match[1])
            utcOffset = `${hours >= 0 ? '+' : ''}${hours.toString().padStart(2, '0')}:00`
          }
        }
      } catch (offsetErr) {
        console.warn('UTC offset calculation failed, using +00:00:', offsetErr)
      }

      const birthData = {
        full_name: `${formData.firstName} ${formData.lastName}`,
        date: formData.birthDate,
        time: formData.birthTime.length === 5 ? `${formData.birthTime}:00` : formData.birthTime,
        city: formData.birthCity,
        country: formData.birthCountry,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        timezone: birthTimezone,
        utc_offset: utcOffset,
      }

      const response = await apiClient.patch(`/questionnaire/sessions/${sessionId}/birth-data`, {
        birth_data: birthData,
        full_name: birthData.full_name,
      })

      if (response.status === 200) {
        // Redirect to complete page
        router.push(`/questionnaire/complete?sessionId=${sessionId}`)
      } else {
        setError(t('errorSaving'))
      }
    } catch (err: any) {
      console.error('Submit error:', err)
      setError(err.response?.data?.detail || t('errorSaving'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🌟</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Identity Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>👤</span> {t('identityTitle')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('lastNameLabel')}
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder={t('lastNamePlaceholder')}
                  required
                />
              </div>
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('firstNameLabel')}
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder={t('firstNamePlaceholder')}
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('firstNameHelp')}</p>
              </div>
            </div>
          </div>

          {/* Date & Time Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>📅</span> {t('dateTimeTitle')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('birthDateLabel')}
                </label>
                <input
                  type="date"
                  id="birthDate"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="birthTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('birthTimeLabel')}
                </label>
                <input
                  type="time"
                  id="birthTime"
                  value={formData.birthTime}
                  onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                  step="60"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('birthTimeHelp')}</p>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span>📍</span> {t('locationTitle')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="birthCity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('birthCityLabel')}
                </label>
                <input
                  type="text"
                  id="birthCity"
                  value={formData.birthCity}
                  onChange={(e) => setFormData({ ...formData, birthCity: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder={t('birthCityPlaceholder')}
                  required
                />
              </div>
              <div>
                <label htmlFor="birthCountry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('birthCountryLabel')}
                </label>
                <input
                  type="text"
                  id="birthCountry"
                  value={formData.birthCountry}
                  onChange={(e) => setFormData({ ...formData, birthCountry: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder={t('birthCountryPlaceholder')}
                  required
                />
              </div>
            </div>

            {/* Helper Text */}
            {!locationConfirmed && (
              <div className="mb-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="text-xl">💡</span>
                  <div className="flex-1 text-xs text-amber-800 dark:text-amber-200">
                    <strong>Astuce :</strong> Soyez précis ! Exemple : "Les Lilas, Seine-Saint-Denis" ou "Paris 15ème"
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleGeocode}
              disabled={isGeolocating || !formData.birthCity || !formData.birthCountry}
              className="w-full mb-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
            >
              {isGeolocating ? t('geocodeInProgress') : t('geocodeButton')}
            </button>

            {/* Multiple Location Results */}
            {geocodeResults.length > 0 && (
              <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🗺️</span>
                  <h3 className="font-bold text-blue-900 dark:text-blue-100">
                    {geocodeResults.length} lieux trouvés - Sélectionnez le bon
                  </h3>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  ⚠️ Vérifiez attentivement la région/département pour éviter toute confusion
                </p>
                <div className="space-y-2">
                  {geocodeResults.map((result, index) => {
                    const isSelectingThis = selectedLocationIndex === index
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectLocation(result, index)}
                        disabled={isGeolocating}
                        className="w-full text-left p-4 bg-white dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed relative"
                      >
                        {isSelectingThis && (
                          <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
                          </div>
                        )}
                        <div className={`${isSelectingThis ? 'opacity-50' : ''}`}>
                          <div className="font-semibold text-gray-900 dark:text-white mb-1">
                            {result.display_name}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <span>📍</span>
                            <span>{result.lat}, {result.lon}</span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Location Confirmation */}
            {locationConfirmed && formData.latitude && formData.longitude && (
              <div className="mb-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✅</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-green-900 dark:text-green-100 mb-1">
                      Lieu confirmé
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                      {formData.birthCity}, {formData.birthCountry}
                    </p>
                    <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>Coordonnées : {formData.latitude}°N, {formData.longitude}°E</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🕐</span>
                        <span>Timezone : {formData.timezone}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLocationConfirmed(false)
                        setFormData(prev => ({ ...prev, latitude: '', longitude: '', timezone: '' }))
                      }}
                      className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      🔄 Modifier le lieu
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('latitudeLabel')}
                </label>
                <input
                  type="number"
                  id="latitude"
                  step="0.000001"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="48.856613"
                  required
                />
              </div>
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('longitudeLabel')}
                </label>
                <input
                  type="number"
                  id="longitude"
                  step="0.000001"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="2.352222"
                  required
                />
              </div>
              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('timezoneLabel')}
                </label>
                <input
                  type="text"
                  id="timezone"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Europe/Paris"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {t('geocodeHelp')}
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push(`/questionnaire/complete?sessionId=${sessionId}`)}
              className="flex-1 px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              {t('skipButton')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-semibold transition shadow-lg"
            >
              {isSubmitting ? t('submitInProgress') : t('submitButton')}
            </button>
          </div>
        </form>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl shadow-xl p-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl">ℹ️</span>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{t('whyTitle')}</h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• {t('whyNames')}</li>
                <li>• {t('whyDate')}</li>
                <li>• {t('whyTime')}</li>
                <li>• {t('whyLocation')}</li>
              </ul>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                {t('privacyNote')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BirthInfoPage() {
  const t = useTranslations('questionnaire.birthInfo')

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">{t('loading')}</p>
          </div>
        </div>
      }
    >
      <BirthInfoContent />
    </Suspense>
  )
}
