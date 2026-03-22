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
      // Try Supabase OTP first
      const supabase = createClient()
      const { error: otpError } = await supabase.auth.signInWithOtp({ phone })
      if (!otpError) {
        setNormalizedPhone(phone)
        setStep('sms-code')
        setLoading(false)
        return
      }
      // Fallback to existing Twilio flow
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
      // Try Supabase OTP verification first
      const supabase = createClient()
      const { error: otpError } = await supabase.auth.verifyOtp({
        phone: normalizedPhone,
        token: code,
        type: 'sms',
      })
      if (!otpError) {
        // Supabase OTP verified — redirect to callback to handle user creation
        router.push('/auth/callback')
        return
      }
      // Fallback to existing Twilio verify flow
      const referralCode = localStorage.getItem('howner_referral') || ''
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone, code, name: '', type: 'particulier', referralCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/annonces')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Code invalide')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-wrapper">
        {/* Logo */}
        <div className="login-header">
          <div className="login-logo">HOWNER</div>
          <h1 className="heading-lg" style={{ marginBottom: 6 }}>Rejoignez Howner</h1>
          <p className="text-gold text-sm" style={{ textAlign: 'center', marginBottom: 20 }}>
            1 ticket offert + 1ère annonce gratuite
          </p>
        </div>

        {/* Main — 3 auth buttons */}
        {step === 'main' && (
          <div className="card form-card">
            <button onClick={handleGoogle} className="oauth-btn oauth-google full-width mb-10">
              <svg width="18" height="18" viewBox="0 0 48 48" className="oauth-icon">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continuer avec Google
            </button>

            <button onClick={handleApple} className="oauth-btn oauth-apple full-width mb-10">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="oauth-icon">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-2.12 4.53-3.74 4.25z"/>
              </svg>
              Continuer avec Apple
            </button>

            <button onClick={() => setStep('sms-phone')} className="btn-secondary full-width">
              Continuer avec mon numéro
            </button>

            {error && <div className="error-box">{error}</div>}

            <p className="login-legal">
              En continuant, vous acceptez les{' '}
              <a href="/cgu" className="text-gold">CGU</a> et la{' '}
              <a href="/confidentialite" className="text-gold">politique de confidentialité</a>
            </p>
          </div>
        )}

        {/* SMS — phone input */}
        {step === 'sms-phone' && (
          <div className="card form-card">
            <label className="form-label">Numéro de téléphone</label>
            <input
              type="tel"
              placeholder="06 12 34 56 78"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendSmsCode()}
              className="mb-12"
              autoFocus
            />
            <button
              onClick={sendSmsCode}
              disabled={loading || !phone}
              className={`btn-primary full-width mb-8 ${loading || !phone ? 'opacity-50' : ''}`}
            >
              {loading ? 'Envoi...' : 'Envoyer le code'}
            </button>
            <button onClick={() => { setStep('main'); setError('') }} className="ghost-btn">
              &larr; Retour
            </button>
            {error && <div className="error-box">{error}</div>}
          </div>
        )}

        {/* SMS — code verification */}
        {step === 'sms-code' && (
          <div className="card form-card">
            <label className="form-label">Code de vérification</label>
            <p className="login-subtitle mb-12">Code envoye au {normalizedPhone}</p>
            <input
              type="text"
              placeholder="123456"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && verifySmsCode()}
              autoFocus
              className="code-input mb-12"
            />
            <button
              onClick={verifySmsCode}
              disabled={loading || code.length < 4}
              className={`btn-primary full-width mb-8 ${loading || code.length < 4 ? 'opacity-50' : ''}`}
            >
              {loading ? 'Vérification...' : 'Vérifier'}
            </button>
            <button onClick={() => { setStep('sms-phone'); setCode(''); setError('') }} className="ghost-btn">
              &larr; Changer de numéro
            </button>
            {error && <div className="error-box">{error}</div>}
          </div>
        )}

        {/* Trust */}
        <div className="trust-line">
          Connexion sécurisée · Données protégées
        </div>
      </div>
    </div>
  )
}
