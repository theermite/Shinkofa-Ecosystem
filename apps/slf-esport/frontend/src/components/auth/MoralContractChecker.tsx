/**
 * MoralContractChecker - Wrapper component that checks if user has accepted the moral contract
 * Displays MoralContractModal if not accepted
 */

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types/user'
import MoralContractModal from '@/components/modals/MoralContractModal'

interface MoralContractCheckerProps {
  children: React.ReactNode
}

export default function MoralContractChecker({ children }: MoralContractCheckerProps) {
  const { user, isAuthenticated, fetchCurrentUser } = useAuthStore()
  const [showModal, setShowModal] = useState(false)

  // Check if moral contract needs to be accepted
  useEffect(() => {
    if (isAuthenticated && user) {
      // Staff (Manager/Coach) automatically have contract accepted
      // Only check for players (JOUEUR)
      if (user.role === UserRole.JOUEUR && !user.moral_contract_accepted) {
        setShowModal(true)
      } else {
        setShowModal(false)
      }
    }
  }, [isAuthenticated, user])

  const handleAccept = async () => {
    // Refresh user data to get updated contract status
    await fetchCurrentUser()
    setShowModal(false)
  }

  const token = localStorage.getItem('access_token')

  return (
    <>
      {children}
      {showModal && token && (
        <MoralContractModal
          isOpen={showModal}
          onAccept={handleAccept}
          token={token}
        />
      )}
    </>
  )
}
