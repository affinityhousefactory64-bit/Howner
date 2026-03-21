'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/lib/context'
import Nav from '@/components/Nav'
import { Listing, Review } from '@/types'

type Tab = 'annonces' | 'credits' | 'matchs' | 'profil'

export default function ComptePage() {
  const { user, loading, refresh } = useUser()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('annonces')
  const [listings, setListings] = useState<Listing[]>([])
  const [listingsLoading, setListingsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [paymentBanner, setPaymentBanner] = useState<'success' | null>(null)
  const [boosting, setBoosting] = useState<string | null>(null)

  // Pro profile state
  const [proSpecialty, setProSpecialty] = useState('')
  const [proZone, setProZone] = useState('')
  const [proSaving, setProSaving] = useState(false)
  const [proSaved, setProSaved] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)

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

  // Init pro fields from user
  useEffect(() => {
    if (!user || user.type !== 'pro') return
    setProSpecialty(user.pro_specialty || '')
    setProZone(user.pro_zone || '')
  }, [user])

  // Load reviews when pro tab is active
  useEffect(() => {
    if (!user || user.type !== 'pro' || tab !== 'profil') return
    setReviewsLoading(true)
    fetch(`/api/reviews?userId=${user.id}`)
      .then(r => r.json())
      .then(d => setReviews(d.reviews || []))
      .catch(() => {})
      .finally(() => setReviewsLoading(false))
  }, [user, tab])

  if (loading) return (
    <div className="loading-page">
      <div className="loading-text">Chargement...</div>
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

  async function handleProSave() {
    setProSaving(true)
    setProSaved(false)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pro_specialty: proSpecialty, pro_zone: proZone }),
      })
      if (res.ok) {
        await refresh()
        setProSaved(true)
        setTimeout(() => setProSaved(false), 3000)
      }
    } catch { /* */ } finally { setProSaving(false) }
  }

  const GAUGE_TOTAL = 200000

  // Stars helper
  function renderStars(rating: number) {
    const full = Math.floor(rating)
    const half = rating - full >= 0.5
    let stars = ''
    for (let i = 0; i < full; i++) stars += '\u2605'
    if (half) stars += '\u2606'
    for (let i = stars.length; i < 5; i++) stars += '\u2606'
    return stars
  }

  const isPro = user.type === 'pro'

  const tabs: { id: Tab; label: string }[] = [
    { id: 'annonces', label: 'Annonces' },
    { id: 'credits', label: 'Tickets' },
    { id: 'matchs', label: 'Matchs' },
    ...(isPro ? [{ id: 'profil' as Tab, label: 'Profil Pro' }] : []),
  ]

  return (
    <div className="page">
      <Nav />
      <div className="content-medium">

        {/* Payment banner */}
        {paymentBanner === 'success' && (
          <div className="info-banner success flex items-center gap-10 mb-16" style={{ animation: 'fadeIn .5s' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#34d399' }}>Paiement réussi !</div>
              <div className="text-xs text-muted">Crédits et tickets ajoutés. Bonne chance pour le tirage !</div>
            </div>
          </div>
        )}

        {/* Header */}
        <h1 className="heading-lg mb-8">
          Bonjour, {user.name || 'voyageur'}
        </h1>
        <p className="text-xs text-muted mb-16">
          {user.type === 'pro' ? `Compte professionnel · ${user.pro_category || ''}` : 'Compte particulier'}
        </p>

        {/* Stats */}
        <div className="stats-grid mb-16">
          <div className="balance-card gold" style={{ borderRadius: 12, padding: '14px 12px' }}>
            <div className="stat-lg" style={{ color: 'var(--a)' }}>{user.credits}</div>
            <div className="stat-label">CRÉDITS</div>
          </div>
          <div className="balance-card purple" style={{ borderRadius: 12, padding: '14px 12px' }}>
            <div className="stat-lg" style={{ color: '#a78bfa' }}>{user.tickets}</div>
            <div className="stat-label">TICKETS</div>
          </div>
          <div className="balance-card green" style={{ borderRadius: 12, padding: '14px 12px' }} onClick={copyReferral}>
            <div className="mono" style={{ fontSize: 14, color: '#34d399', fontWeight: 700 }}>{user.referral_code}</div>
            <div className="stat-label" style={{ color: copied ? '#34d399' : undefined }}>{copied ? 'COPIÉ !' : 'PARRAINAGE'}</div>
          </div>
        </div>

        {/* Gauge */}
        <div className="fomo-bar mb-16">
          <div className="flex justify-between mb-8">
            <span className="text-xs text-muted" style={{ fontWeight: 600 }}>Villa 695 000€</span>
            <span className="mono text-xs text-gold">Vos tickets : {user.tickets}</span>
          </div>
          <div className="gauge-bar" style={{ height: 5 }}>
            <div className="gauge-fill" style={{ width: `${((user.tickets || 0) / GAUGE_TOTAL) * 100}%` }} />
          </div>
        </div>

        {/* Quick actions */}
        <div className="quick-actions mb-20">
          <Link href="/poster" className="btn-primary" style={{ flex: '1 1 100px', padding: '10px 12px', fontSize: 11, textAlign: 'center' }}>
            + Poster
          </Link>
          <Link href="/credits" className="btn-secondary" style={{ flex: '1 1 100px', padding: '10px 12px', fontSize: 11, textAlign: 'center' }}>
            Acheter crédits
          </Link>
          <Link href="/match" className="btn-secondary" style={{ flex: '1 1 100px', padding: '10px 12px', fontSize: 11, textAlign: 'center' }}>
            Matching
          </Link>
        </div>

        {/* Tabs */}
        <div className="tabs-bar mb-16">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`tab-btn ${tab === t.id ? 'active' : ''}`}
              style={{ fontSize: 11 }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB: Annonces */}
        {tab === 'annonces' && (
          <div>
            {listingsLoading ? (
              <div className="text-center text-xs text-muted" style={{ padding: 30 }}>Chargement...</div>
            ) : listings.length === 0 ? (
              <div className="card text-center" style={{ padding: '30px 20px' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,.4)' }}>Aucune annonce</div>
                <div className="text-xs text-muted" style={{ marginTop: 4, marginBottom: 14 }}>
                  {user.free_listing_used ? 'Achetez un crédit pour poster' : 'Votre 1re annonce est gratuite !'}
                </div>
                <Link href="/poster" className="btn-primary" style={{ padding: '10px 20px', fontSize: 11 }}>
                  Poster maintenant
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {listings.map(l => (
                  <div key={l.id} className={`card ${l.is_boosted ? 'listing-card-boosted' : ''}`} style={{ padding: '14px 16px' }}>
                    <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 2 }}>{l.title}</div>
                        <div className="text-xs text-muted">{l.location}</div>
                        {l.price && <div className="mono text-gold" style={{ fontSize: 13, marginTop: 4 }}>{l.price.toLocaleString('fr-FR')}€</div>}
                      </div>
                      {l.is_boosted ? (
                        <span className="badge" style={{ background: 'rgba(207,175,75,.08)', color: 'var(--a)', fontSize: 9, fontWeight: 700 }}>BOOSTÉ</span>
                      ) : (
                        <button onClick={() => handleBoost(l.id)} disabled={user.credits < 1 || boosting === l.id}
                          className="chip-btn" style={{ cursor: user.credits > 0 ? 'pointer' : 'not-allowed', color: user.credits > 0 ? 'var(--a)' : 'rgba(255,255,255,.25)' }}>
                          {boosting === l.id ? '...' : 'Booster (1 cr)'}
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
            <div className="card-gold text-center mb-12">
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Vous avez {user.credits} crédit{user.credits > 1 ? 's' : ''} et {user.tickets} ticket{user.tickets > 1 ? 's' : ''}</div>
              <div className="text-xs text-muted">Chaque crédit = 1 action + 1 ticket OFFERT pour le jeu concours</div>
              <Link href="/credits" className="btn-primary mt-12" style={{ padding: '10px 24px', fontSize: 12 }}>
                Acheter des crédits
              </Link>
            </div>

            {/* Referral */}
            <div className="info-banner green flex justify-between items-center" style={{ cursor: 'pointer', flexWrap: 'wrap', gap: 8, borderRadius: 12, padding: '14px 16px' }} onClick={copyReferral}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>Parrainez un ami</div>
                <div className="text-xs text-muted" style={{ marginTop: 2 }}>+1 ticket gratuit pour vous deux</div>
              </div>
              <span className="text-xs" style={{ color: '#34d399', fontWeight: 700 }}>{copied ? 'Copié !' : 'Copier le lien'}</span>
            </div>
          </div>
        )}

        {/* TAB: Matchs */}
        {tab === 'matchs' && (
          <div className="card text-center" style={{ padding: '30px 20px' }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,.4)' }}>Vos matchs apparaîtront ici</div>
            <div className="text-xs text-muted" style={{ marginTop: 4, marginBottom: 14 }}>Swipez pour connecter avec des professionnels et particuliers</div>
            <Link href="/match" className="btn-secondary" style={{ padding: '10px 20px', fontSize: 11 }}>
              Aller au matching
            </Link>
          </div>
        )}

        {/* TAB: Profil Pro */}
        {tab === 'profil' && isPro && (
          <div>
            {/* Profile card */}
            <div className="card-gold mb-16">
              <div className="flex gap-10 items-center mb-16" style={{ flexWrap: 'wrap' }}>
                {/* Photo or placeholder */}
                <div style={{
                  width: 56, height: 56, borderRadius: 12, flexShrink: 0,
                  background: user.pro_photo ? `url(${user.pro_photo}) center/cover` : 'rgba(207,175,75,.1)',
                  border: '1px solid rgba(207,175,75,.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {!user.pro_photo && <span style={{ fontSize: 22 }}>&#128100;</span>}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{user.name || 'Sans nom'}</div>
                  <div className="text-xs text-gold" style={{ fontWeight: 600, marginTop: 2 }}>{user.pro_category || 'Pro'}</div>
                  {user.pro_specialty && <div className="text-xs text-muted" style={{ marginTop: 2 }}>{user.pro_specialty}</div>}
                  {user.pro_zone && <div className="text-xs text-muted" style={{ marginTop: 1 }}>{user.pro_zone}</div>}
                </div>
              </div>

              {/* Rating + transactions */}
              <div className="flex gap-10" style={{ flexWrap: 'wrap' }}>
                <div style={{ padding: '8px 14px', background: 'rgba(207,175,75,.06)', borderRadius: 8, textAlign: 'center' }}>
                  <div className="mono" style={{ fontSize: 16, color: 'var(--a)', letterSpacing: 1 }}>{renderStars(user.pro_rating || 0)}</div>
                  <div className="stat-label">{user.pro_rating ? `${user.pro_rating}/5` : 'Pas encore noté'}</div>
                </div>
                <div style={{ padding: '8px 14px', background: 'rgba(255,255,255,.03)', borderRadius: 8, textAlign: 'center' }}>
                  <div className="mono" style={{ fontSize: 18, color: '#fff', fontWeight: 700 }}>{user.pro_transactions || 0}</div>
                  <div className="stat-label">TRANSACTIONS</div>
                </div>
              </div>
            </div>

            {/* Edit fields */}
            <div className="card mb-16">
              <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 14 }}>Modifier mon profil</div>

              <label className="form-label">Spécialité</label>
              <input
                type="text"
                value={proSpecialty}
                onChange={e => setProSpecialty(e.target.value)}
                placeholder="Ex : vente, estimation, prêt immobilier..."
                className="mb-12"
              />

              <label className="form-label">Zone d&apos;intervention</label>
              <input
                type="text"
                value={proZone}
                onChange={e => setProZone(e.target.value)}
                placeholder="Ex : Pays Basque, Landes, Bordeaux..."
                className="mb-14"
              />

              <button
                onClick={handleProSave}
                disabled={proSaving}
                className={proSaved ? 'btn-secondary' : 'btn-primary'}
                style={{ padding: '10px 24px', fontSize: 12, ...(proSaved ? { borderColor: 'rgba(52,211,153,.2)', color: '#34d399' } : {}) }}
              >
                {proSaving ? 'Enregistrement...' : proSaved ? 'Enregistré' : 'Enregistrer'}
              </button>
            </div>

            {/* Reviews */}
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 12 }}>Avis reçus</div>
              {reviewsLoading ? (
                <div className="text-xs text-muted text-center" style={{ padding: 16 }}>Chargement...</div>
              ) : reviews.length === 0 ? (
                <div className="text-xs text-muted text-center" style={{ padding: 16 }}>Aucun avis pour le moment</div>
              ) : (
                <div className="flex flex-col gap-8">
                  {reviews.map(r => (
                    <div key={r.id} style={{ padding: '12px 14px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)', borderRadius: 10 }}>
                      <div className="flex justify-between items-center" style={{ marginBottom: 4, flexWrap: 'wrap', gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{(r as Review & { reviewer_name?: string }).reviewer_name || 'Anonyme'}</span>
                        <span className="mono text-gold" style={{ fontSize: 12 }}>{renderStars(r.rating)}</span>
                      </div>
                      {r.comment && <div className="text-xs text-muted" style={{ lineHeight: 1.4 }}>{r.comment}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
