/**
 * i18n Routing - Shinkofa Platform
 * Configuration du routage i18n avec next-intl
 */

import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'
import { locales, defaultLocale } from './config'

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Toujours afficher le préfixe de locale dans l'URL (/fr/, /en/)
  // Optimal pour SEO et cohérence
  localePrefix: 'always',
})

// Export des helpers de navigation
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
