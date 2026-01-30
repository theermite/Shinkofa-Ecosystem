/**
 * Back To Top Button - Discrete floating button
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useEffect, useState } from 'react'
import { ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackToTopProps {
  scrollContainer?: HTMLElement | null
}

export default function BackToTop({ scrollContainer }: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const target = scrollContainer || window

    const handleScroll = () => {
      const scrollTop = scrollContainer
        ? scrollContainer.scrollTop
        : window.scrollY
      setIsVisible(scrollTop > 300)
    }

    target.addEventListener('scroll', handleScroll, { passive: true })
    return () => target.removeEventListener('scroll', handleScroll)
  }, [scrollContainer])

  const scrollToTop = () => {
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        'fixed right-4 z-40 p-2 rounded-full',
        'bg-ermite-card dark:bg-ermite-card light:bg-gray-100',
        'border border-ermite-border dark:border-ermite-border light:border-gray-300',
        'text-ermite-text-secondary dark:text-ermite-text-secondary light:text-gray-700',
        'hover:bg-ermite-card-hover dark:hover:bg-ermite-card-hover light:hover:bg-gray-200',
        'hover:text-ermite-primary',
        'transition-all duration-300 shadow-lg',
        'touch-manipulation',
        // Position: above mobile nav on mobile, lower on desktop
        'bottom-20 lg:bottom-6',
        // Visibility animation
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
      )}
      aria-label="Retour en haut"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  )
}
