/**
 * AlphaBanner Component
 * Shinkofa Platform - Sticky top banner for Pioneer Alpha 2026 Campaign
 * Countdown timer + CTA + PromoCounter integration
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PromoCounter } from './PromoCounter'

export function AlphaBanner() {
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [showCounter, setShowCounter] = useState(false)

  useEffect(() => {
    const endDate = new Date('2026-02-03T23:59:59').getTime()

    const updateCountdown = () => {
      const now = new Date().getTime()
      const distance = endDate - now

      if (distance < 0) {
        setTimeLeft('Offre terminée')
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft(`${days}j ${hours}h ${minutes}m ${seconds}s`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 shadow-2xl border-b-4 border-yellow-600 dark:border-orange-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

          {/* Titre + Badge */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <div className="w-12 h-12 bg-white/90 dark:bg-gray-900/90 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">🏅</span>
              </div>
            </div>
            <div className="text-center lg:text-left">
              <h2 className="text-xl md:text-2xl font-black text-white drop-shadow-lg">
                Programme Pionnier Alpha 2026
              </h2>
              <p className="text-sm md:text-base font-semibold text-yellow-100 drop-shadow">
                -25% à vie • Accès exclusif • Badge numéroté #001-#100
              </p>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-4 bg-white/20 dark:bg-black/30 backdrop-blur-md rounded-xl px-4 py-2 shadow-lg border-2 border-white/40 dark:border-gray-700/50">
            <div className="text-center">
              <div className="text-sm font-bold text-white/90 uppercase tracking-wider">
                Temps restant
              </div>
              <div className="text-2xl md:text-3xl font-black text-white drop-shadow-lg font-mono">
                {timeLeft}
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setShowCounter(!showCounter)}
              className="bg-white dark:bg-gray-900 text-shinkofa-orange dark:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold py-3 px-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-shinkofa-marine dark:border-orange-600 whitespace-nowrap"
            >
              {showCounter ? '✕ Masquer' : '👁️ Voir les places'}
            </button>
            <Link
              href="/auth/register"
              className="bg-gradient-to-br from-shinkofa-marine to-blue-700 dark:from-blue-600 dark:to-blue-800 text-white font-black py-3 px-8 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:from-blue-700 hover:to-shinkofa-marine dark:hover:from-blue-700 dark:hover:to-blue-900 border-2 border-white/50 whitespace-nowrap"
            >
              🚀 Devenir Pionnier
            </Link>
          </div>
        </div>

        {/* Compteur extensible */}
        {showCounter && (
          <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
            <PromoCounter />
          </div>
        )}
      </div>
    </div>
  )
}
