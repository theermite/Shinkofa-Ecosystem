/**
 * PromoCounter Component
 * Shinkofa Platform - Pioneer Alpha 2026 Campaign
 * Real-time slot counter with 30s polling
 */

'use client'

import { useState, useEffect } from 'react'

interface PromoData {
  total_slots: number
  slots_remaining: number
  slots_taken: number
  is_active: boolean
  percentage_remaining: number
  is_urgent: boolean
  start_date: string
  end_date: string
}

export function PromoCounter() {
  const [promo, setPromo] = useState<PromoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/promo/alpha2026/slots`)

        if (!res.ok) {
          throw new Error('Erreur lors du chargement des places')
        }

        const data: PromoData = await res.json()
        setPromo(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching promo:', err)
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchPromo()

    // Poll every 30 seconds
    const interval = setInterval(fetchPromo, 30000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 dark:border-yellow-400"></div>
        </div>
      </div>
    )
  }

  if (error || !promo) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-400 dark:border-red-600 rounded-xl p-6 shadow-lg">
        <p className="text-red-700 dark:text-red-300 text-center">
          {error || 'Erreur lors du chargement'}
        </p>
      </div>
    )
  }

  const percentage = (promo.slots_remaining / promo.total_slots) * 100

  return (
    <div className={`relative bg-gradient-to-r ${promo.is_urgent ? 'from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30' : 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20'} border-2 ${promo.is_urgent ? 'border-red-500 dark:border-red-400 animate-pulse' : 'border-yellow-400 dark:border-yellow-600'} rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300`}>

      {/* Badge Alert si urgent */}
      {promo.is_urgent && (
        <div className="absolute -top-3 -right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
          🔥 DERNIÈRES PLACES !
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Titre */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-shinkofa-marine dark:text-yellow-300 mb-1">
            Places Pionnier Alpha 2026
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Réduction -25% à vie + Accès exclusif
          </p>
        </div>

        {/* Compteur principal */}
        <div className="text-center">
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-shinkofa-marine to-shinkofa-orange dark:from-yellow-300 dark:to-orange-400">
            {promo.slots_remaining} / {promo.total_slots}
          </div>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-1">
            places restantes
          </p>
        </div>

        {/* Barre de progression */}
        <div className="w-full">
          <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-6 overflow-hidden shadow-inner">
            <div
              className={`h-full ${promo.is_urgent ? 'bg-gradient-to-r from-red-600 to-orange-600 animate-pulse' : 'bg-gradient-to-r from-yellow-500 to-orange-500'} transition-all duration-1000 ease-out flex items-center justify-center`}
              style={{ width: `${percentage}%` }}
            >
              {percentage > 15 && (
                <span className="text-white text-xs font-bold drop-shadow-lg">
                  {Math.round(percentage)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats détaillées */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {promo.slots_taken}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Pionniers déjà inscrits
            </div>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 backdrop-blur-sm">
            <div className={`text-2xl font-bold ${promo.is_urgent ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-yellow-600 dark:text-yellow-400'}`}>
              {promo.slots_remaining}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Places disponibles
            </div>
          </div>
        </div>

        {/* Message d'état */}
        {!promo.is_active && (
          <div className="text-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-300 dark:border-blue-700">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              📅 Ouverture le 20 janvier 2026
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
