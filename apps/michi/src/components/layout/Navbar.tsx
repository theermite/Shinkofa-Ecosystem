/**
 * Navbar Component
 * Shinkofa Platform - Global Navigation
 * Compact design: user dropdown on desktop, streamlined drawer on mobile
 */

'use client'

import { useState, useEffect, useRef, SyntheticEvent } from 'react'
import Image from 'next/image'
import { Menu, X, Bug, User, LogOut, HelpCircle, ChevronDown, Lightbulb } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import { ThemeToggle } from './ThemeToggle'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useAuth } from '@/contexts/AuthContext'
import { OnboardingTour } from '@/components/onboarding/OnboardingTour'
import ReportBugModal, { BugReportData } from '@/components/bug-report/ReportBugModal'
import SuggestionModal, { SuggestionData } from '@/components/suggestion/SuggestionModal'

export function Navbar() {
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isBugModalOpen, setIsBugModalOpen] = useState(false)
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('nav')

  // Reset avatar error when user changes
  useEffect(() => {
    setAvatarError(false)
  }, [user?.profile?.avatar_url])

  // Handle avatar load error - fallback to initials
  const handleAvatarError = (e: SyntheticEvent<HTMLImageElement>) => {
    setAvatarError(true)
  }

  // Get full avatar URL (prefix with API URL if relative)
  const getAvatarUrl = (url: string | undefined): string | null => {
    if (!url) return null
    // If already absolute URL, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    // If relative, prefix with API URL
    const apiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://app.shinkofa.com'
    return `${apiUrl}${url.startsWith('/') ? '' : '/'}${url}`
  }

  const avatarUrl = getAvatarUrl(user?.profile?.avatar_url)
  const showAvatar = avatarUrl && !avatarError

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const handleBugSubmit = async (bugData: BugReportData) => {
    const response = await fetch('/api/bug-reports/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(user ? { 'Authorization': `Bearer ${localStorage.getItem('shinkofa_access_token')}` } : {}),
      },
      body: JSON.stringify(bugData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || t('bugReportError'))
    }

    alert(`✅ ${t('bugReportSuccess')}`)
  }

  const handleSuggestionSubmit = async (suggestionData: SuggestionData) => {
    const response = await fetch('/api/suggestions/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(user ? { 'Authorization': `Bearer ${localStorage.getItem('shinkofa_access_token')}` } : {}),
      },
      body: JSON.stringify(suggestionData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Erreur lors de l\'envoi')
    }

    alert('✅ Merci pour votre suggestion !')
  }

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/')
  }

  const hasPaidSubscription = () => {
    if (!user?.subscription) return false
    const status = (user.subscription.status || '').toLowerCase()
    const tier = (user.subscription.tier || 'musha').toLowerCase()
    const isActiveSub = ['active', 'trialing'].includes(status)
    const isPaidTier = tier !== 'musha'
    return isActiveSub && isPaidTier
  }

  const navLinks = [
    { href: '/pricing', label: `💎 ${t('plans')}`, requiresAuth: false, hideWhenPaid: true },
    { href: '/questionnaire', label: `🧠 ${t('questionnaire')}`, requiresAuth: false, hideWhenPaid: false },
    { href: '/shizen', label: `🤖 ${t('shizenAi')}`, requiresAuth: true, hideWhenPaid: false },
    { href: '/planner', label: `📅 ${t('planner')}`, requiresAuth: true, hideWhenPaid: false },
  ]

  const visibleLinks = navLinks.filter(link => {
    if (link.requiresAuth && !isAuthenticated) return false
    if (link.hideWhenPaid && hasPaidSubscription()) return false
    return true
  })

  return (
    <>
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Toujours vers dashboard (dashboard gère redirect si non-auth) */}
            <Link
              href="/dashboard"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity shrink-0"
            >
              <Image
                src="/logo-shinkofa.svg"
                alt="Shinkofa"
                width={180}
                height={48}
                priority
                className="h-10 xs:h-12 w-auto"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {visibleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? 'bg-primary-100 dark:bg-primary-900/20 text-shinkofa-marine dark:text-secondary-200'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Right side */}
            <div className="hidden md:flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />

              {isAuthenticated && user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                  >
                    {showAvatar ? (
                      <img src={avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600" onError={handleAvatarError} />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-shinkofa-marine to-shinkofa-orange flex items-center justify-center text-white text-xs font-bold">
                        {user.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <ChevronDown size={16} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <User size={16} />
                        {t('profile') || 'Profil'}
                      </Link>

                      <button
                        onClick={() => { setShowOnboarding(true); setIsUserMenuOpen(false) }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <HelpCircle size={16} />
                        {t('guide')}
                      </button>

                      <button
                        onClick={() => { setIsBugModalOpen(true); setIsUserMenuOpen(false) }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Bug size={16} />
                        {t('reportBug')}
                      </button>

                      <button
                        onClick={() => { setIsSuggestionModalOpen(true); setIsUserMenuOpen(false) }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Lightbulb size={16} />
                        {t('suggest') || 'Idee'}
                      </button>

                      <div className="border-t border-gray-100 dark:border-gray-700 mt-1">
                        <button
                          onClick={() => { logout(); setIsUserMenuOpen(false) }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <LogOut size={16} />
                          {t('logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setIsBugModalOpen(true)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                    title={t('reportBug')}
                  >
                    <Bug size={18} />
                  </button>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-shinkofa-marine to-shinkofa-orange text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    {t('login')}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Right side - Avatar + Theme + Hamburger */}
            <div className="flex md:hidden items-center gap-1">
              {isAuthenticated && user && (
                <Link
                  href="/profile"
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Profil"
                >
                  {showAvatar ? (
                    <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600" onError={handleAvatarError} />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-shinkofa-marine to-shinkofa-orange flex items-center justify-center text-white text-sm font-bold">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </Link>
              )}
              <ThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Ouvrir le menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer - Outside nav for proper z-index */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998] bg-black/60"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 right-0 z-[9999] w-80 max-w-[90vw] bg-white dark:bg-gray-900 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Fermer le menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* User section (if authenticated) */}
            {isAuthenticated && user && (
              <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {showAvatar ? (
                    <img src={avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600" onError={handleAvatarError} />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-shinkofa-marine to-shinkofa-orange flex items-center justify-center text-white text-lg font-bold">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{user.username}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Voir le profil</p>
                  </div>
                  <ChevronDown size={20} className="text-gray-400 -rotate-90" />
                </Link>
              </div>
            )}

            {/* Quick actions - Guide, Bug, Language (en haut pour éviter clics accidentels) */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setShowOnboarding(true); setIsMobileMenuOpen(false) }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <HelpCircle size={18} />
                  Guide
                </button>
                <button
                  onClick={() => { setIsBugModalOpen(true); setIsMobileMenuOpen(false) }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Bug size={18} />
                  Bug
                </button>
                <button
                  onClick={() => { setIsSuggestionModalOpen(true); setIsMobileMenuOpen(false) }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                >
                  <Lightbulb size={18} />
                  Idee
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <LanguageSwitcher />
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 px-2">
                Navigation
              </p>
              <nav className="space-y-1">
                {visibleLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                      isActive(link.href)
                        ? 'bg-shinkofa-marine text-white'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Footer - Login/Logout seul (éloigné des actions) */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4">
              {isAuthenticated && user ? (
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false) }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <LogOut size={20} />
                  {t('logout')}
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full px-4 py-3 text-center text-base font-medium bg-gradient-to-r from-shinkofa-marine to-shinkofa-orange text-white rounded-xl hover:shadow-lg transition-all"
                >
                  {t('login')}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bug Report Modal */}
      {isBugModalOpen && (
        <ReportBugModal
          onClose={() => setIsBugModalOpen(false)}
          onSubmit={handleBugSubmit}
        />
      )}

      {/* Suggestion Modal */}
      {isSuggestionModalOpen && (
        <SuggestionModal
          onClose={() => setIsSuggestionModalOpen(false)}
          onSubmit={handleSuggestionSubmit}
        />
      )}

      {/* Onboarding Tour */}
      {showOnboarding && (
        <OnboardingTour
          forceShow
          onComplete={() => setShowOnboarding(false)}
        />
      )}
    </>
  )
}
