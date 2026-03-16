'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/lib/context'
import Nav from '@/components/Nav'
import { CREDIT_PACKS } from '@/lib/stripe'
import { AI_SERVICES } from '@/lib/claude'

type AIServiceId = typeof AI_SERVICES[number]['id']
type Tab = 'ai' | 'tickets' | 'history'

/* ═══ ANIMATED COUNTER ═══ */
function AnimNum({ value, color = 'var(--a)' }: { value: number; color?: string }) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)

  useEffect(() => {
    if (value === prev.current) return
    const start = prev.current
    const diff = value - start
    const t0 = Date.now()
    const animate = () => {
      const p = Math.min(1, (Date.now() - t0) / 600)
      setDisplay(Math.floor(start + diff * (1 - Math.pow(1 - p, 3))))
      if (p < 1) requestAnimationFrame(animate)
    }
    animate()
    prev.current = value
  }, [value])

  return <span style={{ fontFamily: 'var(--m)', fontSize: 34, color, fontWeight: 700, lineHeight: 1 }}>{display}</span>
}

export default function DashboardPage() {
  const { user, loading, refresh } = useUser()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('ai')
  const [activeService, setActiveService] = useState<AIServiceId | null>(null)
  const [aiInput, setAiInput] = useState('')
  const [aiResult, setAiResult] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [buyingPack, setBuyingPack] = useState<string | null>(null)
  const [history, setHistory] = useState<{ id: string; type: string; input: { query?: string }; output: { result?: string }; created_at: string }[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null)
  const [paymentBanner, setPaymentBanner] = useState<'success' | 'cancelled' | null>(null)

  // Check payment status from URL
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const payment = params.get('payment')
    if (payment === 'success') {
      setPaymentBanner('success')
      setTab('ai')
      refresh()
      window.history.replaceState({}, '', '/dashboard')
      setTimeout(() => setPaymentBanner(null), 6000)
    } else if (payment === 'cancelled') {
      setPaymentBanner('cancelled')
      window.history.replaceState({}, '', '/dashboard')
      setTimeout(() => setPaymentBanner(null), 4000)
    }
  }, [refresh])

  // Load history
  useEffect(() => {
    if (tab === 'history' && history.length === 0) {
      setHistoryLoading(true)
      fetch('/api/ai/history')
        .then(r => r.json())
        .then(d => setHistory(d.tasks || []))
        .catch(() => {})
        .finally(() => setHistoryLoading(false))
    }
  }, [tab, history.length])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#060a13', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--b)', color: 'rgba(255,255,255,.3)', fontSize: 13 }}>Chargement...</div>
    </div>
  )

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
    if (user.credits < 1) return
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

  function copyReferral() {
    const url = `${window.location.origin}/login?ref=${user!.referral_code}`
    navigator.clipboard.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const serviceNames: Record<string, string> = {
    search_buy: '🔍 Recherche bien',
    search_rent: '🏘️ Recherche location',
    search_artisan: '🔨 Artisan',
    bank_file: '💰 Dossier bancaire',
    quote_analysis: '📄 Analyse devis',
    property_analysis: '📊 Analyse bien',
  }

  const GAUGE_TOTAL = 200000
  const GAUGE_CURRENT = 4283 + (user.tickets || 0)
  const gaugePct = Math.min(100, (GAUGE_CURRENT / GAUGE_TOTAL) * 100)

  return (
    <div style={{ minHeight: '100vh', background: '#060a13', color: '#fff' }}>
      <Nav />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 18px 60px' }}>

        {/* ═══ PAYMENT BANNER ═══ */}
        {paymentBanner === 'success' && (
          <div style={{ background: 'rgba(52,211,153,.1)', border: '1px solid rgba(52,211,153,.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, animation: 'fadeIn .5s' }}>
            <span style={{ fontSize: 24 }}>🎉</span>
            <div>
              <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 14, color: '#34d399' }}>Paiement réussi !</div>
              <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.4)' }}>Tes crédits et tickets ont été ajoutés. Bonne chance pour le tirage !</div>
            </div>
          </div>
        )}
        {paymentBanner === 'cancelled' && (
          <div style={{ background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.15)', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>↩️</span>
            <div>
              <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 14, color: '#fbbf24' }}>Paiement annulé</div>
              <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.4)' }}>Pas de souci ! Tu peux réessayer quand tu veux.</div>
            </div>
          </div>
        )}

        {/* ═══ HEADER ═══ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--d)', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
              Salut, {user.name || 'voyageur'} 👋
            </h1>
            <p style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.35)' }}>
              {user.type === 'particulier' ? 'Compte particulier' : `Compte ${user.type}`}
            </p>
          </div>
        </div>

        {/* ═══ STATS CARDS ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
          {/* Credits */}
          <div style={{ background: 'linear-gradient(160deg, rgba(207,175,75,.08), rgba(6,10,19,.95))', border: '1px solid rgba(207,175,75,.15)', borderRadius: 14, padding: '18px 16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--a), transparent)' }} />
            <div style={{ fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.3)', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Crédits IA</div>
            <AnimNum value={user.credits} />
            <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.25)', marginTop: 4 }}>= {user.credits} service{user.credits > 1 ? 's' : ''} IA</div>
          </div>

          {/* Tickets */}
          <div style={{ background: 'rgba(168,139,250,.05)', border: '1px solid rgba(168,139,250,.12)', borderRadius: 14, padding: '18px 16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #a78bfa, transparent)' }} />
            <div style={{ fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.3)', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Tickets jeu</div>
            <AnimNum value={user.tickets} color="#a78bfa" />
            <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.25)', marginTop: 4 }}>chances de gagner</div>
          </div>

          {/* Referral */}
          <div style={{ background: 'rgba(52,211,153,.04)', border: '1px solid rgba(52,211,153,.1)', borderRadius: 14, padding: '18px 16px', cursor: 'pointer' }} onClick={copyReferral}>
            <div style={{ fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.3)', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Parrainage</div>
            <div style={{ fontFamily: 'var(--m)', fontSize: 16, color: '#34d399', fontWeight: 700 }}>{user.referral_code}</div>
            <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: copied ? '#34d399' : 'rgba(255,255,255,.25)', marginTop: 4, fontWeight: copied ? 700 : 400 }}>
              {copied ? '✓ Lien copié !' : 'Cliquer pour copier'}
            </div>
          </div>
        </div>

        {/* ═══ CONTEST GAUGE ═══ */}
        <div style={{ background: 'rgba(207,175,75,.03)', border: '1px solid rgba(207,175,75,.08)', borderRadius: 12, padding: '14px 16px', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399', animation: 'pulse 2s infinite' }} />
              <span style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>Villa 695 000€ · Tirage en cours</span>
            </div>
            <span style={{ fontFamily: 'var(--m)', fontSize: 11, color: 'var(--a)', fontWeight: 700 }}>{GAUGE_CURRENT.toLocaleString()} / {GAUGE_TOTAL.toLocaleString()}</span>
          </div>
          <div style={{ height: 6, borderRadius: 10, background: 'rgba(255,255,255,.05)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 10, background: 'linear-gradient(90deg, var(--a), #f5e6a3)', width: `${gaugePct}%`, transition: 'width 1s', boxShadow: '0 0 12px rgba(207,175,75,.25)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.2)' }}>Tes tickets : {user.tickets}</span>
            <span style={{ fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.2)' }}>Tirage sous huissier</span>
          </div>
        </div>

        {/* ═══ TABS ═══ */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,.02)', borderRadius: 10, padding: 3 }}>
          {([
            { id: 'ai' as Tab, label: '🤖 Services IA', desc: 'Utilise tes crédits' },
            { id: 'tickets' as Tab, label: '🎟️ Crédits & Tickets', desc: 'Acheter des crédits' },
            { id: 'history' as Tab, label: '📋 Historique', desc: 'Tes analyses' },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: '10px 8px', borderRadius: 8, cursor: 'pointer', border: 'none',
                background: tab === t.id ? 'rgba(207,175,75,.08)' : 'transparent',
                fontFamily: 'var(--b)', fontSize: 11, fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? 'var(--a)' : 'rgba(255,255,255,.35)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══ TAB: AI SERVICES ═══ */}
        {tab === 'ai' && (
          <div>
            {/* Service selector */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8, marginBottom: 16 }}>
              {AI_SERVICES.map(s => {
                const icons: Record<string, string> = { search_buy: '🔍', search_rent: '🏘️', search_artisan: '🔨', bank_file: '💰', quote_analysis: '📄', property_analysis: '📊' }
                const active = activeService === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => { setActiveService(s.id as AIServiceId); setAiResult('') }}
                    style={{
                      padding: '14px 12px', borderRadius: 10, cursor: 'pointer', border: 'none', textAlign: 'left',
                      background: active ? 'rgba(207,175,75,.08)' : 'rgba(255,255,255,.015)',
                      outline: active ? '1px solid rgba(207,175,75,.25)' : '1px solid rgba(255,255,255,.05)',
                    }}
                  >
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{icons[s.id] || '🤖'}</div>
                    <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 11, color: active ? 'var(--a)' : '#fff', marginBottom: 2 }}>{s.name}</div>
                    <div style={{ fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.3)', lineHeight: 1.4 }}>{s.description}</div>
                    <div style={{ marginTop: 6, fontFamily: 'var(--b)', fontSize: 9, color: '#34d399', fontWeight: 600 }}>1 cr · +1 ticket bonus</div>
                  </button>
                )
              })}
            </div>

            {/* AI Input */}
            {activeService && (
              <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: '20px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 13, color: '#fff' }}>
                    {serviceNames[activeService] || activeService}
                  </span>
                  <span style={{ fontFamily: 'var(--m)', fontSize: 9, color: user.credits > 0 ? 'var(--a)' : '#ef4444', fontWeight: 700 }}>
                    {user.credits > 0 ? `${user.credits} crédit${user.credits > 1 ? 's' : ''} dispo` : 'Pas de crédits'}
                  </span>
                </div>

                <textarea
                  placeholder="Décris ton besoin en détail... (ville, budget, type de bien, critères, projet...)"
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleAI() }}
                  rows={4}
                  style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, color: '#fff', fontFamily: 'var(--b)', fontSize: 13, outline: 'none', resize: 'vertical', marginBottom: 10, lineHeight: 1.6 }}
                />

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    onClick={handleAI}
                    disabled={aiLoading || !aiInput.trim() || user.credits < 1}
                    style={{
                      padding: '11px 22px',
                      background: user.credits < 1 ? 'rgba(255,255,255,.05)' : aiLoading ? 'rgba(207,175,75,.3)' : 'linear-gradient(135deg, var(--a), #b8932e)',
                      border: 'none', borderRadius: 9,
                      color: user.credits < 1 ? 'rgba(255,255,255,.3)' : '#0a0e1a',
                      fontFamily: 'var(--b)', fontWeight: 700, fontSize: 12,
                      cursor: user.credits < 1 ? 'not-allowed' : 'pointer',
                      boxShadow: user.credits > 0 && !aiLoading ? '0 2px 12px rgba(207,175,75,.2)' : 'none',
                    }}
                  >
                    {aiLoading ? '⏳ Analyse en cours...' : user.credits < 1 ? 'Pas de crédits' : 'Lancer l\'analyse (1 cr)'}
                  </button>
                  {user.credits < 1 && (
                    <button onClick={() => setTab('tickets')} style={{ padding: '11px 18px', background: 'rgba(207,175,75,.08)', border: '1px solid rgba(207,175,75,.15)', borderRadius: 9, fontFamily: 'var(--b)', fontWeight: 700, fontSize: 11, color: 'var(--a)', cursor: 'pointer' }}>
                      Acheter des crédits
                    </button>
                  )}
                </div>

                {/* AI Result */}
                {aiResult && (
                  <div style={{ marginTop: 16, padding: '18px', background: 'linear-gradient(160deg, rgba(207,175,75,.04), rgba(6,10,19,.9))', border: '1px solid rgba(207,175,75,.1)', borderRadius: 12, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--a), transparent)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'var(--a)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Résultat IA</span>
                      <span style={{ fontFamily: 'var(--b)', fontSize: 9, color: '#34d399', fontWeight: 600 }}>+1 ticket gagné</span>
                    </div>
                    <div style={{ fontFamily: 'var(--b)', fontSize: 13, color: 'rgba(255,255,255,.65)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{aiResult}</div>
                  </div>
                )}
              </div>
            )}

            {!activeService && (
              <div style={{ textAlign: 'center', padding: '30px 20px', background: 'rgba(255,255,255,.015)', border: '1px solid rgba(255,255,255,.04)', borderRadius: 14 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>👆</div>
                <div style={{ fontFamily: 'var(--b)', fontSize: 13, color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>Choisis un service IA ci-dessus</div>
                <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.2)', marginTop: 4 }}>Chaque utilisation te donne 1 ticket bonus pour le jeu concours</div>
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB: CREDITS & TICKETS ═══ */}
        {tab === 'tickets' && (
          <div>
            {/* Why buy section */}
            <div style={{ background: 'linear-gradient(160deg, rgba(207,175,75,.06), rgba(6,10,19,.95))', border: '1px solid rgba(207,175,75,.12)', borderRadius: 14, padding: '20px 18px', marginBottom: 20, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--d)', fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Chaque crédit = 1 service IA + 1 ticket</div>
              <div style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.35)', lineHeight: 1.5 }}>
                Utilise l&apos;IA pour tes projets immobiliers ET augmente tes chances de gagner la villa à 695 000€.
              </div>
            </div>

            {/* Credit packs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 10, marginBottom: 24 }}>
              {CREDIT_PACKS.map((pack, idx) => {
                const isPopular = pack.id === 'credit_5'
                return (
                  <div key={pack.id} style={{
                    background: isPopular ? 'linear-gradient(160deg, rgba(207,175,75,.08), rgba(6,10,19,.95))' : 'rgba(255,255,255,.02)',
                    border: isPopular ? '1px solid rgba(207,175,75,.25)' : '1px solid rgba(255,255,255,.06)',
                    borderRadius: 14, padding: '18px 14px', textAlign: 'center', position: 'relative', overflow: 'hidden',
                  }}>
                    {isPopular && <div style={{ position: 'absolute', top: 6, right: -18, background: 'var(--a)', color: '#0a0e1a', fontSize: 7, fontWeight: 800, letterSpacing: 1, padding: '2px 22px', transform: 'rotate(45deg)', fontFamily: 'var(--b)' }}>TOP</div>}
                    <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 12, color: '#fff', marginBottom: 4 }}>{pack.name}</div>
                    <div style={{ fontFamily: 'var(--m)', fontSize: 26, color: 'var(--a)', fontWeight: 700, marginBottom: 2 }}>{pack.priceLabel}</div>
                    {pack.credits > 1 && (
                      <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: '#34d399', fontWeight: 700, marginBottom: 4 }}>
                        {(pack.price / 100 / pack.credits).toFixed(2)}€/cr · -{Math.round((1 - (pack.price / 100 / pack.credits) / 9) * 100)}%
                      </div>
                    )}
                    <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.3)', marginBottom: 10 }}>
                      {pack.credits} cr + {pack.tickets} ticket{pack.tickets > 1 ? 's' : ''}
                    </div>
                    <button
                      onClick={() => handleBuyPack(pack.id)}
                      disabled={buyingPack === pack.id}
                      style={{
                        width: '100%', padding: '9px 0',
                        background: isPopular ? 'linear-gradient(135deg, var(--a), #b8932e)' : 'rgba(207,175,75,.08)',
                        border: isPopular ? 'none' : '1px solid rgba(207,175,75,.12)',
                        borderRadius: 8, fontFamily: 'var(--b)', fontWeight: 700, fontSize: 11,
                        color: isPopular ? '#0a0e1a' : 'var(--a)', cursor: 'pointer',
                      }}
                    >
                      {buyingPack === pack.id ? '...' : 'Acheter'}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Other ways to earn */}
            <h3 style={{ fontFamily: 'var(--b)', fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Tickets gratuits</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'rgba(52,211,153,.03)', border: '1px solid rgba(52,211,153,.08)', borderRadius: 10, cursor: 'pointer' }} onClick={copyReferral}>
                <div>
                  <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 12, color: '#fff' }}>🎁 Parraine un ami</div>
                  <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>Ton ami et toi recevez chacun 1 ticket</div>
                </div>
                <span style={{ fontFamily: 'var(--b)', fontSize: 11, color: '#34d399', fontWeight: 700 }}>{copied ? '✓ Copié' : 'Copier le lien'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'rgba(255,255,255,.015)', border: '1px solid rgba(255,255,255,.04)', borderRadius: 10 }}>
                <div>
                  <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 12, color: '#fff' }}>🤖 Utilise un service IA</div>
                  <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>Chaque crédit utilisé = 1 ticket bonus</div>
                </div>
                <button onClick={() => setTab('ai')} style={{ padding: '6px 12px', background: 'rgba(207,175,75,.06)', border: '1px solid rgba(207,175,75,.1)', borderRadius: 6, fontFamily: 'var(--b)', fontSize: 10, color: 'var(--a)', fontWeight: 600, cursor: 'pointer' }}>
                  Aller
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB: HISTORY ═══ */}
        {tab === 'history' && (
          <div>
            {historyLoading ? (
              <div style={{ textAlign: 'center', padding: 40, fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.3)' }}>Chargement...</div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,.015)', border: '1px solid rgba(255,255,255,.04)', borderRadius: 14 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
                <div style={{ fontFamily: 'var(--b)', fontSize: 13, color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>Aucune analyse encore</div>
                <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.2)', marginTop: 4, marginBottom: 16 }}>Utilise un service IA pour voir tes résultats ici</div>
                <button onClick={() => setTab('ai')} style={{ padding: '10px 20px', background: 'rgba(207,175,75,.08)', border: '1px solid rgba(207,175,75,.15)', borderRadius: 8, fontFamily: 'var(--b)', fontWeight: 700, fontSize: 11, color: 'var(--a)', cursor: 'pointer' }}>
                  Lancer une analyse
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {history.map(task => (
                  <div
                    key={task.id}
                    onClick={() => setExpandedHistory(expandedHistory === task.id ? null : task.id)}
                    style={{ padding: '14px 16px', background: expandedHistory === task.id ? 'rgba(207,175,75,.03)' : 'rgba(255,255,255,.015)', border: expandedHistory === task.id ? '1px solid rgba(207,175,75,.1)' : '1px solid rgba(255,255,255,.05)', borderRadius: 12, cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{(serviceNames[task.type] || '🤖').split(' ')[0]}</span>
                        <div>
                          <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 12, color: '#fff' }}>{serviceNames[task.type]?.split(' ').slice(1).join(' ') || task.type}</div>
                          <div style={{ fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.25)', marginTop: 1 }}>
                            {new Date(task.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <span style={{ color: 'var(--a)', fontSize: 12, transform: expandedHistory === task.id ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
                    </div>
                    {expandedHistory === task.id && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.3)', marginBottom: 4, fontWeight: 600 }}>Ta demande :</div>
                        <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.45)', marginBottom: 10, padding: '8px 10px', background: 'rgba(255,255,255,.02)', borderRadius: 6 }}>{task.input?.query || '-'}</div>
                        <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'var(--a)', marginBottom: 4, fontWeight: 600 }}>Résultat :</div>
                        <div style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.55)', lineHeight: 1.6, whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto' }}>{task.output?.result || '-'}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ QUICK LINKS ═══ */}
        <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
          <Link href="/browse" style={{ flex: '1 1 120px', padding: '12px 14px', background: 'rgba(255,255,255,.015)', border: '1px solid rgba(255,255,255,.04)', borderRadius: 10, textDecoration: 'none', textAlign: 'center' }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>📢</div>
            <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>Annonces</div>
          </Link>
          <Link href="/match" style={{ flex: '1 1 120px', padding: '12px 14px', background: 'rgba(255,255,255,.015)', border: '1px solid rgba(255,255,255,.04)', borderRadius: 10, textDecoration: 'none', textAlign: 'center' }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>💞</div>
            <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>Matching</div>
          </Link>
          {user.type !== 'particulier' && (
            <Link href="/pro" style={{ flex: '1 1 120px', padding: '12px 14px', background: 'rgba(255,255,255,.015)', border: '1px solid rgba(255,255,255,.04)', borderRadius: 10, textDecoration: 'none', textAlign: 'center' }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>🏢</div>
              <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>Espace Pro</div>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
