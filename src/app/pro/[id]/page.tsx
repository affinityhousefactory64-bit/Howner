'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { Listing } from '@/types'

const PRO_LABELS: Record<string, string> = {
  agent: 'Agent immobilier',
  courtier: 'Courtier',
  promoteur: 'Promoteur',
}

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

interface ProUser {
  id: string
  name: string
  type: string
  pro_category: string | null
  pro_specialty: string | null
  pro_zone: string | null
  pro_photo: string | null
  pro_rating: number | null
  pro_transactions: number
  review_count: number
  created_at: string
}

interface ReviewItem {
  id: string
  reviewer_name: string
  rating: number
  comment: string | null
  created_at: string
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function memberSince(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
  })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function renderStars(rating: number): string {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  return '\u2605'.repeat(full) + (half ? '\u2606' : '') + '\u2606'.repeat(empty)
}

export default function ProProfilePage() {
  const params = useParams()
  const id = params.id as string

  const [user, setUser] = useState<ProUser | null>(null)
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    async function load() {
      setLoading(true)
      setError(null)
      try {
        // Fetch user, reviews, and listings in parallel
        const [userRes, reviewsRes, listingsRes] = await Promise.all([
          fetch(`/api/users/${id}`),
          fetch(`/api/reviews?userId=${id}`),
          fetch(`/api/listings?userId=${id}`),
        ])

        if (!userRes.ok) {
          setError('Profil introuvable')
          setLoading(false)
          return
        }

        const userData = await userRes.json()
        setUser(userData.user)

        const reviewsData = await reviewsRes.json()
        setReviews(reviewsData.reviews || [])

        const listingsData = await listingsRes.json()
        setListings(listingsData.listings || [])
      } catch {
        setError('Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="page">
        <Nav />
        <div className="content-wide" style={{ padding: '80px 0', textAlign: 'center' }}>
          <div className="text-xs text-muted">Chargement du profil...</div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="page">
        <Nav />
        <div className="content-wide" style={{ padding: '80px 0', textAlign: 'center' }}>
          <div className="text-xs text-muted mb-12">{error || 'Profil introuvable'}</div>
          <Link href="/annonces" className="text-xs text-gold" style={{ textDecoration: 'none', fontWeight: 600 }}>
            Retour aux annonces
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <Nav />
      <div className="content-wide">

        {/* Profile header card */}
        <div className="card" style={{ padding: '28px 24px', marginBottom: 24 }}>
          <div className="flex items-center gap-6" style={{ gap: 18, marginBottom: 16 }}>
            {/* Avatar */}
            {user.pro_photo ? (
              <img
                src={user.pro_photo}
                alt={user.name}
                style={{
                  width: 64, height: 64, borderRadius: '50%',
                  objectFit: 'cover', border: '2px solid rgba(207,175,75,.3)',
                }}
              />
            ) : (
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(207,175,75,.1)', border: '2px solid rgba(207,175,75,.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--m)', fontWeight: 700, fontSize: 20,
                color: 'var(--a)', letterSpacing: 1,
              }}>
                {getInitials(user.name)}
              </div>
            )}

            {/* Name and category */}
            <div style={{ flex: 1 }}>
              <h1 className="heading-lg" style={{ marginBottom: 4, fontSize: 22 }}>
                {user.name}
              </h1>
              {user.pro_category && (
                <span style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: 5,
                  background: 'rgba(207,175,75,.08)', border: '1px solid rgba(207,175,75,.15)',
                  fontFamily: 'var(--b)', fontSize: 10, fontWeight: 700,
                  color: 'var(--a)', textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                  {PRO_LABELS[user.pro_category] || user.pro_category}
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {user.pro_specialty && (
              <div className="text-xs" style={{ color: 'rgba(255,255,255,.5)' }}>
                <span style={{ color: 'rgba(255,255,255,.25)', marginRight: 6 }}>Spe.</span>
                {user.pro_specialty}
              </div>
            )}
            {user.pro_zone && (
              <div className="text-xs" style={{ color: 'rgba(255,255,255,.5)' }}>
                <span style={{ color: 'rgba(255,255,255,.25)', marginRight: 6 }}>Zone</span>
                {user.pro_zone}
              </div>
            )}

            {/* Rating */}
            {user.pro_rating != null && user.review_count > 0 && (
              <div style={{ marginTop: 4 }}>
                <span className="text-gold" style={{ fontSize: 14, fontWeight: 700 }}>
                  {renderStars(user.pro_rating)}
                </span>
                <span className="text-gold" style={{ fontSize: 13, fontWeight: 700, marginLeft: 6 }}>
                  {user.pro_rating}
                </span>
                <span className="text-xs text-muted" style={{ marginLeft: 4 }}>
                  {user.review_count} avis
                </span>
              </div>
            )}

            {/* Transactions and member since */}
            <div className="flex gap-6" style={{ marginTop: 4, flexWrap: 'wrap' }}>
              {user.pro_transactions > 0 && (
                <div className="text-xs" style={{ color: 'rgba(255,255,255,.35)' }}>
                  {user.pro_transactions} transaction{user.pro_transactions > 1 ? 's' : ''}
                </div>
              )}
              <div className="text-xs" style={{ color: 'rgba(255,255,255,.25)' }}>
                Membre depuis {memberSince(user.created_at)}
              </div>
            </div>
          </div>
        </div>

        {/* Annonces actives */}
        {listings.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'var(--m)', fontWeight: 700, fontSize: 16,
              color: '#fff', marginBottom: 14, letterSpacing: 0.3,
            }}>
              Annonces actives
            </h2>
            <div className="listings-grid">
              {listings.map(l => {
                const color = SUB_COLORS[l.subcategory] || '#cfaf4b'
                return (
                  <div key={l.id} className="card" style={{ padding: '14px 16px' }}>
                    <div className="flex items-center gap-6 mb-8">
                      <span style={{
                        padding: '2px 7px', borderRadius: 4,
                        background: `${color}15`, border: `1px solid ${color}30`,
                        fontSize: 9, fontWeight: 700, color, textTransform: 'uppercase',
                      }}>
                        {SUB_LABELS[l.subcategory] || l.subcategory}
                      </span>
                      {l.is_boosted && (
                        <span style={{
                          padding: '2px 6px', borderRadius: 4,
                          background: 'rgba(207,175,75,.08)',
                          fontSize: 8, fontWeight: 700, color: 'var(--a)',
                        }}>
                          BOOSTÉ
                        </span>
                      )}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 2 }}>
                      {l.title}
                    </div>
                    <div className="text-xs text-muted">{l.location}</div>
                    {l.surface && (
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,.22)', marginTop: 2 }}>
                        {l.surface} m²{l.rooms ? ` · ${l.rooms} pièce${l.rooms > 1 ? 's' : ''}` : ''}
                      </div>
                    )}
                    {l.price && (
                      <div className="mono text-gold" style={{ fontSize: 15, fontWeight: 700, marginTop: 8 }}>
                        {l.subcategory === 'location'
                          ? `${l.price.toLocaleString('fr-FR')}€/mois`
                          : `${l.price.toLocaleString('fr-FR')}€`}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Avis */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{
            fontFamily: 'var(--m)', fontWeight: 700, fontSize: 16,
            color: '#fff', marginBottom: 14, letterSpacing: 0.3,
          }}>
            Avis
            {reviews.length > 0 && (
              <span className="text-muted" style={{ fontWeight: 400, fontSize: 12, marginLeft: 8 }}>
                ({reviews.length})
              </span>
            )}
          </h2>

          {reviews.length === 0 ? (
            <div className="card" style={{ padding: '24px 20px', textAlign: 'center' }}>
              <div className="text-xs text-muted">Aucun avis pour le moment</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reviews.map(r => (
                <div key={r.id} className="card" style={{ padding: '16px 18px' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>
                      {r.reviewer_name}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,.2)' }}>
                      {formatDate(r.created_at)}
                    </div>
                  </div>
                  <div className="text-gold" style={{ fontSize: 13, marginBottom: 6 }}>
                    {renderStars(r.rating)}
                    <span style={{ fontSize: 11, marginLeft: 6, fontWeight: 600 }}>{r.rating}/5</span>
                  </div>
                  {r.comment && (
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,.45)', lineHeight: 1.6, margin: 0 }}>
                      {r.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTAs */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 10,
          marginBottom: 40, maxWidth: 400,
        }}>
          <Link
            href="/login"
            className="btn-primary"
            style={{
              display: 'block', textAlign: 'center',
              padding: '12px 20px', fontSize: 13, textDecoration: 'none',
            }}
          >
            Matcher avec {user.name}
          </Link>
          <Link
            href="/login"
            style={{
              display: 'block', textAlign: 'center',
              padding: '12px 20px', fontSize: 12, textDecoration: 'none',
              background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 8, color: 'rgba(255,255,255,.5)', fontFamily: 'var(--b)', fontWeight: 600,
            }}
          >
            Réserver un RDV — 1 crédit
          </Link>
        </div>

      </div>
    </div>
  )
}
