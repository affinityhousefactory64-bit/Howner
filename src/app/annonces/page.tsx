'use client'

import { useState, useEffect } from 'react'
import { Listing, Alert } from '@/types'
import { useUser } from '@/lib/context'
import Nav from '@/components/Nav'
import Link from 'next/link'
import LocationInput from '@/components/LocationInput'

const FILTERS = [
  { id: '', label: 'Tous' },
  { id: 'immo', label: 'Immobilier' },
  { id: 'service', label: 'Services' },
  { id: 'demande', label: 'Demandes' },
]

const SUB_LABELS: Record<string, string> = {
  vente: 'Vente', location: 'Location',
  recherche_achat: 'Recherche achat', recherche_location: 'Recherche location',
  offre_service: 'Service', recherche_service: 'Demande',
}

const SUB_COLORS: Record<string, string> = {
  vente: '#cfaf4b', location: '#60a5fa',
  recherche_achat: '#f472b6', recherche_location: '#a78bfa',
  offre_service: '#34d399', recherche_service: '#fbbf24',
}

function getReserveLabel(subcategory: string): string {
  switch (subcategory) {
    case 'location': return 'Postuler en premier'
    case 'vente': return 'Réserver une visite'
    case 'recherche_achat':
    case 'recherche_location': return 'Réserver'
    default: return 'Réserver un RDV'
  }
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

// Derive a consistent pseudo-random number (1-8) from UUID first chars
function fomoViewers(id: string): number {
  let hash = 0
  for (let i = 0; i < Math.min(8, id.length); i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i)
    hash |= 0
  }
  return (Math.abs(hash) % 8) + 1
}

function isLessThan7DaysOld(dateStr: string): boolean {
  return Date.now() - new Date(dateStr).getTime() < 7 * 24 * 60 * 60 * 1000
}

type OwnerInfo = { rating: number | null; count: number; name: string }

const PROPERTY_TYPES = [
  { id: '', label: 'Tous' },
  { id: 'appartement', label: 'Appartement' },
  { id: 'maison', label: 'Maison' },
  { id: 'terrain', label: 'Terrain' },
]

const PRO_TYPES = [
  { id: '', label: 'Tous' },
  { id: 'agent', label: 'Agent' },
  { id: 'courtier', label: 'Courtier' },
  { id: 'artisan', label: 'Artisan' },
  { id: 'architecte', label: 'Architecte' },
]

const URGENCY_TYPES = [
  { id: '', label: 'Tous' },
  { id: 'urgent', label: 'Urgent' },
]

// Bonne affaire scoring
const REGIONAL_AVG: Record<string, number> = {
  bayonne: 3500, biarritz: 5500, anglet: 4000, boucau: 3000,
}
const DEFAULT_AVG = 3500

function getBonneAffaireScore(listing: Listing): { label: string; color: string } | null {
  if (listing.category !== 'immo' || listing.subcategory !== 'vente') return null
  if (!listing.price || !listing.surface || listing.surface === 0) return null
  const pricePerM2 = listing.price / listing.surface
  const city = (listing.location || '').toLowerCase()
  let avg = DEFAULT_AVG
  for (const [key, val] of Object.entries(REGIONAL_AVG)) {
    if (city.includes(key)) { avg = val; break }
  }
  const ratio = pricePerM2 / avg
  if (ratio < 0.8) return { label: 'Bonne affaire', color: '#34d399' }
  if (ratio <= 1.1) return { label: 'Prix correct', color: 'rgba(255,255,255,.4)' }
  return null
}

export default function AnnoncesPage() {
  const { user } = useUser()
  const [listings, setListings] = useState<Listing[]>([])
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [reserving, setReserving] = useState<string | null>(null)
  const [successId, setSuccessId] = useState<string | null>(null)
  const [owners, setOwners] = useState<Record<string, OwnerInfo>>({})

  // Advanced filters
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [surfaceMin, setSurfaceMin] = useState('')
  const [surfaceMax, setSurfaceMax] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [proType, setProType] = useState('')
  const [urgency, setUrgency] = useState('')

  // Alerts
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [creatingAlert, setCreatingAlert] = useState(false)
  const [alertSuccess, setAlertSuccess] = useState(false)

  useEffect(() => { fetchListings() }, [filter])

  // Fetch alerts on mount
  useEffect(() => {
    if (user) fetchAlerts()
  }, [user])

  async function fetchAlerts() {
    try {
      const res = await fetch('/api/alerts')
      const data = await res.json()
      if (res.ok) setAlerts(data.alerts || [])
    } catch { /* */ }
  }

  async function handleCreateAlert() {
    if (!user) {
      alert('Connectez-vous pour creer une alerte')
      return
    }
    setCreatingAlert(true)
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: filter || null,
          subcategory: null,
          location: search || null,
          price_min: priceMin ? parseInt(priceMin) : null,
          price_max: priceMax ? parseInt(priceMax) : null,
          surface_min: surfaceMin ? parseInt(surfaceMin) : null,
          property_type: propertyType || null,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setAlertSuccess(true)
        setTimeout(() => setAlertSuccess(false), 3000)
        await fetchAlerts()
      } else {
        alert(data.error || 'Erreur lors de la création de l\'alerte')
      }
    } catch {
      alert('Erreur réseau')
    } finally {
      setCreatingAlert(false)
    }
  }

  // Reset sub-filters when category changes
  function handleCategoryChange(cat: string) {
    setPriceMin(''); setPriceMax('')
    setSurfaceMin(''); setSurfaceMax('')
    setPropertyType(''); setProType(''); setUrgency('')
    setFilter(cat)
  }

  async function fetchListings() {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter) params.set('category', filter)
    if (search) params.set('location', search)
    if (priceMin) params.set('price_min', priceMin)
    if (priceMax) params.set('price_max', priceMax)
    if (surfaceMin) params.set('surface_min', surfaceMin)
    if (surfaceMax) params.set('surface_max', surfaceMax)
    if (propertyType) params.set('property_type', propertyType)
    if (urgency) params.set('urgency', urgency)
    const res = await fetch(`/api/listings?${params}`)
    const data = await res.json()
    const fetched: Listing[] = data.listings || []
    setListings(fetched)
    setLoading(false)

    // Fetch reservation counts
    const newCounts: Record<string, number> = {}
    await Promise.all(
      fetched.map(async (l) => {
        try {
          const r = await fetch(`/api/reservations/count?listingId=${l.id}`)
          const d = await r.json()
          newCounts[l.id] = d.count ?? 0
        } catch {
          newCounts[l.id] = 0
        }
      })
    )
    setCounts(newCounts)

    // Fetch owner info (ratings)
    const uniqueUserIds = [...new Set(fetched.map(l => l.user_id))]
    const ownerMap: Record<string, OwnerInfo> = {}
    await Promise.all(
      uniqueUserIds.map(async (uid) => {
        try {
          const r = await fetch(`/api/users/${uid}`)
          const d = await r.json()
          if (d.user) {
            ownerMap[uid] = {
              rating: d.user.pro_rating ?? null,
              count: d.user.review_count ?? 0,
              name: d.user.name || '',
            }
          }
        } catch { /* */ }
      })
    )
    setOwners(ownerMap)
  }

  async function handleReserve(listingId: string) {
    if (!user) {
      alert('Connectez-vous pour réserver')
      return
    }
    setReserving(listingId)
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      })
      const data = await res.json()
      if (res.ok) {
        setCounts(prev => ({ ...prev, [listingId]: (prev[listingId] || 0) + 1 }))
        setSuccessId(listingId)
        setTimeout(() => setSuccessId(null), 3000)
      } else {
        alert(data.error || 'Erreur lors de la réservation')
      }
    } catch {
      alert('Erreur réseau')
    } finally {
      setReserving(null)
    }
  }

  return (
    <div className="page">
      <Nav />
      <div className="content-wide" style={{ paddingBottom: 0 }}>
        <div className="flex justify-between items-center mb-20" style={{ flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h1 className="heading-lg mb-8">Annonces</h1>
            <p className="text-xs text-muted">Immobilier · Services · Demandes</p>
          </div>
          <Link href="/poster" className="btn-primary" style={{ padding: '8px 16px', fontSize: 11 }}>
            + Poster
          </Link>
        </div>

        {/* Search */}
        <div className="flex gap-6 mb-12" onKeyDown={e => { if (e.key === 'Enter') fetchListings() }}>
          <div style={{ flex: 1 }}>
            <LocationInput
              value={search}
              onChange={(city) => setSearch(city)}
              placeholder="Rechercher par ville..."
            />
          </div>
          <button onClick={fetchListings} className="btn-primary" style={{ padding: '9px 16px', fontSize: 11 }}>
            Rechercher
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-6 mb-12" style={{ flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => handleCategoryChange(f.id)}
              className={`filter-chip ${filter === f.id ? 'active' : ''}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Advanced sub-filters */}
        {filter === 'immo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="text-xs text-muted" style={{ fontWeight: 600, minWidth: 50 }}>Budget</span>
              <input type="number" placeholder="Min €" value={priceMin} onChange={e => setPriceMin(e.target.value)}
                onBlur={fetchListings}
                style={{ width: 90, padding: '6px 8px', fontSize: 11 }} />
              <input type="number" placeholder="Max €" value={priceMax} onChange={e => setPriceMax(e.target.value)}
                onBlur={fetchListings}
                style={{ width: 90, padding: '6px 8px', fontSize: 11 }} />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="text-xs text-muted" style={{ fontWeight: 600, minWidth: 50 }}>Surface</span>
              <input type="number" placeholder="Min m²" value={surfaceMin} onChange={e => setSurfaceMin(e.target.value)}
                onBlur={fetchListings}
                style={{ width: 90, padding: '6px 8px', fontSize: 11 }} />
              <input type="number" placeholder="Max m²" value={surfaceMax} onChange={e => setSurfaceMax(e.target.value)}
                onBlur={fetchListings}
                style={{ width: 90, padding: '6px 8px', fontSize: 11 }} />
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {PROPERTY_TYPES.map(pt => (
                <button key={pt.id} onClick={() => { setPropertyType(pt.id); setTimeout(fetchListings, 0) }}
                  className={`filter-chip ${propertyType === pt.id ? 'active' : ''}`}
                  style={{ padding: '4px 10px', fontSize: 10 }}>
                  {pt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {filter === 'service' && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 20 }}>
            {PRO_TYPES.map(pt => (
              <button key={pt.id} onClick={() => { setProType(pt.id); setTimeout(fetchListings, 0) }}
                className={`filter-chip ${proType === pt.id ? 'active' : ''}`}
                style={{ padding: '4px 10px', fontSize: 10 }}>
                {pt.label}
              </button>
            ))}
          </div>
        )}

        {filter === 'demande' && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 20 }}>
            {URGENCY_TYPES.map(u => (
              <button key={u.id} onClick={() => { setUrgency(u.id); setTimeout(fetchListings, 0) }}
                className={`filter-chip ${urgency === u.id ? 'active' : ''}`}
                style={{ padding: '4px 10px', fontSize: 10 }}>
                {u.label}
              </button>
            ))}
          </div>
        )}

        {/* Alert banner */}
        {user && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 8, flexWrap: 'wrap',
            padding: '10px 14px', marginBottom: 16,
            background: 'rgba(207,175,75,.04)',
            border: '1px solid rgba(207,175,75,.1)',
            borderRadius: 10,
          }}>
            <div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>
                Activez une alerte pour etre notifie des nouvelles annonces
                {alerts.length > 0 && (
                  <span style={{ color: 'var(--a)', marginLeft: 6 }}>
                    {alerts.length} alerte{alerts.length > 1 ? 's' : ''} active{alerts.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,.2)', marginTop: 2, fontSize: 10 }}>
                1re alerte gratuite, puis 1 credit par alerte -- Valable 30 jours
              </div>
            </div>
            {alertSuccess ? (
              <span className="text-xs" style={{ color: '#34d399', fontWeight: 700, whiteSpace: 'nowrap' }}>
                Alerte creee !
              </span>
            ) : (
              <button
                onClick={handleCreateAlert}
                disabled={creatingAlert}
                style={{
                  background: 'rgba(207,175,75,.12)', border: '1px solid rgba(207,175,75,.2)',
                  borderRadius: 8, padding: '6px 14px', fontSize: 11, fontWeight: 700,
                  fontFamily: 'var(--b)', color: 'var(--a)', cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                {creatingAlert ? 'Creation...' : 'Creer une alerte'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Listings */}
      <div className="content-wide" style={{ paddingTop: 0 }}>
        {loading ? (
          <div className="text-center text-xs text-muted" style={{ padding: 40 }}>Chargement...</div>
        ) : listings.length === 0 ? (
          <div className="text-center" style={{ padding: '60px 20px' }}>
            <h2 className="heading-md" style={{ marginBottom: 10, color: '#fff' }}>Soyez parmi les premiers</h2>
            <p className="text-sm text-muted" style={{ maxWidth: 420, margin: '0 auto 24px', lineHeight: 1.7 }}>
              Les premières annonces arrivent. Publiez la vôtre et gagnez en visibilité dès le lancement.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
              <Link href="/poster" className="btn-primary" style={{ padding: '12px 24px', fontSize: 13 }}>
                Publier une annonce — gratuit
              </Link>
              <button onClick={handleCreateAlert} className="btn-secondary" style={{ padding: '12px 24px', fontSize: 13 }}>
                Activer une alerte
              </button>
            </div>
            <p className="text-xs" style={{ color: 'rgba(207,175,75,.5)', fontWeight: 600 }}>
              Chaque annonce publiée vous rapproche de la villa à 695 000€
            </p>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map(l => {
              const color = SUB_COLORS[l.subcategory] || '#cfaf4b'
              const count = counts[l.id] || 0
              const score = getBonneAffaireScore(l)
              return (
                <div key={l.id} className={`card ${l.is_boosted ? 'listing-card-boosted' : ''}`} style={{ padding: 0, overflow: 'hidden' }}>
                  {/* Photo header */}
                  {l.photos && l.photos.length > 0 ? (
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      paddingBottom: '56.25%',
                      background: `url(${l.photos[0]}) center/cover no-repeat`,
                    }}>
                      {l.video && (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: 'rgba(0,0,0,.55)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <div style={{
                            width: 0,
                            height: 0,
                            borderStyle: 'solid',
                            borderWidth: '8px 0 8px 14px',
                            borderColor: 'transparent transparent transparent #fff',
                            marginLeft: 2,
                          }} />
                        </div>
                      )}
                      {l.photos.length > 1 && (
                        <div style={{
                          position: 'absolute',
                          bottom: 6,
                          right: 8,
                          background: 'rgba(0,0,0,.6)',
                          borderRadius: 4,
                          padding: '2px 6px',
                          fontSize: 9,
                          fontWeight: 700,
                          color: '#fff',
                        }}>
                          {l.photos.length} photos
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      width: '100%',
                      paddingBottom: '30%',
                      background: 'linear-gradient(135deg, rgba(207,175,75,.06) 0%, rgba(255,255,255,.02) 100%)',
                    }} />
                  )}
                  <div style={{ padding: '14px 16px' }}>
                  <div className="flex items-center gap-6 mb-8">
                    <span className="badge" style={{
                      padding: '2px 7px', borderRadius: 4,
                      background: `${color}15`, border: `1px solid ${color}30`,
                      fontSize: 9, fontWeight: 700, color, textTransform: 'uppercase',
                    }}>
                      {SUB_LABELS[l.subcategory] || l.subcategory}
                    </span>
                    {l.is_boosted && (
                      <span className="badge" style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(207,175,75,.08)', fontSize: 8, fontWeight: 700, color: 'var(--a)' }}>BOOSTÉ</span>
                    )}
                    {count > 0 && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#f472b6' }}>
                        {count} réservation{count > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <Link href={`/annonces/${l.id}`} style={{ fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 2, textDecoration: 'none', display: 'block' }}>{l.title}</Link>
                  <div className="text-xs text-muted">{l.location}</div>
                  {l.surface && <div className="text-xs" style={{ color: 'rgba(255,255,255,.22)', marginTop: 2 }}>{l.surface} m²{l.rooms ? ` · ${l.rooms} pièce${l.rooms > 1 ? 's' : ''}` : ''}</div>}
                  {l.description && <p className="text-xs" style={{ color: 'rgba(255,255,255,.2)', marginTop: 5, lineHeight: 1.5 }}>{l.description}</p>}
                  {l.price && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <span className="mono text-gold" style={{ fontSize: 15, fontWeight: 700 }}>
                        {l.subcategory === 'location' ? `${l.price.toLocaleString('fr-FR')}€/mois` : `${l.price.toLocaleString('fr-FR')}€`}
                      </span>
                      {score && (
                        <span style={{
                          padding: '2px 7px', borderRadius: 4, fontSize: 9, fontWeight: 700,
                          color: score.color,
                          background: score.color === '#34d399' ? 'rgba(52,211,153,.1)' : 'rgba(255,255,255,.04)',
                          border: `1px solid ${score.color}30`,
                        }}>
                          {score.label}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,.18)', marginTop: 6 }}>
                    Publiée {timeAgo(l.created_at)}
                  </div>

                  {/* Owner rating */}
                  {owners[l.user_id] && (
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,.30)', marginTop: 4, fontSize: 10 }}>
                      {owners[l.user_id].name}
                      {owners[l.user_id].rating != null && (
                        <span style={{ color: 'var(--a)' }}>
                          {' '}&middot; &#9733; {owners[l.user_id].rating} &middot; {owners[l.user_id].count} avis
                        </span>
                      )}
                    </div>
                  )}

                  {/* FOMO viewers */}
                  {isLessThan7DaysOld(l.created_at) && (
                    <div className="text-xs fomo-pulse" style={{
                      color: '#e8856c', fontSize: 9, fontWeight: 600, marginTop: 4,
                    }}>
                      {fomoViewers(l.id)} personne{fomoViewers(l.id) > 1 ? 's' : ''} regardent
                    </div>
                  )}

                  {/* External link */}
                  {l.external_link && (
                    <a
                      href={l.external_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs"
                      style={{
                        display: 'inline-block',
                        marginTop: 6,
                        color: 'rgba(255,255,255,.35)',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: 10,
                        transition: 'color .2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--a)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.35)')}
                    >
                      Voir l&apos;annonce originale →
                    </a>
                  )}

                  {/* Reserve button */}
                  <div style={{ marginTop: 10 }}>
                    {successId === l.id ? (
                      <div className="text-xs" style={{ color: '#34d399', fontWeight: 600, padding: '7px 0' }}>
                        Réservation confirmée ! +1 ticket offert
                      </div>
                    ) : (
                      <button
                        onClick={() => handleReserve(l.id)}
                        disabled={reserving === l.id}
                        className="btn-primary"
                        style={{ width: '100%', padding: '8px 12px', fontSize: 11 }}
                      >
                        {reserving === l.id ? 'Réservation...' : `${getReserveLabel(l.subcategory)} — 1 cr`}
                      </button>
                    )}
                  </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="text-center text-xs" style={{ marginTop: 16, color: 'rgba(255,255,255,.15)' }}>
          {listings.length} annonce{listings.length > 1 ? 's' : ''}
        </div>
      </div>
    </div>
  )
}
