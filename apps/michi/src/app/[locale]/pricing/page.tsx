/**
 * Pricing Page - Shinkofa Platform
 * Page de selection des plans d'abonnement internationalisee
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

type PlanId = 'musha' | 'samurai' | 'samurai_famille' | 'sensei' | 'sensei_famille'
type BillingInterval = 'monthly' | 'yearly'

interface Plan {
  id: PlanId
  priceMonthly: number
  priceYearly: number
  popular?: boolean
  family?: boolean
}

const plansData: Plan[] = [
  {
    id: 'musha',
    priceMonthly: 0,
    priceYearly: 0,
  },
  {
    id: 'samurai',
    priceMonthly: 19.99,
    priceYearly: 199,
    popular: true,
  },
  {
    id: 'samurai_famille',
    priceMonthly: 59.99,
    priceYearly: 599,
    family: true,
  },
  {
    id: 'sensei',
    priceMonthly: 39.99,
    priceYearly: 399,
  },
  {
    id: 'sensei_famille',
    priceMonthly: 119.99,
    priceYearly: 1199,
    family: true,
  },
]

function PricingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('pricing')
  const tCommon = useTranslations('common')
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Pre-selection du plan depuis query params
  useEffect(() => {
    const planParam = searchParams.get('plan') as PlanId | null
    if (planParam && plansData.find(p => p.id === planParam)) {
      setSelectedPlan(planParam)
    }
  }, [searchParams])

  const handleSelectPlan = async (planId: PlanId) => {
    setIsLoading(true)
    setSelectedPlan(planId)

    // Si Musha (gratuit), rediriger vers inscription directe
    if (planId === 'musha') {
      router.push('/auth/register?plan=musha')
      return
    }

    // Sinon, creer session Stripe Checkout
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: planId,
          interval: billingInterval,
          success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/checkout/cancel`,
        }),
      })

      if (!response.ok) {
        throw new Error(t('errorCreatingSession'))
      }

      const data = await response.json()

      // Rediriger vers Stripe Checkout
      window.location.href = data.checkout_url
    } catch (error) {
      console.error('Erreur:', error)
      alert(t('errorPayment'))
      setIsLoading(false)
    }
  }

  const getPrice = (plan: Plan) => {
    if (plan.priceMonthly === 0) return t('free')

    const price = billingInterval === 'monthly' ? plan.priceMonthly : plan.priceYearly
    const suffix = billingInterval === 'monthly' ? t('perMonth') : t('perYear')

    return `${price.toFixed(billingInterval === 'monthly' ? 2 : 0)}${suffix}`
  }

  const getSavings = (plan: Plan) => {
    if (plan.priceMonthly === 0 || billingInterval === 'monthly') return null

    const monthlyTotal = plan.priceMonthly * 12
    const yearlySavings = monthlyTotal - plan.priceYearly
    const savingsPercent = Math.round((yearlySavings / monthlyTotal) * 100)

    return savingsPercent > 0 ? t('save', { percent: savingsPercent }) : null
  }

  const getPlanTranslations = (planId: PlanId) => {
    return {
      name: t(`plans.${planId}.name`),
      description: t(`plans.${planId}.description`),
      features: t.raw(`plans.${planId}.features`) as string[],
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 dark:from-shinkofa-dark-bg dark:via-shinkofa-marine dark:to-gray-900 py-6 xs:py-8 sm:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 xs:mb-10 sm:mb-12">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 xs:mb-4">
            {t('title')}
          </h1>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-6 xs:mb-8 px-2">
            {t('subtitle')}
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-4 xs:px-6 py-2 rounded-full font-semibold transition-all text-sm xs:text-base touch-target ${
                billingInterval === 'monthly'
                  ? 'bg-gradient-to-r from-shinkofa-marine to-shinkofa-orange text-white'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {t('monthly')}
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-4 xs:px-6 py-2 rounded-full font-semibold transition-all text-sm xs:text-base touch-target ${
                billingInterval === 'yearly'
                  ? 'bg-gradient-to-r from-shinkofa-marine to-shinkofa-orange text-white'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {t('yearly')}
              <span className="ml-1 xs:ml-2 text-xs bg-green-500 text-white px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full">
                {t('discount')}
              </span>
            </button>
          </div>
        </div>

        {/* Alpha 2026 Promo Banner */}
        <div className="mb-8 max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-xl p-4 xs:p-6 shadow-lg">
            <div className="flex flex-col xs:flex-row items-center gap-3 xs:gap-4 text-white">
              <div className="text-3xl xs:text-4xl">🎉</div>
              <div className="flex-1 text-center xs:text-left">
                <h3 className="font-bold text-base xs:text-lg mb-1">
                  Pionniers Alpha 2026 - Réduction à vie !
                </h3>
                <p className="text-sm xs:text-base opacity-90 mb-2">
                  Utilisez le code <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded">PIONNIERS25OFF</span> au checkout pour -25% à vie sur tous les abonnements
                </p>
                <p className="text-xs opacity-75">
                  ⏰ Offre valable jusqu'au 31 mars 2026
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 sm:gap-8">
          {plansData.map((plan) => {
            const planText = getPlanTranslations(plan.id)
            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 xs:p-6 sm:p-8 transition-all duration-300 ${
                  plan.popular
                    ? 'ring-4 ring-shinkofa-orange sm:transform sm:scale-105'
                    : 'hover:shadow-2xl sm:hover:scale-105'
                } ${selectedPlan === plan.id ? 'ring-4 ring-green-500' : ''}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-shinkofa-marine to-shinkofa-orange text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    {t('popular')}
                  </div>
                )}

                {/* Family Badge */}
                {plan.family && (
                  <div className="absolute -top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {t('family')}
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-4 xs:mb-6">
                  <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {planText.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs xs:text-sm mb-3 xs:mb-4">
                    {planText.description}
                  </p>
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-2xl xs:text-3xl sm:text-4xl font-bold text-shinkofa-marine dark:text-secondary-300">
                      {getPrice(plan)}
                    </span>
                    {getSavings(plan) && (
                      <span className="text-xs xs:text-sm text-green-600 dark:text-green-400 font-semibold">
                        {getSavings(plan)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 xs:space-y-3 mb-6 xs:mb-8">
                  {planText.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs xs:text-sm text-gray-700 dark:text-gray-300">
                      <svg className="w-4 h-4 xs:w-5 xs:h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isLoading && selectedPlan === plan.id}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl touch-target text-sm xs:text-base ${
                    plan.popular
                      ? 'bg-gradient-to-r from-shinkofa-marine to-shinkofa-orange text-white hover:from-primary-900 hover:to-secondary-600'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading && selectedPlan === plan.id ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('loadingPlans')}
                    </span>
                  ) : plan.priceMonthly === 0 ? (
                    t('startFree')
                  ) : (
                    t('choosePlan')
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* FAQ / Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('pioneerDiscount')}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {t('questions')}{' '}
            <Link href="/contact" className="text-shinkofa-marine dark:text-secondary-300 hover:underline font-semibold">
              {tCommon('contactUs')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// Page wrapper avec Suspense boundary (requis Next.js 15)
export default function PricingPage() {
  const t = useTranslations('pricing')

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 dark:from-shinkofa-dark-bg dark:via-shinkofa-marine dark:to-gray-900">
        <div className="text-center">
          <svg className="animate-spin h-16 w-16 mx-auto text-shinkofa-marine dark:text-secondary-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 font-semibold">{t('loadingPlans')}</p>
        </div>
      </div>
    }>
      <PricingContent />
    </Suspense>
  )
}
