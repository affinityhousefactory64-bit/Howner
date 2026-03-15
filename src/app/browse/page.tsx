'use client'

import { useState, useEffect } from 'react'
import { Listing } from '@/types'
import Nav from '@/components/Nav'

const FILTERS = ['Tous', 'Vente', 'Location', 'Neuf', 'Howner Pro'] as const
const COLORS: Record<string, string> = { vente: '#cfaf4b', location: '#60a5fa', neuf: '#a78bfa' }

export default function BrowsePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [filter, setFilter] = useState<string>('Tous')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchListings()
  }, [filter])

  async function fetchListings() {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter === 'Vente') params.set('type', 'vente')
    if (filter === 'Location') params.set('type', 'location')
    if (filter === 'Neuf') params.set('type', 'neuf')
    if (filter === 'Howner Pro') params.set('source', 'howner')
    if (search) params.set('location', search)

    const res = await fetch(`/api/listings?${params}`)
    const data = await res.json()
    setListings(data.listings)
    setLoading(false)
  }

  function handleSearch() {
    fetchListings()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#fff' }}>
      <Nav />

      {/* Header */}
      <div style={{ padding: '30px 18px 0', maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 800, marginBottom: 4 }}>Toutes les annonces</h1>
        <p style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.3)', marginBottom: 18 }}>LeBonCoin, SeLoger, PAP, Bien&apos;ici + annonces natives Howner Pro</p>

        {/* Search */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          <input
            type="text"
            placeholder="Rechercher par ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1, padding: '9px 12px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: '#fff', fontFamily: 'var(--b)', fontSize: 12, outline: 'none' }}
          />
          <button
            onClick={handleSearch}
            style={{ padding: '9px 16px', background: 'linear-gradient(135deg, var(--a), #b8932e)', border: 'none', borderRadius: 8, color: '#0a0e1a', fontFamily: 'var(--b)', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}
          >
            Rechercher
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 20, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
                background: filter === f ? 'rgba(207,175,75,0.08)' : 'rgba(255,255,255,0.02)',
                border: filter === f ? '1px solid rgba(207,175,75,0.2)' : '1px solid rgba(255,255,255,0.05)',
                fontFamily: 'var(--b)', fontSize: 10, fontWeight: filter === f ? 700 : 500,
                color: filter === f ? 'var(--a)' : 'rgba(255,255,255,0.3)',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div style={{ padding: '0 18px 40px', maxWidth: 800, margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.3)' }}>Chargement...</div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.3)' }}>Aucune annonce trouvée</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {listings.map((l) => (
              <div
                key={l.id}
                style={{
                  padding: '14px 16px',
                  background: l.is_native ? 'rgba(207,175,75,0.02)' : 'rgba(255,255,255,0.012)',
                  border: `1px solid ${l.is_native ? 'rgba(207,175,75,0.08)' : 'rgba(255,255,255,0.04)'}`,
                  borderRadius: 12,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{
                      padding: '2px 7px', borderRadius: 4,
                      background: `${COLORS[l.type]}10`,
                      border: `1px solid ${COLORS[l.type]}22`,
                      fontSize: 9, fontWeight: 700, color: COLORS[l.type],
                      fontFamily: 'var(--b)', textTransform: 'uppercase',
                    }}>
                      {l.type}
                    </span>
                    {l.is_native && (
                      <span style={{ padding: '2px 6px', borderRadius: 3, background: 'rgba(207,175,75,0.06)', fontSize: 8, fontWeight: 700, color: 'var(--a)', fontFamily: 'var(--b)' }}>HOWNER PRO</span>
                    )}
                    <span style={{ fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,0.15)' }}>
                      via {l.source === 'howner' ? 'Howner' : l.source === 'seloger' ? 'SeLoger' : l.source === 'leboncoin' ? 'LeBonCoin' : l.source === 'pap' ? 'PAP' : 'Bien\'ici'}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 2 }}>{l.title}</div>
                  <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{l.location}</div>
                  <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,0.22)', marginTop: 3 }}>
                    {l.surface}m² · {l.rooms} pièce{l.rooms > 1 ? 's' : ''}
                  </div>
                  <p style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 6, lineHeight: 1.5 }}>{l.description}</p>
                  {l.external_url && (
                    <a
                      href={l.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-block', marginTop: 8, padding: '4px 10px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 5, fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}
                    >
                      Voir sur {l.source === 'seloger' ? 'SeLoger' : l.source === 'leboncoin' ? 'LeBonCoin' : l.source === 'pap' ? 'PAP' : 'Bien\'ici'} →
                    </a>
                  )}
                </div>
                <div style={{ fontFamily: 'var(--m)', fontSize: 16, color: 'var(--a)', flexShrink: 0, textAlign: 'right' }}>
                  {l.type === 'location'
                    ? `${l.price.toLocaleString('fr-FR')}€/mois`
                    : l.type === 'neuf'
                    ? `Dès ${l.price.toLocaleString('fr-FR')}€`
                    : `${l.price.toLocaleString('fr-FR')}€`}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 16, fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.15)' }}>
          {listings.length} annonce{listings.length > 1 ? 's' : ''} · Annonces agrégées + natives Howner Pro
        </div>
      </div>
    </div>
  )
}
