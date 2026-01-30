'use client'

import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  const handleClearAndReload = () => {
    try {
      // Clear all potentially corrupted data
      localStorage.clear()
      sessionStorage.clear()
    } catch {
      // Ignore storage errors
    }
    window.location.href = '/'
  }

  return (
    <html lang="fr">
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #f3e8ff 100%)',
          padding: '1rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '2rem',
            maxWidth: '28rem',
            width: '100%',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔧</div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1rem',
            }}>
              Erreur Critique
            </h1>
            <p style={{
              color: '#6b7280',
              marginBottom: '1.5rem',
            }}>
              L&apos;application a rencontré une erreur inattendue.
              Cliquez sur le bouton ci-dessous pour réinitialiser.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={reset}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#2563eb',
                  color: 'white',
                  fontWeight: '600',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Réessayer
              </button>
              <button
                onClick={handleClearAndReload}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#e5e7eb',
                  color: '#374151',
                  fontWeight: '600',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Réinitialiser toutes les données
              </button>
            </div>

            <p style={{
              fontSize: '0.75rem',
              color: '#9ca3af',
              marginTop: '1.5rem',
            }}>
              Code erreur: {error.digest || 'N/A'}
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
