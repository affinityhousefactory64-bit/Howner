'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/context'
import Nav from '@/components/Nav'
import Link from 'next/link'

const TOTAL = 200000

const STANDARD = [
  { id: 'standard_1', credits: 1, tickets: 1, price: '9€', perCredit: '9€', discount: '' },
  { id: 'standard_5', credits: 5, tickets: 5, price: '39€', perCredit: '7,80€', discount: '-13%' },
  { id: 'standard_10', credits: 10, tickets: 10, price: '69€', perCredit: '6,90€', discount: '-23%', popular: true },
  { id: 'standard_20', credits: 20, tickets: 20, price: '119€', perCredit: '5,95€', discount: '-34%' },
]

const PRO = [
  { id: 'pro_10', credits: 10, tickets: 10, price: '59€', perCredit: '5,90€', discount: '-34%' },
  { id: 'pro_30', credits: 30, tickets: 30, price: '149€', perCredit: '4,97€', discount: '-45%' },
  { id: 'pro_50', credits: 50, tickets: 50, price: '229€', perCredit: '4,58€', discount: '-49%', popular: true },
  { id: 'pro_100', credits: 100, tickets: 100, price: '399€', perCredit: '3,99€', discount: '-56%' },
]

export default function CreditsPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [tab, setTab] = useState<'standard' | 'pro'>('standard')
  const [buying, setBuying] = useState<string | null>(null)
  const [cancelled, setCancelled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const p = new URLSearchParams(window.location.search).get('payment')
    if (p === 'cancelled') {
      setCancelled(true)
      window.history.replaceState({}, '', '/credits')
      setTimeout(() => setCancelled(false), 4000)
    }
  }, [])

  if (loading) return (
    <div className="loading-page">
      <div className="loading-text">Chargement...</div>
    </div>
  )

  if (!user) { router.push('/login'); return null }

  const packs = tab === 'standard' ? STANDARD : PRO
  const gaugeN = user.tickets || 0
  const ticketsRemaining = TOTAL - gaugeN

  async function handleBuy(packId: string) {
    setBuying(packId)
    try {
      const res = await fetch('/api/credits/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch { /* */ } finally { setBuying(null) }
  }

  return (
    <div className="page">
      <Nav />
      <div className="content-narrow">

        <h1 className="heading-lg text-center mb-8">Acheter des crédits</h1>
        <p className="text-xs text-muted text-center mb-20">
          Chaque crédit = 1 action (poster, booster, alerter) + 1 ticket OFFERT pour le jeu concours
        </p>

        {cancelled && (
          <div className="info-banner warning text-center mb-16">
            <span className="text-xs" style={{ color: '#fbbf24', fontWeight: 600 }}>Paiement annulé — pas de souci !</span>
          </div>
        )}

        {/* Current balance */}
        <div className="flex gap-10 justify-center mb-20">
          <div className="balance-card gold">
            <div className="balance-value gold">{user.credits}</div>
            <div className="balance-label">CRÉDITS</div>
          </div>
          <div className="balance-card purple">
            <div className="balance-value purple">{user.tickets}</div>
            <div className="balance-label">TICKETS</div>
          </div>
        </div>

        {/* Gauge */}
        <div className="fomo-bar mb-24">
          <div className="flex justify-between mb-8">
            <span className="text-xs text-muted" style={{ fontWeight: 600 }}>Villa 695 000€ · Tirage en cours</span>
            <span className="mono text-xs text-gold">{gaugeN.toLocaleString()} / {TOTAL.toLocaleString()}</span>
          </div>
          <div className="gauge-bar" style={{ height: 6 }}>
            <div className="gauge-fill" style={{ width: `${(gaugeN / TOTAL) * 100}%` }} />
          </div>
          <div className="text-xs text-muted" style={{ marginTop: 6 }}>
            Il reste {ticketsRemaining.toLocaleString('fr-FR')} tickets avant le tirage.
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-bar mb-20">
          <button onClick={() => setTab('standard')} className={`tab-btn ${tab === 'standard' ? 'active' : ''}`}>
            Standard
          </button>
          <button onClick={() => setTab('pro')} className={`tab-btn ${tab === 'pro' ? 'active' : ''}`}>
            Pro
          </button>
        </div>

        {/* Packs */}
        <div className="packs-grid mb-24">
          {packs.map(p => {
            const hl = 'popular' in p && p.popular
            return (
              <div key={p.id} className={hl ? 'pack-card popular' : 'pack-card'}>
                {hl && <div className="pack-badge">TOP</div>}
                <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 6 }}>{p.credits} crédit{p.credits > 1 ? 's' : ''}</div>
                <div className="mono" style={{ fontSize: 28, color: 'var(--a)', fontWeight: 700, marginBottom: 4 }}>{p.price}</div>
                {p.discount && <div className="text-xs" style={{ color: '#34d399', fontWeight: 700, marginBottom: 2 }}>{p.perCredit}/cr · {p.discount}</div>}
                <div className="text-xs text-muted mb-12">+{p.tickets} ticket{p.tickets > 1 ? 's' : ''}</div>
                <button onClick={() => handleBuy(p.id)} disabled={buying === p.id}
                  className={hl ? 'btn-primary full-width' : 'btn-secondary full-width'}
                  style={{ padding: '10px 0', fontSize: 11 }}>
                  {buying === p.id ? '...' : 'Acheter'}
                </button>
              </div>
            )
          })}
        </div>

        {/* What credits do */}
        <h3 className="heading-md text-center mb-12">À quoi servent les crédits ?</h3>
        <div className="flex flex-col gap-6 mb-20">
          {[
            { title: 'Poster une annonce', desc: 'Au-delà de la 1re gratuite', bonus: '+1 ticket' },
            { title: 'Booster une annonce', desc: 'Passe en tête pendant 24h', bonus: '+1 ticket' },
            { title: 'Alerte prioritaire', desc: 'Notification immédiate pendant 30 jours', bonus: '+1 ticket' },
          ].map((item, i) => (
            <div key={i} className="card flex items-center gap-10" style={{ padding: '12px 14px', borderRadius: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#fff' }}>{item.title}</div>
                <div className="text-xs text-muted">{item.desc}</div>
              </div>
              <span className="text-xs" style={{ color: '#34d399', fontWeight: 700 }}>{item.bonus} offert</span>
            </div>
          ))}
        </div>

        {/* Trust line */}
        <div className="trust-line">
          Paiement sécurisé Stripe · Crédits sans expiration · 1 crédit = 1 ticket
        </div>

        <div className="text-center">
          <Link href="/villa" className="text-xs text-gold" style={{ textDecoration: 'none', fontWeight: 600 }}>
            Voir la villa à gagner →
          </Link>
        </div>
      </div>
    </div>
  )
}
