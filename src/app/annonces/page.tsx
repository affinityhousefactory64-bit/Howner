'use client'

import { useState, useEffect } from 'react'
import { Listing } from '@/types'
import Nav from '@/components/Nav'
import Link from 'next/link'

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
        <div className="flex gap-6 mb-12">
          <input type="text" placeholder="Rechercher par ville..." value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchListings()}
            style={{ flex: 1 }} />
          <button onClick={fetchListings} className="btn-primary" style={{ padding: '9px 16px', fontSize: 11 }}>
            Rechercher
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-6 mb-20" style={{ flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`filter-chip ${filter === f.id ? 'active' : ''}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div className="content-wide" style={{ paddingTop: 0 }}>
        {loading ? (
          <div className="text-center text-xs text-muted" style={{ padding: 40 }}>Chargement...</div>
        ) : listings.length === 0 ? (
          <div className="text-center" style={{ padding: 40 }}>
            <div className="text-xs text-muted mb-12">Aucune annonce trouvée</div>
            <Link href="/poster" className="text-xs text-gold" style={{ textDecoration: 'none', fontWeight: 600 }}>
              Publiez la première annonce →
            </Link>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map(l => {
              const color = SUB_COLORS[l.subcategory] || '#cfaf4b'
              return (
                <div key={l.id} className={`card ${l.is_boosted ? 'listing-card-boosted' : ''}`} style={{ padding: '14px 16px' }}>
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
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 2 }}>{l.title}</div>
                  <div className="text-xs text-muted">{l.location}</div>
                  {l.surface && <div className="text-xs" style={{ color: 'rgba(255,255,255,.22)', marginTop: 2 }}>{l.surface} m²{l.rooms ? ` · ${l.rooms} pièce${l.rooms > 1 ? 's' : ''}` : ''}</div>}
                  {l.description && <p className="text-xs" style={{ color: 'rgba(255,255,255,.2)', marginTop: 5, lineHeight: 1.5 }}>{l.description}</p>}
                  {l.price && (
                    <div className="mono text-gold" style={{ fontSize: 15, fontWeight: 700, marginTop: 8 }}>
                      {l.subcategory === 'location' ? `${l.price.toLocaleString('fr-FR')}€/mois` : `${l.price.toLocaleString('fr-FR')}€`}
                    </div>
                  )}
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
