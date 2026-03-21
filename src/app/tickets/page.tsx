'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/context'
import Nav from '@/components/Nav'
import Link from 'next/link'

const TOTAL = 15000

const PACKS = [
  { id: 'chance_1', tickets: 1, price: '129€', discount: '', label: 'Chance' },
  { id: 'ambitieux_3', tickets: 3, price: '299€', discount: '-23%', label: 'Ambitieux' },
  { id: 'stratege_10', tickets: 10, price: '799€', discount: '-38%', label: 'Stratège', badge: 'POPULAIRE', badgeColor: '#34d399' },
  { id: 'magnat_30', tickets: 30, price: '1999€', discount: '-48%', label: 'Magnat', badge: 'MEILLEURE OFFRE', badgeColor: 'var(--a)' },
]

export default function TicketsPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [buying, setBuying] = useState<string | null>(null)
  const [cancelled, setCancelled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const p = new URLSearchParams(window.location.search).get('payment')
    if (p === 'cancelled') {
      setCancelled(true)
      window.history.replaceState({}, '', '/tickets')
      setTimeout(() => setCancelled(false), 4000)
    }
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#060a13', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--b)', color: 'rgba(255,255,255,.3)' }}>Chargement...</div>
    </div>
  )

  if (!user) { router.push('/login'); return null }

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

        <h1 style={{ fontFamily: 'var(--d)', fontSize: 28, fontWeight: 800, marginBottom: 4, textAlign: 'center' }}>Acheter des tickets</h1>
        <p style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.35)', textAlign: 'center', marginBottom: 20 }}>
          Chaque ticket = 1 chance de gagner la villa
        </p>

        {cancelled && (
          <div style={{ background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.12)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, textAlign: 'center' }}>
            <span style={{ fontFamily: 'var(--b)', fontSize: 12, color: '#fbbf24' }}>Paiement annule -- pas de souci !</span>
          </div>
        )}

        {/* Current ticket count */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ padding: '14px 28px', background: 'linear-gradient(160deg, rgba(207,175,75,.08), rgba(6,10,19,.95))', border: '1px solid rgba(207,175,75,.2)', borderRadius: 14, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--m)', fontSize: 36, color: 'var(--a)', fontWeight: 700 }}>{user.tickets}</div>
            <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.3)', fontWeight: 600 }}>MES TICKETS 🎟️</div>
          </div>
        </div>

        {/* Gauge */}
        <div style={{ background: 'rgba(207,175,75,.03)', border: '1px solid rgba(207,175,75,.08)', borderRadius: 10, padding: '12px 14px', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.35)', fontWeight: 600 }}>🏠 Villa 695 000€ · Tirage en cours</span>
            <span style={{ fontFamily: 'var(--m)', fontSize: 10, color: 'var(--a)' }}>{gaugeN.toLocaleString()} / {TOTAL.toLocaleString()}</span>
          </div>
          <div style={{ height: 6, borderRadius: 10, background: 'rgba(255,255,255,.05)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 10, background: 'linear-gradient(90deg, var(--a), #f5e6a3)', width: `${Math.min((gaugeN / TOTAL) * 100, 100)}%`, boxShadow: '0 0 12px rgba(207,175,75,.2)' }} />
          </div>
        </div>

        {/* Packs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: 10, marginBottom: 24 }}>
          {PACKS.map(p => {
            const hl = !!p.badge
            return (
              <div key={p.id} style={{
                background: hl ? 'linear-gradient(160deg, rgba(207,175,75,.08), rgba(6,10,19,.95))' : 'rgba(255,255,255,.02)',
                border: hl ? '1px solid rgba(207,175,75,.25)' : '1px solid rgba(255,255,255,.06)',
                borderRadius: 14, padding: '20px 14px', textAlign: 'center', position: 'relative', overflow: 'hidden',
              }}>
                {p.badge && <div style={{ position: 'absolute', top: 8, left: 0, right: 0, textAlign: 'center' }}>
                  <span style={{ background: p.badgeColor, color: '#0a0e1a', fontSize: 7, fontWeight: 800, letterSpacing: 1, padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--b)' }}>{p.badge}</span>
                </div>}
                <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 4, marginTop: p.badge ? 14 : 0 }}>{p.label}</div>
                <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 6 }}>{p.tickets} ticket{p.tickets > 1 ? 's' : ''} 🎟️</div>
                <div style={{ fontFamily: 'var(--m)', fontSize: 28, color: 'var(--a)', fontWeight: 700, marginBottom: 4 }}>{p.price}</div>
                {p.discount && <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: '#34d399', fontWeight: 700, marginBottom: 8 }}>{p.discount}</div>}
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

        {/* Trust badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
          {[
            { icon: '⚖️', title: 'Tirage par huissier de justice', desc: 'Tirage en direct, supervisé et certifié' },
            { icon: '🔒', title: 'Fonds sous séquestre', desc: 'Votre argent est protégé jusqu\'au tirage' },
            { icon: '💸', title: 'Remboursement garanti', desc: 'Intégralement remboursé si le seuil de 15 000 tickets n\'est pas atteint' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,.015)', border: '1px solid rgba(255,255,255,.04)', borderRadius: 10 }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 12, color: '#fff' }}>{item.title}</div>
                <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link href="/villa" style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'var(--a)', textDecoration: 'none', fontWeight: 600 }}>
            Voir la villa a gagner →
          </Link>
        </div>
      </div>
    </div>
  )
}
