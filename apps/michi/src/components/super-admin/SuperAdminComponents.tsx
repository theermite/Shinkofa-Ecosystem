/**
 * Super Admin Components Wrapper
 * Client component wrapper to load SuperAdminBadge and SuperAdminPanel
 */

'use client'

import dynamic from 'next/dynamic'

// Load Super Admin components client-side only to avoid SSR hydration errors
const SuperAdminBadge = dynamic(
  () => import('./SuperAdminBadge').then(mod => ({ default: mod.SuperAdminBadge })),
  { ssr: false }
)

const SuperAdminPanel = dynamic(
  () => import('./SuperAdminPanel').then(mod => ({ default: mod.SuperAdminPanel })),
  { ssr: false }
)

export function SuperAdminComponents() {
  return (
    <>
      <SuperAdminBadge />
      <SuperAdminPanel />
    </>
  )
}
