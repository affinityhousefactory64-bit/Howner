'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/context'

type Step = 'phone' | 'code' | 'type' | 'pro'
type UserType = 'particulier' | 'pro'
type ProType = 'agent' | 'courtier' | 'promoteur'

const PRO_CATEGORIES: [ProType, string][] = [
  ['agent', 'Agent immobilier'],
  ['courtier', 'Courtier'],
  ['promoteur', 'Promoteur'],
]

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
  const [proSpecialty, setProSpecialty] = useState('')
  const [proZone, setProZone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [referralCode] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('ref') || ''
    }
    return ''
  })

  const stepIndex = step === 'phone' ? 0 : step === 'code' ? 1 : step === 'type' ? 2 : 3
  const totalSteps = type === 'pro' ? 4 : 3

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
      setError(e instanceof Error ? e.message : 'Erreur lors de l&apos;envoi du SMS')
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
        body: JSON.stringify({ phone: normalizedPhone, code, name, type, proType, proSpecialty, proZone, referralCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (data.isNew && !name) {
        setStep('type')
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
    if (!name) {
      setError('Entrez votre nom ou celui de votre entreprise')
      return
    }
    if (type === 'pro' && !proType) {
      setError('Veuillez choisir votre type de professionnel')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone, code, name, type, proType, proSpecialty, proZone, referralCode }),
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

  function handleTypeChoice(t: UserType) {
    setType(t)
    setProType(null)
  }

  return (
    <div className="login-page">
      <div className="login-wrapper">
        {/* Logo */}
        <div className="login-header">
          <div className="login-logo">HOWNER</div>
          <h1 className="heading-lg mb-8">
            {step === 'phone' && 'Connexion'}
            {step === 'code' && 'Code SMS'}
            {step === 'type' && 'Votre profil'}
            {step === 'pro' && 'Détails professionnel'}
          </h1>
          <p className="login-subtitle">
            {step === 'phone' && '1 ticket offert + 1re annonce gratuite'}
            {step === 'code' && `Code envoyé au ${normalizedPhone}`}
            {step === 'type' && 'Dernière étape avant de commencer'}
            {step === 'pro' && 'Ces informations vous mettront en avant'}
          </p>
        </div>

        {/* Step progress */}
        <div className="step-dots">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`step-dot ${i === stepIndex ? 'active' : i < stepIndex ? 'done' : ''}`} />
          ))}
        </div>

        {/* Form card */}
        <div className="card form-card">
          {step === 'phone' && (
            <>
              <label className="form-label">Numéro de téléphone</label>
              <input
                type="tel"
                placeholder="06 12 34 56 78"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendCode()}
                className="mb-12"
              />
              <button
                onClick={sendCode}
                disabled={loading || !phone}
                className={`btn-primary full-width ${loading || !phone ? 'opacity-50' : ''}`}
              >
                {loading ? 'Envoi...' : 'Recevoir le code SMS'}
              </button>
            </>
          )}

          {step === 'code' && (
            <>
              <label className="form-label">Code de vérification</label>
              <input
                type="text"
                placeholder="123456"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && verifyCode()}
                autoFocus
                className="code-input mb-12"
              />
              <button
                onClick={verifyCode}
                disabled={loading || code.length < 4}
                className={`btn-primary full-width mb-8 ${loading || code.length < 4 ? 'opacity-50' : ''}`}
              >
                {loading ? 'Vérification...' : 'Vérifier'}
              </button>
              <button
                onClick={() => { setStep('phone'); setCode('') }}
                className="ghost-btn"
              >
                ← Changer de numéro
              </button>
            </>
          )}

          {step === 'type' && (
            <>
              <label className="form-label">Votre nom</label>
              <input
                type="text"
                placeholder="Prénom ou entreprise"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="mb-14"
              />

              <label className="form-label">Vous êtes...</label>
              <div className="flex gap-8 mb-14">
                <button
                  onClick={() => handleTypeChoice('particulier')}
                  className={`choice-btn ${type === 'particulier' ? 'selected' : ''}`}
                >
                  Particulier
                </button>
                <button
                  onClick={() => handleTypeChoice('pro')}
                  className={`choice-btn ${type === 'pro' ? 'selected' : ''}`}
                >
                  Professionnel
                </button>
              </div>

              {type === 'particulier' && (
                <button
                  onClick={completeProfile}
                  disabled={loading || !name}
                  className={`btn-primary full-width ${loading || !name ? 'opacity-50' : ''}`}
                >
                  {loading ? 'Création...' : 'Créer mon compte'}
                </button>
              )}

              {type === 'pro' && (
                <button
                  onClick={() => setStep('pro')}
                  disabled={!name}
                  className={`btn-primary full-width ${!name ? 'opacity-50' : ''}`}
                >
                  Continuer
                </button>
              )}
            </>
          )}

          {step === 'pro' && (
            <>
              <label className="form-label">Type de professionnel *</label>
              <div className="flex flex-wrap gap-6 mb-14">
                {PRO_CATEGORIES.map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setProType(val)}
                    className={`chip-btn ${proType === val ? 'selected' : ''}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <label className="form-label">Spécialité (optionnel)</label>
              <input
                type="text"
                placeholder="Ex : vente, location, prêt immobilier"
                value={proSpecialty}
                onChange={(e) => setProSpecialty(e.target.value)}
                className="mb-12"
              />

              <label className="form-label">Zone géographique (optionnel)</label>
              <input
                type="text"
                placeholder="Ex : Bayonne, Pays Basque"
                value={proZone}
                onChange={(e) => setProZone(e.target.value)}
                className="mb-14"
              />

              <div className="flex gap-8">
                <button
                  onClick={() => setStep('type')}
                  className="btn-secondary flex-1"
                >
                  ← Retour
                </button>
                <button
                  onClick={completeProfile}
                  disabled={loading || !proType}
                  className={`btn-primary flex-2 ${loading || !proType ? 'opacity-50' : ''}`}
                >
                  {loading ? 'Création...' : 'Créer mon compte'}
                </button>
              </div>
            </>
          )}

          {error && <div className="error-box">{error}</div>}
        </div>

        {/* Bonus line */}
        <div className="bonus-banner">
          <div className="bonus-banner-text">
            1 ticket offert à l&apos;inscription · 1re annonce gratuite
          </div>
        </div>

        {/* Trust */}
        <div className="trust-line">
          Vérification SMS · 1 compte = 1 numéro · Données sécurisées
        </div>
      </div>
    </div>
  )
}
