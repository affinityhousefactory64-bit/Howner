'use client'

import { useState, useRef, useEffect } from 'react'
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
    <div style={{ minHeight: '100vh', background: '#060a13', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--b)', color: 'rgba(255,255,255,.3)' }}>Chargement...</div>
    </div>
  )

  if (!user) { router.push('/login'); return null }

  const packs = tab === 'standard' ? STANDARD : PRO
  const gaugeN = 4283 + (user.tickets || 0)

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
    <div style={{ minHeight: '100vh', background: '#060a13', color: '#fff' }}>
      <Nav />
      <div style={{ maxWidth: 650, margin: '0 auto', padding: '28px 18px 60px' }}>

        <h1 style={{ fontFamily: 'var(--d)', fontSize: 28, fontWeight: 800, marginBottom: 4, textAlign: 'center' }}>Acheter des crédits</h1>
        <p style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.35)', textAlign: 'center', marginBottom: 20 }}>
          Chaque crédit = 1 action (poster, booster, alerter) + 1 ticket jeu concours
        </p>

        {cancelled && (
          <div style={{ background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.12)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, textAlign: 'center' }}>
            <span style={{ fontFamily: 'var(--b)', fontSize: 12, color: '#fbbf24' }}>Paiement annulé — pas de souci !</span>
          </div>
        )}

        {/* Current balance */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, justifyContent: 'center' }}>
          <div style={{ padding: '10px 18px', background: 'rgba(207,175,75,.06)', border: '1px solid rgba(207,175,75,.12)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--m)', fontSize: 22, color: 'var(--a)', fontWeight: 700 }}>{user.credits}</div>
            <div style={{ fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.3)', fontWeight: 600 }}>CRÉDITS</div>
          </div>
          <div style={{ padding: '10px 18px', background: 'rgba(168,139,250,.05)', border: '1px solid rgba(168,139,250,.12)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--m)', fontSize: 22, color: '#a78bfa', fontWeight: 700 }}>{user.tickets}</div>
            <div style={{ fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.3)', fontWeight: 600 }}>TICKETS</div>
          </div>
        </div>

        {/* Gauge */}
        <div style={{ background: 'rgba(207,175,75,.03)', border: '1px solid rgba(207,175,75,.08)', borderRadius: 10, padding: '12px 14px', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.35)', fontWeight: 600 }}>🏠 Villa 695 000€ · Tirage en cours</span>
            <span style={{ fontFamily: 'var(--m)', fontSize: 10, color: 'var(--a)' }}>{gaugeN.toLocaleString()} / {TOTAL.toLocaleString()}</span>
          </div>
          <div style={{ height: 6, borderRadius: 10, background: 'rgba(255,255,255,.05)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 10, background: 'linear-gradient(90deg, var(--a), #f5e6a3)', width: `${(gaugeN / TOTAL) * 100}%`, boxShadow: '0 0 12px rgba(207,175,75,.2)' }} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 18, background: 'rgba(255,255,255,.02)', borderRadius: 10, padding: 3 }}>
          <button onClick={() => setTab('standard')} style={{ flex: 1, padding: '10px 0', borderRadius: 8, cursor: 'pointer', border: 'none', background: tab === 'standard' ? 'rgba(207,175,75,.08)' : 'transparent', fontFamily: 'var(--b)', fontSize: 12, fontWeight: tab === 'standard' ? 700 : 500, color: tab === 'standard' ? 'var(--a)' : 'rgba(255,255,255,.35)' }}>
            👤 Standard
          </button>
          <button onClick={() => setTab('pro')} style={{ flex: 1, padding: '10px 0', borderRadius: 8, cursor: 'pointer', border: 'none', background: tab === 'pro' ? 'rgba(207,175,75,.08)' : 'transparent', fontFamily: 'var(--b)', fontSize: 12, fontWeight: tab === 'pro' ? 700 : 500, color: tab === 'pro' ? 'var(--a)' : 'rgba(255,255,255,.35)' }}>
            🏢 Pro
          </button>
        </div>

        {/* Packs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: 10, marginBottom: 24 }}>
          {packs.map(p => {
            const hl = 'popular' in p && p.popular
            return (
              <div key={p.id} style={{
                background: hl ? 'linear-gradient(160deg, rgba(207,175,75,.08), rgba(6,10,19,.95))' : 'rgba(255,255,255,.02)',
                border: hl ? '1px solid rgba(207,175,75,.25)' : '1px solid rgba(255,255,255,.06)',
                borderRadius: 14, padding: '20px 14px', textAlign: 'center', position: 'relative', overflow: 'hidden',
              }}>
                {hl && <div style={{ position: 'absolute', top: 6, right: -18, background: 'var(--a)', color: '#0a0e1a', fontSize: 7, fontWeight: 800, letterSpacing: 1, padding: '2px 22px', transform: 'rotate(45deg)', fontFamily: 'var(--b)' }}>TOP</div>}
                <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 6 }}>{p.credits} crédit{p.credits > 1 ? 's' : ''}</div>
                <div style={{ fontFamily: 'var(--m)', fontSize: 28, color: 'var(--a)', fontWeight: 700, marginBottom: 4 }}>{p.price}</div>
                {p.discount && <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: '#34d399', fontWeight: 700, marginBottom: 2 }}>{p.perCredit}/cr · {p.discount}</div>}
                <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.3)', marginBottom: 10 }}>+{p.tickets} ticket{p.tickets > 1 ? 's' : ''} 🎟️</div>
                <button onClick={() => handleBuy(p.id)} disabled={buying === p.id}
                  style={{
                    width: '100%', padding: '10px 0',
                    background: hl ? 'linear-gradient(135deg, var(--a), #b8932e)' : 'rgba(207,175,75,.08)',
                    border: hl ? 'none' : '1px solid rgba(207,175,75,.12)',
                    borderRadius: 8, fontFamily: 'var(--b)', fontWeight: 700, fontSize: 11,
                    color: hl ? '#0a0e1a' : 'var(--a)', cursor: 'pointer',
                  }}>
                  {buying === p.id ? '...' : 'Acheter'}
                </button>
              </div>
            )
          })}
        </div>

        {/* What credits do */}
        <h3 style={{ fontFamily: 'var(--b)', fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 10, textAlign: 'center' }}>À quoi servent les crédits ?</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
          {[
            { icon: '📢', title: 'Poster une annonce', desc: 'Au-delà de la 1ère gratuite', bonus: '+1 ticket' },
            { icon: '🚀', title: 'Booster une annonce', desc: 'Passe en tête pendant 24h', bonus: '+1 ticket' },
            { icon: '🔔', title: 'Alerte prioritaire', desc: 'Notification immédiate pendant 30 jours', bonus: '+1 ticket' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,.015)', border: '1px solid rgba(255,255,255,.04)', borderRadius: 10 }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 12, color: '#fff' }}>{item.title}</div>
                <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{item.desc}</div>
              </div>
              <span style={{ fontFamily: 'var(--b)', fontSize: 10, color: '#34d399', fontWeight: 700 }}>{item.bonus}</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link href="/villa" style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'var(--a)', textDecoration: 'none', fontWeight: 600 }}>
            Voir la villa à gagner →
          </Link>
        </div>
      </div>
    </div>
  )
}
