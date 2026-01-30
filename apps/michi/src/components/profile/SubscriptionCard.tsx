/**
 * SubscriptionCard Component
 * Displays user's current plan, limits, and badges
 */

'use client'

import { Link } from '@/i18n/routing'
import type { User, SubscriptionTier } from '@/types/auth'
import { useTranslations } from 'next-intl'

interface SubscriptionCardProps {
  user: User
}

// Plan configuration (icons and colors only, names come from translations)
const PLAN_CONFIG: Record<SubscriptionTier | 'none', {
  icon: string
  color: string
  bgColor: string
  borderColor: string
}> = {
  none: {
    icon: '👤',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    borderColor: 'border-gray-300 dark:border-gray-600'
  },
  musha: {
    icon: '🥋',
    color: 'text-gray-700 dark:text-gray-300',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    borderColor: 'border-gray-400 dark:border-gray-500'
  },
  samurai: {
    icon: '⚔️',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    borderColor: 'border-blue-500'
  },
  samurai_famille: {
    icon: '⚔️👨‍👩‍👧‍👦',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    borderColor: 'border-blue-500'
  },
  sensei: {
    icon: '🏯',
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-50 dark:bg-purple-900/30',
    borderColor: 'border-purple-500'
  },
  sensei_famille: {
    icon: '🏯👨‍👩‍👧‍👦',
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-50 dark:bg-purple-900/30',
    borderColor: 'border-purple-500'
  },
  founder: {
    icon: '👑',
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-amber-900/30',
    borderColor: 'border-amber-500'
  }
}

// Limits by tier
const LIMITS: Record<SubscriptionTier | 'none', {
  shizenMessages: number | null
  projects: number | null
  tasks: number | null
}> = {
  none: { shizenMessages: 0, projects: 0, tasks: 0 },
  musha: { shizenMessages: 50, projects: 2, tasks: 10 },
  samurai: { shizenMessages: 200, projects: null, tasks: null },
  samurai_famille: { shizenMessages: 200, projects: null, tasks: null },
  sensei: { shizenMessages: null, projects: null, tasks: null },
  sensei_famille: { shizenMessages: null, projects: null, tasks: null },
  founder: { shizenMessages: null, projects: null, tasks: null }
}

export function SubscriptionCard({ user }: SubscriptionCardProps) {
  const t = useTranslations('profile.subscription')
  const tier = (user.subscription?.tier || 'musha') as SubscriptionTier
  const status = user.subscription?.status || 'active'
  const isActive = ['active', 'trialing'].includes(status)

  const planConfig = PLAN_CONFIG[tier] || PLAN_CONFIG.musha
  const limits = LIMITS[tier] || LIMITS.musha

  const canUpgrade = tier === 'musha' || tier === 'samurai' || tier === 'samurai_famille'

  // Format next billing date
  const nextBillingDate = user.subscription?.current_period_end
    ? new Date(user.subscription.current_period_end).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : null

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 xs:p-6 mb-6 border-l-4 ${planConfig.borderColor}`}>
      {/* Plan Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${planConfig.bgColor} flex items-center justify-center text-2xl`}>
            {planConfig.icon}
          </div>
          <div>
            <h2 className={`text-xl font-bold ${planConfig.color}`}>
              {t('planLabel')} {t(`plans.${tier}`)}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isActive ? (
                status === 'trialing' ? t('statusTrialing') : t('statusActive')
              ) : (
                <span className="text-red-500">{t('statusInactive')}</span>
              )}
              {nextBillingDate && isActive && (
                <span> · {t('renewalDate')} {nextBillingDate}</span>
              )}
            </p>
          </div>
        </div>

        {canUpgrade && (
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            ⬆️ {t('upgradeButton')}
          </Link>
        )}
      </div>

      {/* Limits */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <LimitItem
          label={t('shizenMessagesLabel')}
          icon="🤖"
          limit={limits.shizenMessages}
          current={null} // TODO: Get from API
          unlimitedText={t('unlimited')}
        />
        <LimitItem
          label={t('projectsLabel')}
          icon="📁"
          limit={limits.projects}
          current={null} // TODO: Get from API
          unlimitedText={t('unlimited')}
        />
        <LimitItem
          label={t('tasksLabel')}
          icon="✅"
          limit={limits.tasks}
          current={null} // TODO: Get from API
          unlimitedText={t('unlimited')}
        />
      </div>

      {/* Custom Title */}
      {user.subscription?.custom_badge && (
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-700">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✨</span>
            <div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium uppercase tracking-wide">{t('customBadgeTitle')}</p>
              <p className="text-xl font-bold text-amber-800 dark:text-amber-200">{user.subscription.custom_badge}</p>
            </div>
          </div>
        </div>
      )}

      {/* Badges */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('badgesTitle')}</h3>
        <div className="flex flex-wrap gap-2">
          {user.is_pioneer && user.pioneer_number && (
            <Badge
              icon="🏅"
              label={`${t('pioneerBadge')} #${user.pioneer_number.toString().padStart(3, '0')}`}
              color="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700"
            />
          )}
          {user.email_verified && (
            <Badge
              icon="✓"
              label={t('emailVerifiedBadge')}
              color="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700"
            />
          )}
          {tier === 'founder' && (
            <Badge
              icon="👑"
              label={t('founderBadge')}
              color="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700"
            />
          )}
          {!user.is_pioneer && !user.email_verified && tier !== 'founder' && (
            <span className="text-sm text-gray-500 dark:text-gray-400 italic">
              {t('noBadges')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Limit item component
function LimitItem({
  label,
  icon,
  limit,
  current,
  unlimitedText
}: {
  label: string
  icon: string
  limit: number | null
  current: number | null
  unlimitedText: string
}) {
  const isUnlimited = limit === null
  const percentage = current !== null && limit !== null ? Math.min((current / limit) * 100, 100) : 0

  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      </div>
      {isUnlimited ? (
        <p className="text-lg font-bold text-green-600 dark:text-green-400">{unlimitedText}</p>
      ) : (
        <>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {current !== null ? `${current} / ${limit}` : `Max ${limit}`}
          </p>
          {current !== null && (
            <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  percentage >= 90 ? 'bg-red-500' : percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Badge component
function Badge({
  icon,
  label,
  color
}: {
  icon: string
  label: string
  color: string
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${color}`}>
      <span>{icon}</span>
      {label}
    </span>
  )
}
