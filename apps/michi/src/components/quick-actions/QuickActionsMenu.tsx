/**
 * QuickActionsMenu - Menu d'actions rapides flottant (ergonomique mobile)
 * Shinkofa Platform - Next.js 15
 * V3.0 - Support Pomodoro persistant + Bouton déplaçable
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Activity, Timer, Wind, X, Move } from 'lucide-react'
import Image from 'next/image'
import { QuickCheckIn } from './QuickCheckIn'
import { QuickPomodoro } from './QuickPomodoro'
import { QuickBreathing } from './QuickBreathing'
import { MinimizedPomodoro } from './MinimizedPomodoro'
import { useAuth } from '@/contexts/AuthContext'
import { usePomodoro } from '@/contexts/PomodoroContext'

const POSITION_STORAGE_KEY = 'shinkofa_quick_action_position'
const BUTTON_SIZE = 56 // Taille du bouton en pixels

interface Position {
  x: number
  y: number
}

function getDefaultPosition(): Position {
  if (typeof window === 'undefined') {
    return { x: 0, y: 0 }
  }
  // Position par défaut: en bas à droite, au-dessus du badge super admin
  return {
    x: window.innerWidth - BUTTON_SIZE - 24,
    y: window.innerHeight - BUTTON_SIZE - 160, // Plus haut pour éviter le badge
  }
}

function getSavedPosition(): Position | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(POSITION_STORAGE_KEY)
    if (saved) {
      const pos = JSON.parse(saved)
      // Valider que la position est dans les limites de l'écran
      if (
        pos.x >= 0 &&
        pos.x <= window.innerWidth - BUTTON_SIZE &&
        pos.y >= 0 &&
        pos.y <= window.innerHeight - BUTTON_SIZE
      ) {
        return pos
      }
    }
  } catch {
    // Ignorer les erreurs de parsing
  }
  return null
}

function savePosition(pos: Position) {
  try {
    localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(pos))
  } catch {
    // Ignorer les erreurs de stockage
  }
}

export function QuickActionsMenu() {
  const { isAuthenticated } = useAuth()
  const { isActive, isMinimized, startPomodoro } = usePomodoro()
  const [isOpen, setIsOpen] = useState(false)
  const [activeAction, setActiveAction] = useState<'check-in' | 'breathing' | null>(null)

  // État pour le drag
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<Position | null>(null)
  const [hasMoved, setHasMoved] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Initialiser la position au montage
  useEffect(() => {
    const saved = getSavedPosition()
    if (saved) {
      setPosition(saved)
    } else {
      setPosition(getDefaultPosition())
    }
  }, [])

  // Recalculer la position si la fenêtre est redimensionnée
  useEffect(() => {
    function handleResize() {
      setPosition((prev) => {
        const maxX = window.innerWidth - BUTTON_SIZE
        const maxY = window.innerHeight - BUTTON_SIZE
        const newPos = {
          x: Math.min(Math.max(0, prev.x), maxX),
          y: Math.min(Math.max(0, prev.y), maxY),
        }
        return newPos
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Gestion du drag - Mouse
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return // Seulement clic gauche
    setIsDragging(true)
    setHasMoved(false)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }, [position])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStart) return

    const newX = Math.min(Math.max(0, e.clientX - dragStart.x), window.innerWidth - BUTTON_SIZE)
    const newY = Math.min(Math.max(0, e.clientY - dragStart.y), window.innerHeight - BUTTON_SIZE)

    // Détecter si on a bougé significativement (> 5px)
    if (Math.abs(e.clientX - dragStart.x - position.x) > 5 ||
        Math.abs(e.clientY - dragStart.y - position.y) > 5) {
      setHasMoved(true)
    }

    setPosition({ x: newX, y: newY })
  }, [isDragging, dragStart, position])

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      setDragStart(null)
      if (hasMoved) {
        savePosition(position)
      }
    }
  }, [isDragging, hasMoved, position])

  // Gestion du drag - Touch
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setHasMoved(false)
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y })
  }, [position])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !dragStart) return

    const touch = e.touches[0]
    const newX = Math.min(Math.max(0, touch.clientX - dragStart.x), window.innerWidth - BUTTON_SIZE)
    const newY = Math.min(Math.max(0, touch.clientY - dragStart.y), window.innerHeight - BUTTON_SIZE)

    // Détecter si on a bougé significativement
    if (Math.abs(touch.clientX - dragStart.x - position.x) > 5 ||
        Math.abs(touch.clientY - dragStart.y - position.y) > 5) {
      setHasMoved(true)
    }

    setPosition({ x: newX, y: newY })
  }, [isDragging, dragStart, position])

  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      setDragStart(null)
      if (hasMoved) {
        savePosition(position)
      }
    }
  }, [isDragging, hasMoved, position])

  // Attacher les event listeners globaux pour le drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', handleTouchEnd)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  // Gérer le clic (seulement si on n'a pas bougé)
  const handleClick = () => {
    if (!hasMoved) {
      setIsOpen(!isOpen)
    }
    setHasMoved(false)
  }

  // Ne pas afficher le menu si l'utilisateur n'est pas connecté
  if (!isAuthenticated) {
    return null
  }

  const handleOpenAction = (action: 'check-in' | 'breathing') => {
    setActiveAction(action)
    setIsOpen(false)
  }

  const handleOpenPomodoro = () => {
    startPomodoro()
    setIsOpen(false)
  }

  const handleCloseAction = () => {
    setActiveAction(null)
  }

  // Calculer la position du menu par rapport au bouton
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 768
  const menuStyle = {
    left: position.x < windowWidth / 2 ? position.x : 'auto',
    right: position.x >= windowWidth / 2 ? windowWidth - position.x - BUTTON_SIZE : 'auto',
    bottom: windowHeight - position.y + 16,
  }

  return (
    <>
      {/* Bouton principal déplaçable */}
      <button
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
        className={`fixed z-40 w-14 h-14 rounded-full shadow-2xl transition-all duration-150 flex items-center justify-center overflow-hidden select-none touch-none ${
          isOpen
            ? 'bg-red-500 hover:bg-red-600 rotate-45 border-4 border-red-400'
            : 'bg-white dark:bg-gray-800 border-4 border-orange-500'
        } ${isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab hover:scale-105'}`}
        style={{
          left: position.x,
          top: position.y,
          boxShadow: isOpen
            ? undefined
            : '0 10px 40px rgba(255, 112, 43, 0.4), 0 0 0 4px rgba(255, 112, 43, 0.2)',
        }}
        title="Actions rapides Shinkofa (glisser pour déplacer)"
        aria-label={isOpen ? 'Fermer menu' : 'Ouvrir menu actions rapides'}
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <Image
            src="/apple-touch-icon.png"
            alt="Shinkofa Sigle"
            width={48}
            height={48}
            className="w-10 h-10 object-contain pointer-events-none"
            draggable={false}
          />
        )}
        {/* Indicateur de drag (petit icône) */}
        {!isOpen && !isDragging && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
            <Move size={10} className="text-white" />
          </div>
        )}
      </button>

      {/* Menu d'actions (s'ouvre vers le haut depuis le bouton) */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-30 animate-fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu items */}
          <div
            className="fixed z-40 flex flex-col gap-3 animate-slide-up"
            style={menuStyle}
          >
            {/* Respiration guidée */}
            <button
              onClick={() => handleOpenAction('breathing')}
              className="flex items-center gap-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 pr-5 pl-4 py-3 hover:scale-105 group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Wind size={20} className="text-white" />
              </div>
              <span className="font-semibold text-sm whitespace-nowrap">Respiration</span>
            </button>

            {/* Check-in mental/physique */}
            <button
              onClick={() => handleOpenAction('check-in')}
              className="flex items-center gap-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 pr-5 pl-4 py-3 hover:scale-105 group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Activity size={20} className="text-white" />
              </div>
              <span className="font-semibold text-sm whitespace-nowrap">Check-in</span>
            </button>

            {/* Pomodoro */}
            <button
              onClick={handleOpenPomodoro}
              className="flex items-center gap-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 pr-5 pl-4 py-3 hover:scale-105 group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                <Timer size={20} className="text-white" />
              </div>
              <span className="font-semibold text-sm whitespace-nowrap">Pomodoro</span>
            </button>
          </div>
        </>
      )}

      {/* Modal Respiration */}
      {activeAction === 'breathing' && (
        <QuickBreathing onClose={handleCloseAction} />
      )}

      {/* Modal Check-in */}
      {activeAction === 'check-in' && (
        <QuickCheckIn onClose={handleCloseAction} />
      )}

      {/* Pomodoro - Affiche la modale si actif et non minimisé */}
      {isActive && !isMinimized && (
        <QuickPomodoro />
      )}

      {/* Pomodoro - Affiche le widget minimisé si actif et minimisé */}
      {isActive && isMinimized && (
        <MinimizedPomodoro />
      )}
    </>
  )
}
