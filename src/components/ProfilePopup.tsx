'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUser } from '@/lib/context'

const DISMISS_KEY = 'howner_profile_popup_dismissed'

export default function ProfilePopup() {
  const { user, loading } = useUser()
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const wasDismissed = localStorage.getItem(DISMISS_KEY) === '1'
    setDismissed(wasDismissed)
  }, [])

  if (loading || !user) return null
  if (dismissed) return null

  // Profile is considered incomplete if type is still default 'particulier' and no name set,
  // or if user has no name at all
  const isIncomplete = !user.name || (user.type === 'particulier' && !user.pro_category && user.credits === 0 && user.tickets <= 1)
  if (!isIncomplete) return null

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 80,
      left: 16,
      right: 16,
      maxWidth: 420,
      margin: '0 auto',
      zIndex: 900,
      background: 'rgba(15, 18, 30, 0.95)',
      border: '1px solid rgba(207,175,75,.2)',
      borderRadius: 14,
      padding: '14px 16px',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      animation: 'fadeIn .4s ease',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4, lineHeight: 1.3 }}>
          Complétez votre profil en 30 secondes
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', lineHeight: 1.4 }}>
          Pour matcher avec les bonnes personnes
        </div>
      </div>
      <Link href="/compte" onClick={() => {
        const params = new URLSearchParams(window.location.search)
        params.set('tab', 'profil')
      }} style={{
        padding: '8px 14px',
        fontSize: 11,
        fontWeight: 700,
        background: 'var(--a)',
        color: '#0a0e1a',
        borderRadius: 8,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}>
        Compléter →
      </Link>
      <button onClick={handleDismiss} style={{
        background: 'none',
        border: 'none',
        color: 'rgba(255,255,255,.3)',
        fontSize: 18,
        cursor: 'pointer',
        padding: '0 2px',
        lineHeight: 1,
        flexShrink: 0,
      }}>
        ×
      </button>
    </div>
  )
}
