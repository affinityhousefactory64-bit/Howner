'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'

const TOTAL = 200000
const INIT = 47382

const PACKS = [
  { id: 'standard_1', n: 1, price: '9', per: '9', tickets: 1 },
  { id: 'standard_5', n: 5, price: '39', per: '7,80', tickets: 5, save: 13 },
  { id: 'standard_10', n: 10, price: '69', per: '6,90', tickets: 10, save: 23, pop: true },
  { id: 'standard_20', n: 20, price: '119', per: '5,95', tickets: 20, save: 34 },
]

export default function CreditsPage() {
  const [gauge, setGauge] = useState(INIT)
  const [buying, setBuying] = useState<string | null>(null)
  const [cancelled, setCancelled] = useState(false)

  /* Mock balance */
  const credits = 3
  const tickets = 4

  useEffect(() => {
    if (typeof window === 'undefined') return
    const p = new URLSearchParams(window.location.search).get('payment')
    if (p === 'cancelled') {
      setCancelled(true)
      window.history.replaceState({}, '', '/credits')
      setTimeout(() => setCancelled(false), 4000)
    }
  }, [])

  /* Live gauge tick */
  useEffect(() => {
    const tick = () => setGauge(p => Math.min(TOTAL, p + Math.floor(Math.random() * 3) + 1))
    const go = (): ReturnType<typeof setTimeout> => {
      const d = 5000 + Math.random() * 3000
      return setTimeout(() => { tick(); id = go() }, d)
    }
    let id = go()
    return () => clearTimeout(id)
  }, [])

  const pct = (gauge / TOTAL) * 100

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
    } catch {
      /* silent */
    } finally {
      setBuying(null)
    }
  }

  return (
    <>
      <Nav />

      {/* == MINI GAUGE BAR == */}
      <div style={{ background: 'rgba(127,132,246,.04)', borderBottom: '1px solid rgba(255,255,255,.06)', padding: '10px 20px' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 12px #34d399', animation: 'pulse 2s infinite', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399' }}>Tirage en cours</span>
          <div style={{ width: 120, height: 4, borderRadius: 10, background: 'rgba(255,255,255,.06)', overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ height: '100%', borderRadius: 10, background: 'linear-gradient(90deg, var(--accent), var(--a))', width: `${pct}%`, transition: 'width 1s' }} />
          </div>
          <span className="mono text-gold" style={{ fontSize: 10, flexShrink: 0 }}>{gauge.toLocaleString()}/{TOTAL / 1000}K</span>
        </div>
      </div>

      {/* ══ HEADER ══ */}
      <section className="section" style={{ paddingTop: 48, paddingBottom: 0 }}>
        <div className="container text-center">
          <h1 className="heading-lg" style={{ marginBottom: 8 }}>Acheter des cr&#233;dits</h1>
          <p className="text-muted text-sm" style={{ marginBottom: 8 }}>
            1 cr&#233;dit = 1 comparaison, 1 analyse de devis, ou 1 recherche de pro
          </p>
          <p className="text-gold text-xs" style={{ fontWeight: 700, marginBottom: 32 }}>
            + 1 ticket OFFERT par cr&#233;dit pour le tirage de la villa &#224; 695 000&#8364;
          </p>

          {cancelled && (
            <div style={{ display: 'inline-block', padding: '8px 20px', borderRadius: 10, background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.15)', marginBottom: 24 }}>
              <span className="text-xs" style={{ color: '#fbbf24', fontWeight: 600 }}>Paiement annul&#233; — pas de souci !</span>
            </div>
          )}
        </div>
      </section>

      {/* ══ BALANCE ══ */}
      <section style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 40 }}>
            <div className="glass" style={{ padding: '20px 32px', textAlign: 'center', minWidth: 120, background: 'rgba(207,175,75,.06)', borderColor: 'rgba(207,175,75,.15)' }}>
              <div className="mono text-gold" style={{ fontSize: 36, fontWeight: 700, lineHeight: 1 }}>{credits}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: 2, textTransform: 'uppercase', marginTop: 6 }}>Cr&#233;dits</div>
            </div>
            <div className="glass" style={{ padding: '20px 32px', textAlign: 'center', minWidth: 120, background: 'rgba(127,132,246,.06)', borderColor: 'rgba(127,132,246,.15)' }}>
              <div className="mono" style={{ fontSize: 36, fontWeight: 700, lineHeight: 1, color: 'var(--accent)' }}>{tickets}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: 2, textTransform: 'uppercase', marginTop: 6 }}>Tickets</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PACKS ══ */}
      <section className="section section-mid" style={{ paddingTop: 48, paddingBottom: 48 }}>
        <div className="container text-center">
          <div className="packs-grid" style={{ maxWidth: 900, margin: '0 auto' }}>
            {PACKS.map(pk => (
              <div key={pk.id} className={`pack-card${pk.pop ? ' popular' : ''}`}>
                {pk.pop && <div className="pack-badge">Populaire</div>}
                <div className="mono" style={{ fontSize: 40, fontWeight: 700 }}>{pk.n}</div>
                <div className="text-muted text-sm" style={{ marginBottom: 8 }}>cr&#233;dit{pk.n > 1 ? 's' : ''}</div>
                <div className="text-gold" style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--d)', marginBottom: 4 }}>{pk.price}&#8364;</div>
                <div className="text-muted text-xs" style={{ marginBottom: 8 }}>{pk.per}&#8364;/cr&#233;dit</div>
                {pk.save && (
                  <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, background: 'rgba(52,211,153,.08)', border: '1px solid rgba(52,211,153,.15)', fontSize: 11, fontWeight: 700, color: '#34d399', marginBottom: 8 }}>
                    -{pk.save}%
                  </div>
                )}
                <div style={{ marginBottom: 12 }}>
                  <span className="badge text-gold" style={{ background: 'rgba(207,175,75,.1)', fontSize: 12 }}>+{pk.tickets} ticket{pk.tickets > 1 ? 's' : ''} offert{pk.tickets > 1 ? 's' : ''}</span>
                </div>
                <button
                  onClick={() => handleBuy(pk.id)}
                  disabled={buying === pk.id}
                  className="btn-primary"
                  style={{ width: '100%', padding: '10px 0', fontSize: 13 }}
                >
                  {buying === pk.id ? '...' : 'Acheter'}
                </button>
              </div>
            ))}
          </div>

          <p className="text-muted text-xs" style={{ marginTop: 20 }}>
            Les cr&#233;dits n&apos;expirent jamais. Utilisez-les quand vous voulez.
          </p>
        </div>
      </section>

      {/* ══ TRUST ══ */}
      <section style={{ padding: '24px 0', textAlign: 'center' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 32 }}>
            {[
              { t: 'Paiement Stripe', d: 'Sécurisé et chiffré' },
              { t: 'Sans expiration', d: 'Vos crédits restent' },
              { t: '1 crédit = 1 ticket', d: 'Toujours offert en bonus' },
            ].map((x, i) => (
              <div key={i} style={{ minWidth: 120, maxWidth: 160 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e4e4e7', marginBottom: 2 }}>{x.t}</div>
                <div className="text-muted text-xs">{x.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER LINK ══ */}
      <section style={{ paddingBottom: 48, textAlign: 'center' }}>
        <Link href="/villa" className="text-xs text-gold" style={{ textDecoration: 'none', fontWeight: 600 }}>
          Voir la villa &#224; gagner →
        </Link>
      </section>
    </>
  )
}
