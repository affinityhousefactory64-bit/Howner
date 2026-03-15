'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/context'
import Nav from '@/components/Nav'
import { CREDIT_PACKS } from '@/lib/stripe'
import { AI_SERVICES } from '@/lib/claude'

type AIServiceId = typeof AI_SERVICES[number]['id']

export default function DashboardPage() {
  const { user, loading, refresh } = useUser()
  const router = useRouter()
  const [activeService, setActiveService] = useState<AIServiceId | null>(null)
  const [aiInput, setAiInput] = useState('')
  const [aiResult, setAiResult] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [buyingPack, setBuyingPack] = useState<string | null>(null)

  if (loading) return <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontFamily: 'var(--b)', color: 'rgba(255,255,255,.3)' }}>Chargement...</div></div>

  if (!user) {
    router.push('/login')
    return null
  }

  async function handleBuyPack(packId: string) {
    setBuyingPack(packId)
    try {
      const res = await fetch('/api/credits/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      alert('Erreur de paiement')
    } finally {
      setBuyingPack(null)
    }
  }

  async function handleAI() {
    if (!activeService || !aiInput.trim() || !user) return
    if (user.credits < 1) {
      alert('Pas assez de crédits. Achetez un pack ci-dessous.')
      return
    }
    setAiLoading(true)
    setAiResult('')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: activeService, input: aiInput }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAiResult(data.result)
      await refresh()
    } catch (e) {
      setAiResult(`Erreur: ${e instanceof Error ? e.message : 'Erreur inconnue'}`)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#fff' }}>
      <Nav />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '28px 18px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--d)', fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Salut, {user.name || 'voyageur'} 👋</h1>
            <p style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.3)' }}>
              {user.type === 'particulier' ? 'Compte particulier' : `Compte ${user.type}`} · {user.phone}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--m)', fontSize: 9, color: 'rgba(255,255,255,.2)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Code parrainage</div>
            <div style={{ fontFamily: 'var(--m)', fontSize: 11, color: 'var(--a)', marginTop: 2 }}>{user.referral_code}</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <div style={{ flex: 1, background: 'rgba(207,175,75,.04)', border: '1px solid rgba(207,175,75,.1)', borderRadius: 12, padding: '16px 14px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--m)', fontSize: 28, color: 'var(--a)' }}>{user.credits}</div>
            <div style={{ fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.25)', marginTop: 2 }}>CRÉDITS IA</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(168,139,250,.04)', border: '1px solid rgba(168,139,250,.1)', borderRadius: 12, padding: '16px 14px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--m)', fontSize: 28, color: '#a78bfa' }}>{user.tickets}</div>
            <div style={{ fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.25)', marginTop: 2 }}>TICKETS JEU</div>
          </div>
        </div>

        {/* AI Services */}
        <h2 style={{ fontFamily: 'var(--d)', fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Services IA</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {AI_SERVICES.map((s) => (
            <button
              key={s.id}
              onClick={() => { setActiveService(s.id as AIServiceId); setAiResult('') }}
              style={{
                padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                background: activeService === s.id ? 'rgba(207,175,75,.1)' : 'rgba(255,255,255,.015)',
                border: activeService === s.id ? '1px solid rgba(207,175,75,.3)' : '1px solid rgba(255,255,255,.05)',
                fontFamily: 'var(--b)', fontSize: 10, fontWeight: activeService === s.id ? 700 : 500,
                color: activeService === s.id ? 'var(--a)' : 'rgba(255,255,255,.35)',
              }}
            >
              {s.name}
            </button>
          ))}
        </div>

        {activeService && (
          <div style={{ background: 'rgba(255,255,255,.015)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 12, padding: '16px 14px', marginBottom: 24 }}>
            <p style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.3)', marginBottom: 10 }}>
              {AI_SERVICES.find((s) => s.id === activeService)?.description} · Coûte 1 crédit
            </p>
            <textarea
              placeholder="Décris ton besoin en détail... (ville, budget, type de bien, critères...)"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: '#fff', fontFamily: 'var(--b)', fontSize: 12, outline: 'none', resize: 'vertical', marginBottom: 10 }}
            />
            <button
              onClick={handleAI}
              disabled={aiLoading || !aiInput.trim() || user.credits < 1}
              style={{ padding: '10px 20px', background: user.credits < 1 ? 'rgba(255,255,255,.05)' : aiLoading ? 'rgba(207,175,75,.3)' : 'linear-gradient(135deg, var(--a), #b8932e)', border: 'none', borderRadius: 8, color: user.credits < 1 ? 'rgba(255,255,255,.3)' : '#0a0e1a', fontFamily: 'var(--b)', fontWeight: 700, fontSize: 11, cursor: user.credits < 1 ? 'not-allowed' : 'pointer' }}
            >
              {aiLoading ? 'Analyse en cours...' : user.credits < 1 ? 'Pas de crédits — Acheter ci-dessous' : `Lancer l'analyse (1 crédit)`}
            </button>

            {aiResult && (
              <div style={{ marginTop: 14, padding: '14px', background: 'rgba(207,175,75,.03)', border: '1px solid rgba(207,175,75,.08)', borderRadius: 10 }}>
                <div style={{ fontFamily: 'var(--b)', fontSize: 9, color: 'var(--a)', fontWeight: 700, marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>Résultat IA</div>
                <div style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{aiResult}</div>
              </div>
            )}
          </div>
        )}

        {/* Credit Packs */}
        <h2 style={{ fontFamily: 'var(--d)', fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Acheter des crédits</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {CREDIT_PACKS.map((pack) => (
            <div key={pack.id} style={{ flex: '1 1 140px', maxWidth: 170, background: 'rgba(255,255,255,.015)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 10, padding: '14px 12px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 12, color: '#fff', marginBottom: 2 }}>{pack.name}</div>
              <div style={{ fontFamily: 'var(--m)', fontSize: 22, color: 'var(--a)', marginBottom: 2 }}>{pack.priceLabel}</div>
              <div style={{ fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.25)', marginBottom: 8 }}>{pack.credits} cr + {pack.tickets} tk</div>
              <button
                onClick={() => handleBuyPack(pack.id)}
                disabled={buyingPack === pack.id}
                style={{ width: '100%', padding: '7px 0', background: 'rgba(207,175,75,.08)', border: '1px solid rgba(207,175,75,.15)', borderRadius: 6, fontFamily: 'var(--b)', fontWeight: 700, fontSize: 10, color: 'var(--a)', cursor: 'pointer' }}
              >
                {buyingPack === pack.id ? '...' : 'Acheter'}
              </button>
            </div>
          ))}
        </div>

        {/* Referral */}
        <div style={{ background: 'rgba(207,175,75,.04)', border: '1px solid rgba(207,175,75,.1)', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 4 }}>🎁 Parraine un ami = 1 ticket chacun</div>
          <div style={{ fontFamily: 'var(--m)', fontSize: 11, color: 'var(--a)', background: 'rgba(255,255,255,.03)', padding: '8px 12px', borderRadius: 6, marginTop: 8 }}>
            {typeof window !== 'undefined' ? window.location.origin : ''}/login?ref={user.referral_code}
          </div>
        </div>
      </div>
    </div>
  )
}
