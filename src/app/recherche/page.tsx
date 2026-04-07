'use client'

import { useState } from 'react'
import Link from 'next/link'

type Listing = {
  title: string
  location: string
  price: string
  priceNum: number
  surface: string
  pieces: string
  score: number
  source: string
}

const LISTINGS: Listing[] = [
  { title: 'T3 lumineux avec terrasse', location: 'Bayonne Centre', price: '235 000', priceNum: 235000, surface: '68', pieces: '3', score: 9.2, source: 'LeBonCoin' },
  { title: 'Maison 4p avec jardin', location: 'Anglet', price: '385 000', priceNum: 385000, surface: '95', pieces: '4', score: 8.9, source: 'SeLoger' },
  { title: 'Studio renove proche gare', location: 'Bayonne St-Esprit', price: '119 000', priceNum: 119000, surface: '28', pieces: '1', score: 8.7, source: 'PAP' },
  { title: 'T4 dernier etage vue montagne', location: 'Biarritz', price: '425 000', priceNum: 425000, surface: '82', pieces: '4', score: 8.5, source: "Bien'ici" },
  { title: 'T2 ideal investissement', location: 'Bayonne', price: '165 000', priceNum: 165000, surface: '42', pieces: '2', score: 8.3, source: 'LeBonCoin' },
  { title: 'Villa contemporaine piscine', location: 'Anglet', price: '695 000', priceNum: 695000, surface: '149', pieces: '5', score: 9.5, source: 'Agence locale' },
  { title: 'Appartement T3 renove', location: 'Boucau', price: '198 000', priceNum: 198000, surface: '61', pieces: '3', score: 8.1, source: 'SeLoger' },
  { title: 'Loft atypique ancien atelier', location: 'Bayonne', price: '275 000', priceNum: 275000, surface: '85', pieces: '3', score: 8.8, source: 'PAP' },
]

const SORT_OPTIONS = [
  { label: 'Score Howner', value: 'score' },
  { label: 'Prix croissant', value: 'price_asc' },
  { label: 'Prix decroissant', value: 'price_desc' },
  { label: 'Plus recents', value: 'recent' },
]

function scoreBadgeColor(score: number) {
  if (score >= 8.5) return { bg: 'rgba(52,211,153,.1)', color: '#34d399', border: 'rgba(52,211,153,.25)' }
  if (score >= 7.5) return { bg: 'rgba(207,175,75,.1)', color: '#cfaf4b', border: 'rgba(207,175,75,.25)' }
  return { bg: 'rgba(251,146,60,.1)', color: '#fb923c', border: 'rgba(251,146,60,.25)' }
}

export default function RecherchePage() {
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('score')
  const [filterType, setFilterType] = useState('all')
  const [filterPieces, setFilterPieces] = useState('all')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [surfaceMin, setSurfaceMin] = useState('')
  const [surfaceMax, setSurfaceMax] = useState('')
  const [ville, setVille] = useState('')

  const sorted = [...LISTINGS].sort((a, b) => {
    if (sortBy === 'price_asc') return a.priceNum - b.priceNum
    if (sortBy === 'price_desc') return b.priceNum - a.priceNum
    return b.score - a.score
  }).filter(l => {
    if (filterPieces !== 'all' && filterPieces !== '5+') {
      if (l.pieces !== filterPieces) return false
    }
    if (filterPieces === '5+' && parseInt(l.pieces) < 5) return false
    if (budgetMin && l.priceNum < parseInt(budgetMin) * 1000) return false
    if (budgetMax && l.priceNum > parseInt(budgetMax) * 1000) return false
    if (surfaceMin && parseInt(l.surface) < parseInt(surfaceMin)) return false
    if (surfaceMax && parseInt(l.surface) > parseInt(surfaceMax)) return false
    if (ville && !l.location.toLowerCase().includes(ville.toLowerCase())) return false
    return true
  })

  const selectStyle: React.CSSProperties = {
    padding: '8px 12px',
    background: 'rgba(255,255,255,.05)',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: 8,
    color: '#e4e4e7',
    fontSize: 13,
    fontFamily: 'var(--b)',
    outline: 'none',
    cursor: 'pointer',
    minWidth: 110,
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(255,255,255,0.3)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    paddingRight: 30,
  }

  const inputFilterStyle: React.CSSProperties = {
    padding: '8px 12px',
    background: 'rgba(255,255,255,.05)',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: 8,
    color: '#e4e4e7',
    fontSize: 13,
    fontFamily: 'var(--b)',
    outline: 'none',
    width: 90,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* ===== TOP BAR ===== */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,11,13,.9)', backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,.06)',
      }}>
        {/* Logo + Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 20,
          padding: '14px 24px', maxWidth: 1600, margin: '0 auto', width: '100%',
        }}>
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <span style={{
              fontFamily: 'var(--d)', fontWeight: 700, fontSize: 20,
              color: 'var(--a)', letterSpacing: 2, textTransform: 'uppercase',
            }}>HOWNER</span>
          </Link>

          <div style={{ flex: 1, position: 'relative', maxWidth: 680 }}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher un bien, un pro, analyser un devis..."
              style={{
                width: '100%',
                padding: '12px 20px 12px 44px',
                background: 'rgba(255,255,255,.05)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 12,
                color: '#e4e4e7',
                fontSize: 15,
                fontFamily: 'var(--b)',
                outline: 'none',
                transition: 'border-color .2s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(127,132,246,.5)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'}
            />
            <svg
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.35 }}
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          <Link href="/compte" style={{
            textDecoration: 'none', flexShrink: 0,
            padding: '8px 20px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,.1)',
            color: '#9ca3af', fontSize: 13, fontFamily: 'var(--b)',
            transition: 'border-color .2s',
          }}>
            Mon compte
          </Link>
        </div>

        {/* Filters row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 24px 14px', maxWidth: 1600, margin: '0 auto', width: '100%',
          overflowX: 'auto', flexWrap: 'wrap',
        }}>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={selectStyle}>
            <option value="all">Type: Tous</option>
            <option value="achat">Achat</option>
            <option value="location">Location</option>
            <option value="saisonniere">Saisonniere</option>
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input type="number" placeholder="Budget min (K)" value={budgetMin} onChange={e => setBudgetMin(e.target.value)} style={inputFilterStyle} />
            <span style={{ color: '#3a3a4a', fontSize: 12 }}>-</span>
            <input type="number" placeholder="Budget max (K)" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} style={inputFilterStyle} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input type="number" placeholder="Surf. min" value={surfaceMin} onChange={e => setSurfaceMin(e.target.value)} style={{ ...inputFilterStyle, width: 80 }} />
            <span style={{ color: '#3a3a4a', fontSize: 12 }}>-</span>
            <input type="number" placeholder="Surf. max" value={surfaceMax} onChange={e => setSurfaceMax(e.target.value)} style={{ ...inputFilterStyle, width: 80 }} />
          </div>

          <select value={filterPieces} onChange={e => setFilterPieces(e.target.value)} style={selectStyle}>
            <option value="all">Pieces: Toutes</option>
            <option value="1">1 piece</option>
            <option value="2">2 pieces</option>
            <option value="3">3 pieces</option>
            <option value="4">4 pieces</option>
            <option value="5+">5+ pieces</option>
          </select>

          <input type="text" placeholder="Ville..." value={ville} onChange={e => setVille(e.target.value)} style={{ ...inputFilterStyle, width: 120 }} />
        </div>
      </header>

      {/* ===== RESULTS HEADER ===== */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', maxWidth: 1600, margin: '0 auto', width: '100%',
        flexWrap: 'wrap', gap: 12,
      }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#e4e4e7', fontFamily: 'var(--b)' }}>
          {sorted.length} bien{sorted.length > 1 ? 's' : ''} trouve{sorted.length > 1 ? 's' : ''} a Bayonne et environs
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'var(--b)' }}>Trier par:</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...selectStyle, minWidth: 140 }}>
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ===== SPLIT VIEW ===== */}
      <div style={{
        flex: 1, display: 'flex', maxWidth: 1600, margin: '0 auto', width: '100%',
        padding: '0 24px 24px', gap: 20,
      }}>

        {/* LEFT: Scrollable list */}
        <div style={{
          flex: '0 0 60%', maxHeight: 'calc(100vh - 220px)', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 14,
          paddingRight: 10,
        }} className="recherche-list">
          {sorted.map((listing, i) => {
            const badge = scoreBadgeColor(listing.score)
            return (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(255,255,255,.08)',
                  boxShadow: '0 4px 20px rgba(0,0,0,.3)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  transition: 'border-color .25s, box-shadow .25s, transform .25s',
                  cursor: 'pointer',
                  backdropFilter: 'blur(12px)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(207,175,75,.25)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,.4)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,.3)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Photo placeholder */}
                <div style={{
                  height: 120, background: 'var(--bg2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderBottom: '1px solid rgba(255,255,255,.06)',
                  position: 'relative',
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                  </svg>
                  <span style={{
                    position: 'absolute', top: 10, right: 10,
                    fontSize: 10, fontFamily: 'var(--b)', fontWeight: 600,
                    color: '#6b7280', background: 'rgba(255,255,255,.06)',
                    padding: '3px 8px', borderRadius: 6,
                    border: '1px solid rgba(255,255,255,.06)',
                  }}>
                    via {listing.source}
                  </span>
                </div>

                {/* Card content */}
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ flex: 1, marginRight: 12 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'var(--b)', lineHeight: 1.3, marginBottom: 4 }}>
                        {listing.title}
                      </h3>
                      <p style={{ fontSize: 13, color: '#6b7280', fontFamily: 'var(--b)' }}>{listing.location}</p>
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--a)', fontFamily: 'var(--m)', whiteSpace: 'nowrap' }}>
                      {listing.price} €
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                    {[`${listing.surface} m2`, `${listing.pieces}p`, 'DPE C'].map((tag, ti) => (
                      <span key={ti} style={{ fontSize: 12, color: '#6b7280', fontFamily: 'var(--b)', background: 'rgba(255,255,255,.05)', padding: '3px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,.06)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, fontFamily: 'var(--m)',
                      color: badge.color, background: badge.bg,
                      border: `1px solid ${badge.border}`,
                      padding: '4px 10px', borderRadius: 6,
                    }}>
                      Score Howner: {listing.score}/10
                    </span>
                    <button style={{
                      padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      fontFamily: 'var(--b)', cursor: 'pointer',
                      background: 'transparent', color: 'var(--a)',
                      border: '1px solid rgba(207,175,75,.3)',
                      transition: 'background .2s, border-color .2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(207,175,75,.1)'
                      e.currentTarget.style.borderColor = 'rgba(207,175,75,.5)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.borderColor = 'rgba(207,175,75,.3)'
                    }}
                    >
                      Reserver une visite -- 1 credit
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {sorted.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280', fontSize: 14, fontFamily: 'var(--b)' }}>
              Aucun bien ne correspond a vos criteres. Ajustez les filtres.
            </div>
          )}
        </div>

        {/* RIGHT: Map placeholder */}
        <div className="recherche-map" style={{
          flex: '0 0 40%',
          background: 'var(--bg2)',
          border: '1px solid rgba(255,255,255,.08)',
          borderRadius: 16,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          minHeight: 400,
          position: 'sticky', top: 180, alignSelf: 'flex-start',
          maxHeight: 'calc(100vh - 220px)',
          backdropFilter: 'blur(12px)',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#6b7280', fontFamily: 'var(--b)', textAlign: 'center', lineHeight: 1.5, maxWidth: 240 }}>
            Carte interactive
          </p>
          <p style={{ fontSize: 12, color: '#4a4a5a', fontFamily: 'var(--b)', marginTop: 6 }}>bientot disponible</p>
          <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', padding: '0 20px' }}>
            {['Bayonne', 'Anglet', 'Biarritz', 'Boucau'].map(v => (
              <span key={v} style={{
                fontSize: 10, fontFamily: 'var(--b)', fontWeight: 600,
                color: '#6b7280', background: 'rgba(255,255,255,.04)',
                padding: '4px 10px', borderRadius: 20,
                border: '1px solid rgba(255,255,255,.08)',
              }}>
                {v}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ===== BOTTOM BAR ===== */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,.06)',
        background: 'rgba(10,11,13,.9)', backdropFilter: 'blur(24px)',
        padding: '16px 24px',
      }}>
        <div style={{
          maxWidth: 1600, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#6b7280', fontFamily: 'var(--b)' }}>Vous ne trouvez pas ?</span>
            <Link href="/chat" style={{
              fontSize: 13, fontWeight: 600, color: 'var(--a)',
              fontFamily: 'var(--b)', textDecoration: 'none',
              borderBottom: '1px solid rgba(207,175,75,.3)',
              paddingBottom: 1,
            }}>
              Demandez a l&apos;agent IA
            </Link>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--a)', fontFamily: 'var(--b)', opacity: 0.7 }}>
            1 credit offert a l&apos;inscription
          </span>
        </div>
      </div>

      {/* ===== RESPONSIVE STYLES ===== */}
      <style>{`
        .recherche-map { display: flex; }
        .recherche-list { flex: 0 0 60% !important; }

        @media (max-width: 1023px) {
          .recherche-map { display: none !important; }
          .recherche-list {
            flex: 1 1 100% !important;
            max-height: none !important;
            padding-right: 0 !important;
          }
        }

        .recherche-list::-webkit-scrollbar { width: 4px; }
        .recherche-list::-webkit-scrollbar-track { background: transparent; }
        .recherche-list::-webkit-scrollbar-thumb { background: rgba(127,132,246,.25); border-radius: 4px; }
        .recherche-list::-webkit-scrollbar-thumb:hover { background: rgba(127,132,246,.4); }
      `}</style>
    </div>
  )
}
