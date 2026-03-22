'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    handleCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCallback() {
    try {
      const supabase = createClient()

      // Get the authenticated session (handles OAuth code exchange automatically)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        setError('Erreur d\'authentification. Veuillez reessayer.')
        return
      }

      const authUser = session.user
      const email = authUser.email || null
      const phone = authUser.phone || null
      const fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || ''
      const avatarUrl = authUser.user_metadata?.avatar_url || null
      const authProvider = authUser.app_metadata?.provider || 'unknown'

      // Call our API to create or get the user, set JWT session cookie
      const referralCode = localStorage.getItem('howner_referral') || ''

      const res = await fetch('/api/auth/oauth-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone,
          name: fullName,
          avatar_url: avatarUrl,
          auth_provider: authProvider,
          referralCode,
          supabase_uid: authUser.id,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Clear referral code after use
      localStorage.removeItem('howner_referral')

      router.push('/annonces')
    } catch (e) {
      console.error('Auth callback error:', e)
      setError(e instanceof Error ? e.message : 'Erreur d\'authentification')
    }
  }

  if (error) {
    return (
      <div className="login-page">
        <div className="login-wrapper">
          <div className="login-header">
            <div className="login-logo">HOWNER</div>
          </div>
          <div className="card form-card">
            <div className="error-box">{error}</div>
            <button onClick={() => router.push('/login')} className="btn-primary full-width" style={{ marginTop: 16 }}>
              Retour a la connexion
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-header">
          <div className="login-logo">HOWNER</div>
          <p className="login-subtitle">Connexion en cours...</p>
        </div>
      </div>
    </div>
  )
}
