'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/lib/context'
import Nav from '@/components/Nav'
import MediaUpload from '@/components/MediaUpload'
import { Listing, Review, Reservation, ReservationStatus, CreditPurchase, CreditUsage } from '@/types'

type Tab = 'annonces' | 'reservations' | 'credits' | 'matchs' | 'profil'

const STATUS_STYLES: Record<ReservationStatus, { bg: string; color: string; label: string }> = {
  active: { bg: 'rgba(52,211,153,.1)', color: '#34d399', label: 'Active' },
  contacted: { bg: 'rgba(96,165,250,.1)', color: '#60a5fa', label: 'Contacté' },
  expired: { bg: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.35)', label: 'Expirée' },
  cancelled: { bg: 'rgba(239,68,68,.1)', color: '#ef4444', label: 'Annulée' },
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffH = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffH < 1) return 'il y a quelques minutes'
  if (diffH < 24) return `il y a ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return 'il y a 1 jour'
  return `il y a ${diffD} jours`
}

export default function ComptePage() {
  const { user, loading, refresh } = useUser()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('annonces')
  const [listings, setListings] = useState<Listing[]>([])
  const [listingsLoading, setListingsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [paymentBanner, setPaymentBanner] = useState<'success' | null>(null)
  const [boosting, setBoosting] = useState<string | null>(null)

  // Reservations state
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [reservationsLoading, setReservationsLoading] = useState(false)

  // Owner reservation counts per listing
  const [ownerCounts, setOwnerCounts] = useState<Record<string, number>>({})

  // Pro profile state
  const [proSpecialty, setProSpecialty] = useState('')
  const [proZone, setProZone] = useState('')
  const [proPhoto, setProPhoto] = useState('')
  const [proPhotoSaving, setProPhotoSaving] = useState(false)
  const [proSaving, setProSaving] = useState(false)
  const [proSaved, setProSaved] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)

  // Credit history state
  const [purchases, setPurchases] = useState<CreditPurchase[]>([])
  const [usages, setUsages] = useState<(CreditUsage & { listing_title?: string })[]>([])
  const [creditHistoryLoading, setCreditHistoryLoading] = useState(false)

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
      .then(d => {
        const fetched: Listing[] = d.listings || []
        setListings(fetched)
        // Fetch reservation counts for owner's listings
        fetched.forEach(l => {
          fetch(`/api/reservations/count?listingId=${l.id}`)
            .then(r => r.json())
            .then(d => setOwnerCounts(prev => ({ ...prev, [l.id]: d.count ?? 0 })))
            .catch(() => {})
        })
      })
      .catch(() => {})
      .finally(() => setListingsLoading(false))
  }, [user])

  // Load reservations when tab is active
  useEffect(() => {
    if (!user || tab !== 'reservations') return
    setReservationsLoading(true)
    fetch('/api/reservations/mine')
      .then(r => r.json())
      .then(d => setReservations(d.reservations || []))
      .catch(() => {})
      .finally(() => setReservationsLoading(false))
  }, [user, tab])

  // Init pro fields from user
  useEffect(() => {
    if (!user || user.type !== 'pro') return
    setProSpecialty(user.pro_specialty || '')
    setProZone(user.pro_zone || '')
    setProPhoto(user.pro_photo || '')
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

  // Load credit history when credits tab is active
  useEffect(() => {
    if (!user || tab !== 'credits') return
    setCreditHistoryLoading(true)
    Promise.all([
      fetch('/api/credits/purchases').then(r => r.json()).catch(() => ({ purchases: [] })),
      fetch('/api/credits/usage').then(r => r.json()).catch(() => ({ usages: [] })),
    ]).then(([pData, uData]) => {
      setPurchases(pData.purchases || [])
      setUsages(uData.usages || [])
    }).finally(() => setCreditHistoryLoading(false))
  }, [user, tab])

  // Redirect if not logged in — must be before early returns
  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user, router])

  if (loading || !user) return (
    <div className="loading-page">
      <div className="loading-text">Chargement...</div>
    </div>
  )

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

  async function handleProPhotoUpload(urls: string[]) {
    const url = urls[0] || ''
    setProPhoto(url)
    if (!url) return
    setProPhotoSaving(true)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pro_photo: url }),
      })
      if (res.ok) await refresh()
    } catch { /* */ } finally { setProPhotoSaving(false) }
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
    { id: 'reservations', label: 'Réservations' },
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
          {isPro && user.pro_rating != null && (
            <div className="balance-card gold" style={{ borderRadius: 12, padding: '14px 12px' }}>
              <div className="stat-lg" style={{ color: 'var(--a)' }}>&#9733; {user.pro_rating}</div>
              <div className="stat-label">NOTE MOYENNE</div>
              <div className="text-xs text-muted" style={{ marginTop: 2, fontSize: 9 }}>{user.review_count} avis</div>
            </div>
          )}
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
                    {(ownerCounts[l.id] ?? 0) > 0 && (
                      <div className="text-xs" style={{ color: '#f472b6', fontWeight: 600, marginTop: 6 }}>
                        {ownerCounts[l.id]} réservation{ownerCounts[l.id] > 1 ? 's' : ''} reçue{ownerCounts[l.id] > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Réservations */}
        {tab === 'reservations' && (
          <div>
            {reservationsLoading ? (
              <div className="text-center text-xs text-muted" style={{ padding: 30 }}>Chargement...</div>
            ) : reservations.length === 0 ? (
              <div className="card text-center" style={{ padding: '30px 20px' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,.4)' }}>Aucune réservation</div>
                <div className="text-xs text-muted" style={{ marginTop: 4, marginBottom: 14 }}>
                  Parcourez les annonces pour réserver un bien.
                </div>
                <Link href="/annonces" className="btn-primary" style={{ padding: '10px 20px', fontSize: 11 }}>
                  Voir les annonces
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {reservations.map(r => {
                  const listing = r.listings
                  const style = STATUS_STYLES[r.status] || STATUS_STYLES.active
                  return (
                    <div key={r.id} className="card" style={{ padding: '14px 16px' }}>
                      <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 2 }}>
                            {listing?.title || 'Annonce'}
                          </div>
                          <div className="text-xs text-muted">{listing?.location || ''}</div>
                          {listing?.price && (
                            <div className="mono text-gold" style={{ fontSize: 13, marginTop: 4 }}>
                              {listing.subcategory === 'location'
                                ? `${listing.price.toLocaleString('fr-FR')}€/mois`
                                : `${listing.price.toLocaleString('fr-FR')}€`}
                            </div>
                          )}
                        </div>
                        <span className="badge" style={{
                          padding: '2px 8px', borderRadius: 4,
                          background: style.bg, color: style.color,
                          fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                        }}>
                          {style.label}
                        </span>
                      </div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,.18)', marginTop: 6 }}>
                        Réservé {timeAgo(r.created_at)}
                      </div>
                    </div>
                  )
                })}
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

            {/* Social comparison FOMO */}
            {(() => {
              const avg = 8
              const userTickets = user.tickets
              const aboveAvg = userTickets >= avg
              return (
                <div className="text-xs" style={{ marginBottom: 12, padding: '0 2px' }}>
                  <span style={{ color: 'rgba(255,255,255,.45)' }}>
                    Vous avez <span style={{ fontWeight: 700, color: 'var(--a)' }}>{userTickets} ticket{userTickets > 1 ? 's' : ''}</span>.
                    La moyenne des utilisateurs est à {avg}.
                  </span>
                  {aboveAvg ? (
                    <span style={{ color: '#34d399', fontWeight: 600, marginLeft: 6 }}>
                      Vous êtes au-dessus de la moyenne !
                    </span>
                  ) : (
                    <span style={{ display: 'block', marginTop: 4 }}>
                      <Link href="/credits" style={{ color: '#f472b6', fontWeight: 600, textDecoration: 'none', fontSize: 11 }}>
                        Achetez des crédits pour augmenter vos chances
                      </Link>
                    </span>
                  )}
                </div>
              )
            })()}

            {/* Referral — enhanced */}
            <div className="card mb-12" style={{ padding: '14px 16px', borderRadius: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 8 }}>Parrainez un ami</div>
              <div className="text-xs text-muted" style={{ marginBottom: 10 }}>+1 ticket gratuit pour vous deux</div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10,
                background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
                borderRadius: 8, padding: '8px 10px',
              }}>
                <span className="mono text-xs" style={{ color: 'rgba(255,255,255,.5)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 10 }}>
                  {typeof window !== 'undefined' ? `${window.location.origin}/login?ref=${user.referral_code}` : `howner.fr/login?ref=${user.referral_code}`}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={copyReferral} className="btn-primary" style={{ padding: '7px 14px', fontSize: 11, flex: 1 }}>
                  {copied ? 'Copié !' : 'Copier le lien'}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Rejoignez Howner et gagnez 1 ticket pour la villa à 695 000€ ! ${typeof window !== 'undefined' ? window.location.origin : 'https://howner.fr'}/login?ref=${user.referral_code}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ padding: '7px 14px', fontSize: 11, flex: 1, textAlign: 'center', textDecoration: 'none' }}
                >
                  Partager WhatsApp
                </a>
              </div>
            </div>

            {/* Historique des achats */}
            <div className="card mb-12" style={{ padding: '14px 16px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 10 }}>Historique des achats</div>
              {creditHistoryLoading ? (
                <div className="text-xs text-muted text-center" style={{ padding: 12 }}>Chargement...</div>
              ) : purchases.length === 0 ? (
                <div className="text-xs text-muted text-center" style={{ padding: 12 }}>Aucun achat pour le moment</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {purchases.map(p => (
                    <div key={p.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 10px', background: 'rgba(255,255,255,.02)', borderRadius: 8,
                      border: '1px solid rgba(255,255,255,.04)',
                    }}>
                      <div>
                        <div className="text-xs" style={{ fontWeight: 600, color: '#fff' }}>
                          {p.pack_type.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className="text-xs text-muted" style={{ fontSize: 10, marginTop: 2 }}>
                          {new Date(p.created_at).toLocaleDateString('fr-FR')} · {p.credits} crédits + {p.tickets} tickets
                        </div>
                      </div>
                      <div className="mono text-gold" style={{ fontSize: 12, fontWeight: 700 }}>
                        {(p.amount_cents / 100).toFixed(0)}€
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Historique des utilisations */}
            <div className="card" style={{ padding: '14px 16px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 10 }}>Historique des utilisations</div>
              {creditHistoryLoading ? (
                <div className="text-xs text-muted text-center" style={{ padding: 12 }}>Chargement...</div>
              ) : usages.length === 0 ? (
                <div className="text-xs text-muted text-center" style={{ padding: 12 }}>Aucune utilisation</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {usages.map(u => (
                    <div key={u.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 10px', background: 'rgba(255,255,255,.02)', borderRadius: 8,
                      border: '1px solid rgba(255,255,255,.04)',
                    }}>
                      <div>
                        <div className="text-xs" style={{ fontWeight: 600, color: '#fff' }}>
                          {u.action === 'listing' ? 'Publication annonce' :
                           u.action === 'boost' ? 'Boost 24h' :
                           u.action === 'alert' ? 'Alerte activée' :
                           u.action === 'reservation' ? 'Réservation' :
                           u.action === 'estimation' ? 'Estimation' : u.action}
                        </div>
                        <div className="text-xs text-muted" style={{ fontSize: 10, marginTop: 2 }}>
                          {new Date(u.created_at).toLocaleDateString('fr-FR')}
                          {u.listing_title ? ` · ${u.listing_title}` : ''}
                        </div>
                      </div>
                      <span className="text-xs" style={{ color: '#f472b6', fontWeight: 600 }}>-1 cr</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Matchs */}
        {tab === 'matchs' && (
          <div className="card text-center" style={{ padding: '30px 20px' }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,.4)' }}>Vos matchs apparaîtront ici</div>
            <div className="text-xs text-muted" style={{ marginTop: 4, marginBottom: 8 }}>Swipez pour connecter avec des professionnels et particuliers</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,.25)', marginBottom: 14, fontStyle: 'italic' }}>
              Après un match ou une réservation, vous pourrez noter votre interlocuteur.
            </div>
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

              <label className="form-label">Photo de profil</label>
              <div className="mb-14">
                <MediaUpload
                  type="photo"
                  maxFiles={1}
                  maxSizeMB={5}
                  onUpload={handleProPhotoUpload}
                  existingUrls={proPhoto ? [proPhoto] : []}
                />
                {proPhotoSaving && (
                  <div className="text-xs" style={{ color: 'var(--a)', marginTop: 6, fontWeight: 600 }}>
                    Enregistrement...
                  </div>
                )}
              </div>

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
