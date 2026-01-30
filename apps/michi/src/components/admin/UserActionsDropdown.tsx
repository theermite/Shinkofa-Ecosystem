/**
 * User Actions Dropdown
 * Menu déroulant des actions admin sur un utilisateur
 */

'use client'

import { useState, useRef, useEffect } from 'react'

interface UserActionsDropdownProps {
  userId: string
  username: string
  isActive: boolean
  emailVerified: boolean
  isSuspended: boolean
  onEdit: () => void
  onToggleActive: () => void
  onForceVerifyEmail: () => void
  onResetPassword: () => void
  onSuspend: () => void
  onImpersonate: () => void
  onViewNotes: () => void
}

export default function UserActionsDropdown({
  userId,
  username,
  isActive,
  emailVerified,
  isSuspended,
  onEdit,
  onToggleActive,
  onForceVerifyEmail,
  onResetPassword,
  onSuspend,
  onImpersonate,
  onViewNotes,
}: UserActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const actions = [
    {
      label: 'Modifier',
      icon: '✏️',
      onClick: onEdit,
      className: 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    },
    {
      label: isActive ? 'Désactiver' : 'Activer',
      icon: isActive ? '🚫' : '✅',
      onClick: onToggleActive,
      className: isActive
        ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
        : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20',
    },
    {
      label: emailVerified ? 'Révoquer email' : 'Vérifier email',
      icon: emailVerified ? '📧' : '✉️',
      onClick: onForceVerifyEmail,
      className: 'text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
    },
    {
      label: 'Reset mot de passe',
      icon: '🔑',
      onClick: onResetPassword,
      className: 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20',
    },
    {
      label: isSuspended ? 'Lever suspension' : 'Suspendre',
      icon: isSuspended ? '🔓' : '⏸️',
      onClick: onSuspend,
      className: isSuspended
        ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
        : 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20',
    },
    {
      label: 'Impersonner',
      icon: '👤',
      onClick: onImpersonate,
      className: 'text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20',
    },
    {
      label: 'Notes admin',
      icon: '📝',
      onClick: onViewNotes,
      className: 'text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
    },
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label={`Actions pour ${username}`}
      >
        <svg
          className="w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick()
                setIsOpen(false)
              }}
              className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${action.className}`}
            >
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
