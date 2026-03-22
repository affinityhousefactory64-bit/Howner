'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'

const PRO_LABELS: Record<string, string> = {
  agent: 'Agent immobilier',
  courtier: 'Courtier',
  promoteur: 'Promoteur',
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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function ProListPage() {
  const [pros, setPros] = useState<ProUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/users?type=pro')
        const data = await res.json()
        setPros(data.users || [])
      } catch {
        /* silent */
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="page">
      <Nav />
      <div className="content-wide">
        <div className="mb-20">
          <h1 className="heading-lg mb-8">Professionnels</h1>
          <p className="text-xs text-muted">Agents immobiliers, courtiers et promoteurs sur Howner</p>
        </div>

        {loading ? (
          <div className="text-center text-xs text-muted" style={{ padding: 40 }}>Chargement...</div>
        ) : pros.length === 0 ? (
          <div className="text-center" style={{ padding: 40 }}>
            <div className="text-xs text-muted mb-12">Aucun professionnel pour le moment</div>
            <Link href="/annonces" className="text-xs text-gold" style={{ textDecoration: 'none', fontWeight: 600 }}>
              Voir les annonces
            </Link>
          </div>
        ) : (
          <div className="listings-grid">
            {pros.map(p => (
              <Link
                key={p.id}
                href={`/pro/${p.id}`}
                className="card"
                style={{ padding: '18px 20px', textDecoration: 'none', display: 'block' }}
              >
                <div className="flex items-center gap-6" style={{ gap: 14, marginBottom: 10 }}>
                  {/* Avatar */}
                  {p.pro_photo ? (
                    <img
                      src={p.pro_photo}
                      alt={p.name}
                      style={{
                        width: 44, height: 44, borderRadius: '50%',
                        objectFit: 'cover', border: '2px solid rgba(207,175,75,.2)',
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: 'rgba(207,175,75,.08)', border: '2px solid rgba(207,175,75,.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--m)', fontWeight: 700, fontSize: 14,
                      color: 'var(--a)', letterSpacing: 1,
                    }}>
                      {getInitials(p.name)}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 2 }}>
                      {p.name}
                    </div>
                    {p.pro_category && (
                      <span style={{
                        display: 'inline-block', padding: '2px 7px', borderRadius: 4,
                        background: 'rgba(207,175,75,.08)', border: '1px solid rgba(207,175,75,.12)',
                        fontFamily: 'var(--b)', fontSize: 9, fontWeight: 700,
                        color: 'var(--a)', textTransform: 'uppercase',
                      }}>
                        {PRO_LABELS[p.pro_category] || p.pro_category}
                      </span>
                    )}
                  </div>
                </div>

                {p.pro_zone && (
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,.35)', marginBottom: 4 }}>
                    {p.pro_zone}
                  </div>
                )}

                {p.pro_rating != null && p.review_count > 0 && (
                  <div className="text-xs" style={{ marginTop: 4 }}>
                    <span className="text-gold" style={{ fontWeight: 700 }}>
                      {'\u2605'} {p.pro_rating}
                    </span>
                    <span className="text-muted" style={{ marginLeft: 4 }}>
                      {p.review_count} avis
                    </span>
                  </div>
                )}

                {p.pro_transactions > 0 && (
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,.2)', marginTop: 2 }}>
                    {p.pro_transactions} transaction{p.pro_transactions > 1 ? 's' : ''}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
