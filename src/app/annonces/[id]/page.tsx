'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Listing } from '@/types'
import { useUser } from '@/lib/context'
import Nav from '@/components/Nav'
import Link from 'next/link'

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

const DPE_COLORS: Record<string, string> = {
  A: '#34d399', B: '#6ee7b7', C: '#fbbf24', D: '#f59e0b',
  E: '#f97316', F: '#ef4444', G: '#dc2626',
}

function getReserveLabel(subcategory: string): string {
  switch (subcategory) {
    case 'location': return 'Postuler en premier'
    case 'vente': return 'Reserver une visite'
    case 'recherche_achat':
    case 'recherche_location': return 'Reserver'
    default: return 'Reserver un RDV'
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

type OwnerInfo = { rating: number | null; count: number; name: string }

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

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useUser()
  const [listing, setListing] = useState<Listing | null>(null)
  const [owner, setOwner] = useState<OwnerInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [reserving, setReserving] = useState(false)
  const [reserved, setReserved] = useState(false)
  const [count, setCount] = useState(0)
  const [copied, setCopied] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)

  useEffect(() => {
    if (!id) return
    fetchListing()
  }, [id])

  async function fetchListing() {
    setLoading(true)
    try {
      const res = await fetch(`/api/listings/${id}`)
      const data = await res.json()
      if (!res.ok || !data.listing) {
        setLoading(false)
        return
      }
      setListing(data.listing)

      // Fetch reservation count
      try {
        const rc = await fetch(`/api/reservations/count?listingId=${id}`)
        const rcd = await rc.json()
        setCount(rcd.count ?? 0)
      } catch { /* */ }

      // Fetch owner info
      try {
        const ow = await fetch(`/api/users/${data.listing.user_id}`)
        const owd = await ow.json()
        if (owd.user) {
          setOwner({
            rating: owd.user.pro_rating ?? null,
            count: owd.user.review_count ?? 0,
            name: owd.user.name || '',
          })
        }
      } catch { /* */ }
    } catch { /* */ }
    setLoading(false)
  }

  async function handleReserve() {
    if (!user) {
      alert('Connectez-vous pour reserver')
      return
    }
    setReserving(true)
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: id }),
      })
      const data = await res.json()
      if (res.ok) {
        setReserved(true)
        setCount(prev => prev + 1)
      } else {
        alert(data.error || 'Erreur lors de la réservation')
      }
    } catch {
      alert('Erreur réseau')
    } finally {
      setReserving(false)
    }
  }

  function handleShare() {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      // Fallback
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (loading) {
    return (
      <div className="page">
        <Nav />
        <div className="content-narrow text-center" style={{ paddingTop: 60 }}>
          <div className="text-xs text-muted">Chargement...</div>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="page">
        <Nav />
        <div className="content-narrow text-center" style={{ paddingTop: 60 }}>
          <h1 className="heading-lg mb-8">Annonce introuvable</h1>
          <Link href="/annonces" className="text-xs text-gold" style={{ textDecoration: 'none', fontWeight: 600 }}>
            Retour aux annonces
          </Link>
        </div>
      </div>
    )
  }

  const color = SUB_COLORS[listing.subcategory] || '#cfaf4b'
  const score = getBonneAffaireScore(listing)
  const photos = listing.photos && listing.photos.length > 0 ? listing.photos : null

  return (
    <div className="page">
      <Nav />
      <div className="content-narrow">
        {/* Back link */}
        <button
          onClick={() => router.back()}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,.4)', fontSize: 11, fontFamily: 'var(--b)',
            fontWeight: 600, marginBottom: 16, padding: 0,
          }}
        >
          &larr; Retour
        </button>

        {/* Photo gallery */}
        {photos && (
          <div style={{ marginBottom: 16 }}>
            <div style={{
              borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,.03)',
              position: 'relative', aspectRatio: '16/9',
            }}>
              <img
                src={photos[photoIndex]}
                alt={listing.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {photos.length > 1 && (
                <div style={{
                  position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', gap: 4,
                }}>
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIndex(i)}
                      style={{
                        width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer',
                        background: i === photoIndex ? '#fff' : 'rgba(255,255,255,.4)',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="flex items-center gap-6 mb-8" style={{ flexWrap: 'wrap' }}>
          <span className="badge" style={{
            padding: '3px 8px', borderRadius: 4,
            background: `${color}15`, border: `1px solid ${color}30`,
            fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase',
          }}>
            {SUB_LABELS[listing.subcategory] || listing.subcategory}
          </span>
          {listing.is_boosted && (
            <span className="badge" style={{ padding: '3px 7px', borderRadius: 4, background: 'rgba(207,175,75,.08)', fontSize: 9, fontWeight: 700, color: 'var(--a)' }}>BOOSTE</span>
          )}
          {score && (
            <span style={{
              padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
              color: score.color,
              background: score.color === '#34d399' ? 'rgba(52,211,153,.1)' : 'rgba(255,255,255,.04)',
              border: `1px solid ${score.color}30`,
            }}>
              {score.label}
            </span>
          )}
          {count > 0 && (
            <span style={{ fontSize: 10, fontWeight: 700, color: '#f472b6' }}>
              {count} réservation{count > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4, fontFamily: 'var(--b)' }}>
          {listing.title}
        </h1>

        {/* Location */}
        <div className="text-xs text-muted" style={{ marginBottom: 8 }}>{listing.location}</div>

        {/* Surface & rooms */}
        {listing.surface && (
          <div className="text-xs" style={{ color: 'rgba(255,255,255,.3)', marginBottom: 4 }}>
            {listing.surface} m2
            {listing.rooms ? ` -- ${listing.rooms} piece${listing.rooms > 1 ? 's' : ''}` : ''}
            {listing.bedrooms ? ` -- ${listing.bedrooms} chambre${listing.bedrooms > 1 ? 's' : ''}` : ''}
            {listing.floor != null ? ` -- Etage ${listing.floor}` : ''}
          </div>
        )}

        {/* Property type */}
        {listing.property_type && (
          <div className="text-xs" style={{ color: 'rgba(255,255,255,.25)', marginBottom: 4, textTransform: 'capitalize' }}>
            {listing.property_type.replace('_', ' ')}
          </div>
        )}

        {/* DPE */}
        {listing.dpe && (
          <div style={{ display: 'inline-block', marginBottom: 8 }}>
            <span style={{
              padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
              background: `${DPE_COLORS[listing.dpe] || '#888'}20`,
              color: DPE_COLORS[listing.dpe] || '#888',
              border: `1px solid ${DPE_COLORS[listing.dpe] || '#888'}30`,
            }}>
              DPE {listing.dpe}
            </span>
          </div>
        )}

        {/* Price */}
        {listing.price && (
          <div className="mono text-gold" style={{ fontSize: 24, fontWeight: 700, marginTop: 8, marginBottom: 4 }}>
            {listing.subcategory === 'location'
              ? `${listing.price.toLocaleString('fr-FR')} €/mois`
              : `${listing.price.toLocaleString('fr-FR')} €`}
          </div>
        )}

        {/* Price per m2 for vente */}
        {listing.price && listing.surface && listing.surface > 0 && listing.subcategory === 'vente' && (
          <div className="mono text-xs" style={{ color: 'rgba(255,255,255,.3)', marginBottom: 8 }}>
            {Math.round(listing.price / listing.surface).toLocaleString('fr-FR')} €/m²
          </div>
        )}

        {/* Description */}
        {listing.description && (
          <div style={{
            marginTop: 16, marginBottom: 16, padding: '16px 18px',
            background: 'rgba(255,255,255,.03)', borderRadius: 10,
            border: '1px solid rgba(255,255,255,.05)',
          }}>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,.18)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontSize: 9 }}>
              Description
            </div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,.5)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {listing.description}
            </p>
          </div>
        )}

        {/* Service fields */}
        {listing.pro_tariff && (
          <div className="text-xs" style={{ color: 'rgba(255,255,255,.4)', marginBottom: 4 }}>
            Tarif : {listing.pro_tariff}
          </div>
        )}
        {listing.pro_availability && (
          <div className="text-xs" style={{ color: 'rgba(255,255,255,.4)', marginBottom: 4 }}>
            Disponibilite : {listing.pro_availability}
          </div>
        )}

        {/* Date */}
        <div className="text-xs" style={{ color: 'rgba(255,255,255,.18)', marginTop: 8, marginBottom: 4 }}>
          Publiee {timeAgo(listing.created_at)} -- {listing.view_count || 0} vue{(listing.view_count || 0) > 1 ? 's' : ''}
        </div>

        {/* Owner info */}
        {owner && (
          <div style={{
            marginTop: 12, marginBottom: 16, padding: '12px 16px',
            background: 'rgba(255,255,255,.03)', borderRadius: 10,
            border: '1px solid rgba(255,255,255,.05)',
          }}>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,.18)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, fontSize: 9 }}>
              Publie par
            </div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>
              {owner.name || 'Utilisateur'}
              {owner.rating != null && (
                <span style={{ color: 'var(--a)', marginLeft: 8 }}>
                  &#9733; {owner.rating} -- {owner.count} avis
                </span>
              )}
            </div>
          </div>
        )}

        {/* Map placeholder */}
        <div style={{
          marginBottom: 16, padding: '24px 16px', textAlign: 'center',
          background: 'rgba(255,255,255,.02)', borderRadius: 10,
          border: '1px solid rgba(255,255,255,.04)',
        }}>
          <div className="text-xs text-muted" style={{ fontSize: 10 }}>
            Carte -- Bientôt disponible
          </div>
        </div>

        {/* External link */}
        {listing.external_link && (
          <a
            href={listing.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs"
            style={{
              display: 'block', marginBottom: 12,
              color: 'rgba(255,255,255,.35)', textDecoration: 'none',
              fontWeight: 600, fontSize: 11,
            }}
          >
            Voir l&apos;annonce originale &rarr;
          </a>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {reserved ? (
            <div className="text-xs" style={{ color: '#34d399', fontWeight: 600, padding: '10px 0', flex: 1, textAlign: 'center' }}>
              Réservation confirmée ! +1 ticket offert
            </div>
          ) : (
            <button
              onClick={handleReserve}
              disabled={reserving}
              className="btn-primary"
              style={{ flex: 1, padding: '11px 12px', fontSize: 12 }}
            >
              {reserving ? 'Reservation...' : `${getReserveLabel(listing.subcategory)} -- 1 cr`}
            </button>
          )}
          <button
            onClick={handleShare}
            style={{
              background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 10, padding: '11px 16px', fontSize: 11, fontWeight: 600,
              fontFamily: 'var(--b)', color: copied ? '#34d399' : 'rgba(255,255,255,.5)',
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            {copied ? 'Copie !' : 'Partager'}
          </button>
        </div>
      </div>
    </div>
  )
}
