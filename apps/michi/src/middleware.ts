/**
 * Middleware - Shinkofa Platform
 * Gestion du routage i18n (pages vitrine uniquement)
 */

import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

// Liste des routes à exclure de l'i18n (API, assets statiques uniquement)
const excludedPrefixes = [
  '/api',           // API routes (backend)
  '/_next',         // Next.js internal
  '/_vercel',       // Vercel analytics
  '/favicon',       // Favicon files
  '/logo',          // Logo files
  '/images',        // Static images
  '/site.webmanifest',  // PWA manifest
]

// Middleware next-intl pour les pages vitrine
const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verifier si c'est une route exclue (backoffice, API, assets)
  const isExcluded = excludedPrefixes.some(
    (prefix) => pathname.startsWith(prefix) || pathname === prefix
  )

  // Verifier si c'est un fichier statique
  const isStaticFile = pathname.includes('.') && !pathname.endsWith('/')

  if (isExcluded || isStaticFile) {
    return NextResponse.next()
  }

  // Appliquer le middleware i18n pour les pages vitrine
  return intlMiddleware(request)
}

export const config = {
  // Matcher pour toutes les routes sauf les fichiers statiques
  matcher: ['/((?!_next|.*\\..*).*)'],
}
