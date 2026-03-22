'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

type Step = 'main' | 'sms-phone' | 'sms-code'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('main')
  const [phone, setPhone] = useState('')
  const [normalizedPhone, setNormalizedPhone] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Store referral code in localStorage on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      localStorage.setItem('howner_referral', ref)
    }
  }, [])

  async function handleGoogle() {
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    })
    if (error) setError(error.message)
  }

  async function handleApple() {
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    })
    if (error) setError(error.message)
  }

  async function sendSmsCode() {
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: otpError } = await supabase.auth.signInWithOtp({ phone })
      if (!otpError) {
        setNormalizedPhone(phone)
        setStep('sms-code')
        setLoading(false)
        return
      }
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNormalizedPhone(data.phone)
      setStep('sms-code')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l\'envoi du SMS')
    } finally {
      setLoading(false)
    }
  }

  async function verifySmsCode() {
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: otpError } = await supabase.auth.verifyOtp({
        phone: normalizedPhone,
        token: code,
        type: 'sms',
      })
      if (!otpError) {
        router.push('/compte')
        return
      }
      const referralCode = localStorage.getItem('howner_referral') || ''
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone, code, name: '', type: 'particulier', referralCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/compte')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Code invalide')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#191C1F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
    }}>
      <div style={{ maxWidth: 400, width: '100%' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 28,
            fontWeight: 700,
            color: '#cfaf4b',
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}>
            HOWNER
          </div>
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(24px, 5vw, 32px)',
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '-0.02em',
            marginBottom: 6,
          }}>
            Rejoignez Howner
          </h1>
          <p style={{
            fontSize: 14,
            color: '#cfaf4b',
            fontWeight: 600,
          }}>
            1 credit + 1 ticket offerts a l&apos;inscription
          </p>
        </div>

        {/* Main — 3 auth buttons */}
        {step === 'main' && (
          <div style={{
            background: '#1E2228',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,.06)',
            padding: '28px 24px',
          }}>
            {/* Google */}
            <button
              onClick={handleGoogle}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '14px 20px',
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "'Syne', sans-serif",
                color: '#191C1F',
                background: 'linear-gradient(135deg, #cfaf4b, #e8d58c)',
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
                marginBottom: 12,
                letterSpacing: '-0.01em',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continuer avec Google
            </button>

            {/* Apple */}
            <button
              onClick={handleApple}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '14px 20px',
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "'Syne', sans-serif",
                color: '#fff',
                background: '#000',
                border: '1px solid rgba(255,255,255,.12)',
                borderRadius: 12,
                cursor: 'pointer',
                marginBottom: 12,
                letterSpacing: '-0.01em',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0 }}>
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-2.12 4.53-3.74 4.25z"/>
              </svg>
              Continuer avec Apple
            </button>

            {/* SMS */}
            <button
              onClick={() => setStep('sms-phone')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '14px 20px',
                fontSize: 15,
                fontWeight: 600,
                fontFamily: "'Syne', sans-serif",
                color: 'rgba(255,255,255,.7)',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,.12)',
                borderRadius: 12,
                cursor: 'pointer',
                letterSpacing: '-0.01em',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Continuer avec mon numero
            </button>

            {error && (
              <div style={{
                marginTop: 16,
                padding: '10px 14px',
                background: 'rgba(239,68,68,.1)',
                border: '1px solid rgba(239,68,68,.2)',
                borderRadius: 8,
                color: '#ef4444',
                fontSize: 13,
                textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            <p style={{
              fontSize: 11,
              color: 'rgba(255,255,255,.3)',
              textAlign: 'center',
              marginTop: 20,
              lineHeight: 1.6,
            }}>
              En continuant, vous acceptez les{' '}
              <a href="/cgu" style={{ color: '#cfaf4b', textDecoration: 'none' }}>CGU</a> et la{' '}
              <a href="/confidentialite" style={{ color: '#cfaf4b', textDecoration: 'none' }}>politique de confidentialite</a>
            </p>
          </div>
        )}

        {/* SMS — phone input */}
        {step === 'sms-phone' && (
          <div style={{
            background: '#1E2228',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,.06)',
            padding: '28px 24px',
          }}>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: 'rgba(255,255,255,.5)',
              marginBottom: 8,
              fontFamily: "'Syne', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              Numero de telephone
            </label>
            <input
              type="tel"
              placeholder="06 12 34 56 78"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendSmsCode()}
              autoFocus
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 16,
                fontFamily: "'JetBrains Mono', monospace",
                color: '#fff',
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 10,
                outline: 'none',
                marginBottom: 16,
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={sendSmsCode}
              disabled={loading || !phone}
              style={{
                width: '100%',
                padding: '14px 20px',
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "'Syne', sans-serif",
                color: '#191C1F',
                background: loading || !phone
                  ? 'rgba(207,175,75,.4)'
                  : 'linear-gradient(135deg, #cfaf4b, #e8d58c)',
                border: 'none',
                borderRadius: 12,
                cursor: loading || !phone ? 'not-allowed' : 'pointer',
                marginBottom: 12,
                opacity: loading || !phone ? 0.5 : 1,
              }}
            >
              {loading ? 'Envoi...' : 'Envoyer le code'}
            </button>
            <button
              onClick={() => { setStep('main'); setError('') }}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "'Syne', sans-serif",
                color: 'rgba(255,255,255,.3)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Retour
            </button>
            {error && (
              <div style={{
                marginTop: 12,
                padding: '10px 14px',
                background: 'rgba(239,68,68,.1)',
                border: '1px solid rgba(239,68,68,.2)',
                borderRadius: 8,
                color: '#ef4444',
                fontSize: 13,
                textAlign: 'center',
              }}>
                {error}
              </div>
            )}
          </div>
        )}

        {/* SMS — code verification */}
        {step === 'sms-code' && (
          <div style={{
            background: '#1E2228',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,.06)',
            padding: '28px 24px',
          }}>
            <label style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: 'rgba(255,255,255,.5)',
              marginBottom: 6,
              fontFamily: "'Syne', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              Code de verification
            </label>
            <p style={{
              fontSize: 13,
              color: 'rgba(255,255,255,.4)',
              marginBottom: 16,
            }}>
              Code envoye au {normalizedPhone}
            </p>
            <input
              type="text"
              placeholder="123456"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && verifySmsCode()}
              autoFocus
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 24,
                fontFamily: "'JetBrains Mono', monospace",
                color: '#fff',
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 10,
                outline: 'none',
                marginBottom: 16,
                textAlign: 'center',
                letterSpacing: '0.3em',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={verifySmsCode}
              disabled={loading || code.length < 4}
              style={{
                width: '100%',
                padding: '14px 20px',
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "'Syne', sans-serif",
                color: '#191C1F',
                background: loading || code.length < 4
                  ? 'rgba(207,175,75,.4)'
                  : 'linear-gradient(135deg, #cfaf4b, #e8d58c)',
                border: 'none',
                borderRadius: 12,
                cursor: loading || code.length < 4 ? 'not-allowed' : 'pointer',
                marginBottom: 12,
                opacity: loading || code.length < 4 ? 0.5 : 1,
              }}
            >
              {loading ? 'Verification...' : 'Verifier'}
            </button>
            <button
              onClick={() => { setStep('sms-phone'); setCode(''); setError('') }}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "'Syne', sans-serif",
                color: 'rgba(255,255,255,.3)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Changer de numero
            </button>
            {error && (
              <div style={{
                marginTop: 12,
                padding: '10px 14px',
                background: 'rgba(239,68,68,.1)',
                border: '1px solid rgba(239,68,68,.2)',
                borderRadius: 8,
                color: '#ef4444',
                fontSize: 13,
                textAlign: 'center',
              }}>
                {error}
              </div>
            )}
          </div>
        )}

        {/* Trust line */}
        <div style={{
          textAlign: 'center',
          fontSize: 11,
          color: 'rgba(255,255,255,.2)',
          marginTop: 20,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.02em',
        }}>
          Connexion securisee -- Donnees protegees
        </div>
      </div>
    </div>
  )
}
