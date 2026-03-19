'use client'

import { useState, useEffect } from 'react'
import { Listing } from '@/types'
import Nav from '@/components/Nav'
import Link from 'next/link'

const FILTERS = [
  { id: '', label: 'Tous' },
  { id: 'immo', label: '🏠 Immobilier' },
  { id: 'service', label: '🔧 Services' },
  { id: 'demande', label: '📋 Demandes' },
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

export default function AnnoncesPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchListings() }, [filter])

  async function fetchListings() {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter) params.set('category', filter)
    if (search) params.set('location', search)
    const res = await fetch(`/api/listings?${params}`)
    const data = await res.json()
    setListings(data.listings || [])
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060a13', color: '#fff' }}>
      <Nav />
      <div style={{ padding: '28px 18px 0', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 800, marginBottom: 4 }}>Annonces</h1>
            <p style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.3)' }}>Immobilier · Services · Demandes</p>
          </div>
          <Link href="/poster" style={{ padding: '8px 16px', background: 'linear-gradient(135deg, var(--a), #b8932e)', borderRadius: 8, fontFamily: 'var(--b)', fontWeight: 700, fontSize: 11, color: '#0a0e1a', textDecoration: 'none' }}>
            + Poster
          </Link>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <input type="text" placeholder="Rechercher par ville..." value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchListings()}
            style={{ flex: 1, padding: '9px 12px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: '#fff', fontFamily: 'var(--b)', fontSize: 12, outline: 'none' }} />
          <button onClick={fetchListings} style={{ padding: '9px 16px', background: 'linear-gradient(135deg, var(--a), #b8932e)', border: 'none', borderRadius: 8, color: '#0a0e1a', fontFamily: 'var(--b)', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
            Rechercher
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 18, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{
                padding: '6px 12px', borderRadius: 7, cursor: 'pointer', border: 'none',
                background: filter === f.id ? 'rgba(207,175,75,.08)' : 'rgba(255,255,255,.02)',
                outline: filter === f.id ? '1px solid rgba(207,175,75,.2)' : '1px solid rgba(255,255,255,.05)',
                fontFamily: 'var(--b)', fontSize: 11, fontWeight: filter === f.id ? 700 : 500,
                color: filter === f.id ? 'var(--a)' : 'rgba(255,255,255,.35)',
              }}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div style={{ padding: '0 18px 60px', maxWidth: 800, margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.3)' }}>Chargement...</div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.3)', marginBottom: 12 }}>Aucune annonce trouvée</div>
            <Link href="/poster" style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'var(--a)', textDecoration: 'none', fontWeight: 600 }}>
              Poste la première →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {listings.map(l => {
              const color = SUB_COLORS[l.subcategory] || '#cfaf4b'
              return (
                <div key={l.id} style={{
                  padding: '14px 16px',
                  background: l.is_boosted ? 'rgba(207,175,75,.03)' : 'rgba(255,255,255,.015)',
                  border: `1px solid ${l.is_boosted ? 'rgba(207,175,75,.1)' : 'rgba(255,255,255,.05)'}`,
                  borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                      <span style={{ padding: '2px 7px', borderRadius: 4, background: `${color}15`, border: `1px solid ${color}30`, fontSize: 9, fontWeight: 700, color, fontFamily: 'var(--b)', textTransform: 'uppercase' }}>
                        {SUB_LABELS[l.subcategory] || l.subcategory}
                      </span>
                      {l.is_boosted && (
                        <span style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(207,175,75,.08)', fontSize: 8, fontWeight: 700, color: 'var(--a)', fontFamily: 'var(--b)' }}>🚀 BOOSTÉ</span>
                      )}
                    </div>
                    <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 2 }}>{l.title}</div>
                    <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.3)' }}>{l.location}</div>
                    {l.surface && <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.22)', marginTop: 2 }}>{l.surface}m²{l.rooms ? ` · ${l.rooms} pièce${l.rooms > 1 ? 's' : ''}` : ''}</div>}
                    {l.description && <p style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.2)', marginTop: 5, lineHeight: 1.5 }}>{l.description}</p>}
                  </div>
                  {l.price && (
                    <div style={{ fontFamily: 'var(--m)', fontSize: 15, color: 'var(--a)', fontWeight: 700, flexShrink: 0 }}>
                      {l.subcategory === 'location' ? `${l.price.toLocaleString('fr-FR')}€/mois` : `${l.price.toLocaleString('fr-FR')}€`}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 16, fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.15)' }}>
          {listings.length} annonce{listings.length > 1 ? 's' : ''}
        </div>
      </div>
    </div>
  )
}
