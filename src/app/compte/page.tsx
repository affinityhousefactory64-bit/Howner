'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/lib/context'
import Nav from '@/components/Nav'
import { Listing } from '@/types'

type Tab = 'annonces' | 'credits' | 'matchs'

export default function ComptePage() {
  const { user, loading, refresh } = useUser()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('annonces')
  const [listings, setListings] = useState<Listing[]>([])
  const [listingsLoading, setListingsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [paymentBanner, setPaymentBanner] = useState<'success' | null>(null)
  const [boosting, setBoosting] = useState<string | null>(null)

  // Payment success banner
  useEffect(() => {
    if (typeof window === 'undefined') return
    const p = new URLSearchParams(window.location.search).get('payment')
    if (p === 'success') {
      setPaymentBanner('success')
      refresh()
      window.history.replaceState({}, '', '/compte')
      setTimeout(() => setPaymentBanner(null), 6000)
    }
  }, [refresh])

  // Load user listings
  useEffect(() => {
    if (!user) return
    setListingsLoading(true)
    fetch('/api/listings/mine')
      .then(r => r.json())
      .then(d => setListings(d.listings || []))
      .catch(() => {})
      .finally(() => setListingsLoading(false))
  }, [user])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#060a13', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--b)', color: 'rgba(255,255,255,.3)' }}>Chargement...</div>
    </div>
  )

  if (!user) { router.push('/login'); return null }

  function copyReferral() {
    const url = `${window.location.origin}/login?ref=${user!.referral_code}`
    navigator.clipboard.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleBoost(listingId: string) {
    if (user!.credits < 1) return
    setBoosting(listingId)
    try {
      const res = await fetch('/api/credits/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'boost', listingId }),
      })
      const data = await res.json()
      if (res.ok) {
        await refresh()
        setListings(prev => prev.map(l => l.id === listingId ? { ...l, is_boosted: true } : l))
      } else {
        alert(data.error)
      }
    } catch { /* */ } finally { setBoosting(null) }
  }

  const GAUGE_TOTAL = 200000
  const gaugeN = 4283 + (user.tickets || 0)

  return (
    <div style={{ minHeight: '100vh', background: '#060a13', color: '#fff' }}>
      <Nav />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 18px 60px' }}>

        {/* Payment banner */}
        {paymentBanner === 'success' && (
          <div style={{ background: 'rgba(52,211,153,.1)', border: '1px solid rgba(52,211,153,.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, animation: 'fadeIn .5s' }}>
            <span style={{ fontSize: 24 }}>🎉</span>
            <div>
              <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 14, color: '#34d399' }}>Paiement réussi !</div>
              <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.4)' }}>Crédits et tickets ajoutés. Bonne chance pour le tirage !</div>
            </div>
          </div>
        )}

        {/* Header */}
        <h1 style={{ fontFamily: 'var(--d)', fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
          Salut, {user.name || 'voyageur'} 👋
        </h1>
        <p style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.35)', marginBottom: 16 }}>
          {user.type === 'pro' ? `Compte pro · ${user.pro_type || ''}` : 'Compte particulier'}
        </p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
          <div style={{ background: 'linear-gradient(160deg, rgba(207,175,75,.08), rgba(6,10,19,.95))', border: '1px solid rgba(207,175,75,.15)', borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--m)', fontSize: 26, color: 'var(--a)', fontWeight: 700 }}>{user.credits}</div>
            <div style={{ fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.3)', fontWeight: 600 }}>CRÉDITS</div>
          </div>
          <div style={{ background: 'rgba(168,139,250,.05)', border: '1px solid rgba(168,139,250,.12)', borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--m)', fontSize: 26, color: '#a78bfa', fontWeight: 700 }}>{user.tickets}</div>
            <div style={{ fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.3)', fontWeight: 600 }}>TICKETS</div>
          </div>
          <div style={{ background: 'rgba(52,211,153,.04)', border: '1px solid rgba(52,211,153,.1)', borderRadius: 12, padding: '14px 12px', textAlign: 'center', cursor: 'pointer' }} onClick={copyReferral}>
            <div style={{ fontFamily: 'var(--m)', fontSize: 14, color: '#34d399', fontWeight: 700 }}>{user.referral_code}</div>
            <div style={{ fontFamily: 'var(--b)', fontSize: 9, color: copied ? '#34d399' : 'rgba(255,255,255,.3)', fontWeight: 600 }}>{copied ? '✓ COPIÉ' : 'PARRAINAGE'}</div>
          </div>
        </div>

        {/* Gauge */}
        <div style={{ background: 'rgba(207,175,75,.03)', border: '1px solid rgba(207,175,75,.08)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.35)', fontWeight: 600 }}>🏠 Villa 695K€</span>
            <span style={{ fontFamily: 'var(--m)', fontSize: 10, color: 'var(--a)' }}>Tes tickets : {user.tickets}</span>
          </div>
          <div style={{ height: 5, borderRadius: 10, background: 'rgba(255,255,255,.05)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 10, background: 'linear-gradient(90deg, var(--a), #f5e6a3)', width: `${(gaugeN / GAUGE_TOTAL) * 100}%` }} />
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          <Link href="/poster" style={{ flex: '1 1 100px', padding: '10px 12px', background: 'linear-gradient(135deg, var(--a), #b8932e)', borderRadius: 9, textDecoration: 'none', textAlign: 'center', fontFamily: 'var(--b)', fontWeight: 700, fontSize: 11, color: '#0a0e1a' }}>
            + Poster
          </Link>
          <Link href="/credits" style={{ flex: '1 1 100px', padding: '10px 12px', background: 'rgba(207,175,75,.06)', border: '1px solid rgba(207,175,75,.12)', borderRadius: 9, textDecoration: 'none', textAlign: 'center', fontFamily: 'var(--b)', fontWeight: 700, fontSize: 11, color: 'var(--a)' }}>
            Acheter crédits
          </Link>
          <Link href="/match" style={{ flex: '1 1 100px', padding: '10px 12px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 9, textDecoration: 'none', textAlign: 'center', fontFamily: 'var(--b)', fontWeight: 600, fontSize: 11, color: 'rgba(255,255,255,.5)' }}>
            Matching
          </Link>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'rgba(255,255,255,.02)', borderRadius: 10, padding: 3 }}>
          {([
            { id: 'annonces' as Tab, label: '📢 Mes annonces' },
            { id: 'credits' as Tab, label: '💳 Crédits & Tickets' },
            { id: 'matchs' as Tab, label: '💞 Mes matchs' },
          ]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: 1, padding: '10px 8px', borderRadius: 8, cursor: 'pointer', border: 'none', background: tab === t.id ? 'rgba(207,175,75,.08)' : 'transparent', fontFamily: 'var(--b)', fontSize: 11, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? 'var(--a)' : 'rgba(255,255,255,.35)' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB: Annonces */}
        {tab === 'annonces' && (
          <div>
            {listingsLoading ? (
              <div style={{ textAlign: 'center', padding: 30, fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.3)' }}>Chargement...</div>
            ) : listings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', background: 'rgba(255,255,255,.015)', border: '1px solid rgba(255,255,255,.04)', borderRadius: 14 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📢</div>
                <div style={{ fontFamily: 'var(--b)', fontSize: 13, color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>Aucune annonce</div>
                <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.2)', marginTop: 4, marginBottom: 14 }}>
                  {user.free_listing_used ? 'Achète un crédit pour poster' : 'Ta 1ère annonce est gratuite !'}
                </div>
                <Link href="/poster" style={{ padding: '10px 20px', background: 'linear-gradient(135deg, var(--a), #b8932e)', borderRadius: 8, fontFamily: 'var(--b)', fontWeight: 700, fontSize: 11, color: '#0a0e1a', textDecoration: 'none' }}>
                  Poster maintenant
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {listings.map(l => (
                  <div key={l.id} style={{ padding: '14px 16px', background: l.is_boosted ? 'rgba(207,175,75,.03)' : 'rgba(255,255,255,.015)', border: `1px solid ${l.is_boosted ? 'rgba(207,175,75,.1)' : 'rgba(255,255,255,.05)'}`, borderRadius: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 2 }}>{l.title}</div>
                        <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.3)' }}>{l.location}</div>
                        {l.price && <div style={{ fontFamily: 'var(--m)', fontSize: 13, color: 'var(--a)', marginTop: 4 }}>{l.price.toLocaleString('fr-FR')}€</div>}
                      </div>
                      {l.is_boosted ? (
                        <span style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(207,175,75,.08)', fontFamily: 'var(--b)', fontSize: 9, fontWeight: 700, color: 'var(--a)' }}>🚀 BOOSTÉ</span>
                      ) : (
                        <button onClick={() => handleBoost(l.id)} disabled={user.credits < 1 || boosting === l.id}
                          style={{ padding: '6px 12px', background: 'rgba(207,175,75,.06)', border: '1px solid rgba(207,175,75,.12)', borderRadius: 6, fontFamily: 'var(--b)', fontSize: 9, fontWeight: 700, color: user.credits > 0 ? 'var(--a)' : 'rgba(255,255,255,.25)', cursor: user.credits > 0 ? 'pointer' : 'not-allowed' }}>
                          {boosting === l.id ? '...' : '🚀 Booster (1cr)'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Credits */}
        {tab === 'credits' && (
          <div>
            <div style={{ background: 'linear-gradient(160deg, rgba(207,175,75,.06), rgba(6,10,19,.95))', border: '1px solid rgba(207,175,75,.12)', borderRadius: 12, padding: '18px 16px', textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--d)', fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Tu as {user.credits} crédit{user.credits > 1 ? 's' : ''} et {user.tickets} ticket{user.tickets > 1 ? 's' : ''}</div>
              <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.35)' }}>Chaque crédit = 1 action + 1 ticket jeu concours</div>
              <Link href="/credits" style={{ display: 'inline-block', marginTop: 12, padding: '10px 24px', background: 'linear-gradient(135deg, var(--a), #b8932e)', borderRadius: 8, fontFamily: 'var(--b)', fontWeight: 700, fontSize: 12, color: '#0a0e1a', textDecoration: 'none' }}>
                Acheter des crédits
              </Link>
            </div>

            {/* Referral */}
            <div style={{ padding: '14px 16px', background: 'rgba(52,211,153,.04)', border: '1px solid rgba(52,211,153,.1)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={copyReferral}>
              <div>
                <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 13, color: '#fff' }}>🎁 Parraine un ami</div>
                <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>+1 ticket gratuit pour vous deux</div>
              </div>
              <span style={{ fontFamily: 'var(--b)', fontSize: 11, color: '#34d399', fontWeight: 700 }}>{copied ? '✓ Copié' : 'Copier lien'}</span>
            </div>
          </div>
        )}

        {/* TAB: Matchs */}
        {tab === 'matchs' && (
          <div style={{ textAlign: 'center', padding: '30px 20px', background: 'rgba(255,255,255,.015)', border: '1px solid rgba(255,255,255,.04)', borderRadius: 14 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>💞</div>
            <div style={{ fontFamily: 'var(--b)', fontSize: 13, color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>Tes matchs apparaîtront ici</div>
            <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.2)', marginTop: 4, marginBottom: 14 }}>Swipe pour connecter avec des pros et particuliers</div>
            <Link href="/match" style={{ padding: '10px 20px', background: 'rgba(207,175,75,.08)', border: '1px solid rgba(207,175,75,.12)', borderRadius: 8, fontFamily: 'var(--b)', fontWeight: 700, fontSize: 11, color: 'var(--a)', textDecoration: 'none' }}>
              Aller au matching
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
