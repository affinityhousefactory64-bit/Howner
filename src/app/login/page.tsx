'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/context'

type Step = 'phone' | 'code' | 'profile'
type UserType = 'particulier' | 'pro'
type ProType = 'artisan' | 'agent' | 'courtier' | 'promoteur'

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
  const [type, setType] = useState<UserType>('particulier')
  const [proType, setProType] = useState<ProType | null>(null)
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
        body: JSON.stringify({ phone: normalizedPhone, code, name, type, proType, referralCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (data.isNew && !name) {
        setStep('profile')
        return
      }

      await refresh()
      router.push('/compte')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Code invalide')
    } finally {
      setLoading(false)
    }
  }

  async function completeProfile() {
    setError('')
    if (type === 'pro' && !proType) {
      setError('Choisis ton type de pro')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone, code, name, type, proType, referralCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      await refresh()
      router.push('/compte')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const btnGold = (isLoading: boolean) => ({
    width: '100%' as const,
    padding: '12px 0',
    background: isLoading ? 'rgba(207,175,75,.3)' : 'linear-gradient(135deg, var(--a), #b8932e)',
    border: 'none' as const,
    borderRadius: 9,
    color: '#060a13',
    fontFamily: 'var(--b)',
    fontWeight: 800 as const,
    fontSize: 13,
    cursor: isLoading ? 'wait' as const : 'pointer' as const,
  })

  const inputStyle = {
    width: '100%' as const,
    padding: '12px 14px',
    background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: 9,
    color: '#fff',
    fontFamily: 'var(--b)',
    fontSize: 14,
    outline: 'none' as const,
    marginBottom: 12,
  }

  const labelStyle = {
    fontFamily: 'var(--b)',
    fontSize: 10,
    color: 'rgba(255,255,255,.3)',
    marginBottom: 6,
    display: 'block' as const,
  }

  function typeBtn(active: boolean) {
    return {
      flex: '1 1 45%',
      padding: '10px 12px',
      borderRadius: 9,
      cursor: 'pointer' as const,
      background: active ? 'rgba(207,175,75,.1)' : 'rgba(255,255,255,.02)',
      border: active ? '1px solid rgba(207,175,75,.3)' : '1px solid rgba(255,255,255,.06)',
      fontFamily: 'var(--b)',
      fontSize: 12,
      fontWeight: active ? 700 as const : 500 as const,
      color: active ? 'var(--a)' : 'rgba(255,255,255,.35)',
    }
  }

  function subTypeBtn(active: boolean) {
    return {
      padding: '6px 10px',
      borderRadius: 7,
      cursor: 'pointer' as const,
      background: active ? 'rgba(207,175,75,.1)' : 'rgba(255,255,255,.02)',
      border: active ? '1px solid rgba(207,175,75,.3)' : '1px solid rgba(255,255,255,.06)',
      fontFamily: 'var(--b)',
      fontSize: 10,
      fontWeight: active ? 700 as const : 500 as const,
      color: active ? 'var(--a)' : 'rgba(255,255,255,.35)',
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060a13', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
      <div style={{ maxWidth: 380, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: 'var(--m)', fontSize: 18, color: 'var(--a)', fontWeight: 700, marginBottom: 6 }}>HOWNER</div>
          <h1 style={{ fontFamily: 'var(--d)', fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
            {step === 'phone' && 'Connexion'}
            {step === 'code' && 'Code SMS'}
            {step === 'profile' && 'Ton profil'}
          </h1>
          <p style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.3)' }}>
            {step === 'phone' && '1 ticket offert + 1\u00e8re annonce gratuite'}
            {step === 'code' && `Code envoye\u0301 au ${normalizedPhone}`}
            {step === 'profile' && 'Derni\u00e8re \u00e9tape avant de commencer'}
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,.015)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: '24px 20px' }}>
          {step === 'phone' && (
            <>
              <label style={labelStyle}>Num&eacute;ro de t&eacute;l&eacute;phone</label>
              <input
                type="tel"
                placeholder="06 12 34 56 78"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendCode()}
                style={inputStyle}
              />
              <button
                onClick={sendCode}
                disabled={loading || !phone}
                style={btnGold(loading)}
              >
                {loading ? 'Envoi...' : 'Recevoir le code SMS'}
              </button>
            </>
          )}

          {step === 'code' && (
            <>
              <label style={labelStyle}>Code de v&eacute;rification</label>
              <input
                type="text"
                placeholder="123456"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && verifyCode()}
                autoFocus
                style={{ ...inputStyle, fontFamily: 'var(--m)', fontSize: 22, textAlign: 'center' as const, letterSpacing: 8 }}
              />
              <button
                onClick={verifyCode}
                disabled={loading || code.length < 4}
                style={{ ...btnGold(loading), marginBottom: 8 }}
              >
                {loading ? 'V\u00e9rification...' : 'V\u00e9rifier'}
              </button>
              <button
                onClick={() => { setStep('phone'); setCode('') }}
                style={{ width: '100%', padding: '8px 0', background: 'none', border: 'none', color: 'rgba(255,255,255,.25)', fontFamily: 'var(--b)', fontSize: 10, cursor: 'pointer' }}
              >
                &larr; Changer de num&eacute;ro
              </button>
            </>
          )}

          {step === 'profile' && (
            <>
              <label style={labelStyle}>Ton nom</label>
              <input
                type="text"
                placeholder="Pr&eacute;nom ou entreprise"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                style={inputStyle}
              />

              <label style={labelStyle}>Tu es...</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <button onClick={() => { setType('particulier'); setProType(null) }} style={typeBtn(type === 'particulier')}>
                  Particulier
                </button>
                <button onClick={() => setType('pro')} style={typeBtn(type === 'pro')}>
                  Professionnel
                </button>
              </div>

              {type === 'pro' && (
                <>
                  <label style={labelStyle}>Type de pro</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                    {([
                      ['artisan', 'Artisan'],
                      ['agent', 'Agent immo'],
                      ['courtier', 'Courtier'],
                      ['promoteur', 'Promoteur'],
                    ] as const).map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => setProType(val)}
                        style={subTypeBtn(proType === val)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <button
                onClick={completeProfile}
                disabled={loading || !name}
                style={btnGold(loading)}
              >
                {loading ? 'Cr\u00e9ation...' : 'Cr\u00e9er mon compte'}
              </button>
            </>
          )}

          {error && (
            <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.15)', borderRadius: 7, fontFamily: 'var(--b)', fontSize: 11, color: '#ef4444' }}>{error}</div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 14, fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.12)' }}>
          V&eacute;rification par SMS &middot; 1 compte = 1 num&eacute;ro &middot; Gratuit
        </div>
      </div>
    </div>
  )
}
