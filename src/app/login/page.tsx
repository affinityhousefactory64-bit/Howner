'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/context'

type Step = 'phone' | 'code' | 'profile'

export default function LoginPage() {
  const router = useRouter()
  const { refresh } = useUser()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('phone') || ''
    }
    return ''
  })
  const [normalizedPhone, setNormalizedPhone] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState<'particulier' | 'artisan' | 'agent' | 'promoteur' | 'courtier'>(() => {
    if (typeof window !== 'undefined') {
      const t = new URLSearchParams(window.location.search).get('type')
      if (t === 'pro') return 'agent'
    }
    return 'particulier'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [referralCode] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('ref') || ''
    }
    return ''
  })

  async function sendCode() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNormalizedPhone(data.phone)
      setStep('code')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur envoi SMS')
    } finally {
      setLoading(false)
    }
  }

  async function verifyCode() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone, code, name, type, referralCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (data.isNew && !name) {
        // New user without name — show profile step
        setStep('profile')
        return
      }

      await refresh()
      router.push('/dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Code invalide')
    } finally {
      setLoading(false)
    }
  }

  async function completeProfile() {
    setError('')
    setLoading(true)
    try {
      // Re-verify with profile info
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone, code, name, type, referralCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      await refresh()
      router.push('/dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
      <div style={{ maxWidth: 380, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: 'var(--m)', fontSize: 18, color: 'var(--a)', fontWeight: 700, marginBottom: 6 }}>HOWNER</div>
          <h1 style={{ fontFamily: 'var(--d)', fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
            {step === 'phone' && 'Connexion'}
            {step === 'code' && 'Code SMS'}
            {step === 'profile' && 'Ton profil'}
          </h1>
          <p style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.3)' }}>
            {step === 'phone' && '1 crédit IA + 1 ticket offerts à l\'inscription'}
            {step === 'code' && `Code envoyé au ${normalizedPhone}`}
            {step === 'profile' && 'Dernière étape avant de commencer'}
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,.015)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: '24px 20px' }}>
          {step === 'phone' && (
            <>
              <label style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.3)', marginBottom: 6, display: 'block' }}>Numéro de téléphone</label>
              <input
                type="tel"
                placeholder="06 12 34 56 78"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendCode()}
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 9, color: '#fff', fontFamily: 'var(--b)', fontSize: 14, outline: 'none', marginBottom: 12 }}
              />
              <button
                onClick={sendCode}
                disabled={loading || !phone}
                style={{ width: '100%', padding: '12px 0', background: loading ? 'rgba(207,175,75,.3)' : 'linear-gradient(135deg, var(--a), #b8932e)', border: 'none', borderRadius: 9, color: '#0a0e1a', fontFamily: 'var(--b)', fontWeight: 800, fontSize: 13, cursor: loading ? 'wait' : 'pointer' }}
              >
                {loading ? 'Envoi...' : 'Recevoir le code SMS'}
              </button>
            </>
          )}

          {step === 'code' && (
            <>
              <label style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.3)', marginBottom: 6, display: 'block' }}>Code de vérification</label>
              <input
                type="text"
                placeholder="123456"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && verifyCode()}
                autoFocus
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 9, color: '#fff', fontFamily: 'var(--m)', fontSize: 22, textAlign: 'center', letterSpacing: 8, outline: 'none', marginBottom: 12 }}
              />
              <button
                onClick={verifyCode}
                disabled={loading || code.length < 4}
                style={{ width: '100%', padding: '12px 0', background: loading ? 'rgba(207,175,75,.3)' : 'linear-gradient(135deg, var(--a), #b8932e)', border: 'none', borderRadius: 9, color: '#0a0e1a', fontFamily: 'var(--b)', fontWeight: 800, fontSize: 13, cursor: loading ? 'wait' : 'pointer', marginBottom: 8 }}
              >
                {loading ? 'Vérification...' : 'Vérifier'}
              </button>
              <button
                onClick={() => { setStep('phone'); setCode('') }}
                style={{ width: '100%', padding: '8px 0', background: 'none', border: 'none', color: 'rgba(255,255,255,.25)', fontFamily: 'var(--b)', fontSize: 10, cursor: 'pointer' }}
              >
                ← Changer de numéro
              </button>
            </>
          )}

          {step === 'profile' && (
            <>
              <label style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.3)', marginBottom: 6, display: 'block' }}>Ton nom</label>
              <input
                type="text"
                placeholder="Prénom ou entreprise"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 9, color: '#fff', fontFamily: 'var(--b)', fontSize: 14, outline: 'none', marginBottom: 12 }}
              />
              <label style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.3)', marginBottom: 6, display: 'block' }}>Tu es...</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {([['particulier', '👤 Particulier'], ['artisan', '🔧 Artisan'], ['agent', '🏠 Agent immo'], ['promoteur', '🏗️ Promoteur'], ['courtier', '💰 Courtier']] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setType(val)}
                    style={{
                      padding: '6px 10px', borderRadius: 7, cursor: 'pointer',
                      background: type === val ? 'rgba(207,175,75,.1)' : 'rgba(255,255,255,.02)',
                      border: type === val ? '1px solid rgba(207,175,75,.3)' : '1px solid rgba(255,255,255,.06)',
                      fontFamily: 'var(--b)', fontSize: 10, fontWeight: type === val ? 700 : 500,
                      color: type === val ? 'var(--a)' : 'rgba(255,255,255,.35)',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={completeProfile}
                disabled={loading || !name}
                style={{ width: '100%', padding: '12px 0', background: loading ? 'rgba(207,175,75,.3)' : 'linear-gradient(135deg, var(--a), #b8932e)', border: 'none', borderRadius: 9, color: '#0a0e1a', fontFamily: 'var(--b)', fontWeight: 800, fontSize: 13, cursor: loading ? 'wait' : 'pointer' }}
              >
                {loading ? 'Création...' : '🎁 Créer mon compte'}
              </button>
            </>
          )}

          {error && (
            <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.15)', borderRadius: 7, fontFamily: 'var(--b)', fontSize: 11, color: '#ef4444' }}>{error}</div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 14, fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.12)' }}>
          Vérification par SMS · 1 compte = 1 numéro · Gratuit
        </div>
      </div>
    </div>
  )
}
