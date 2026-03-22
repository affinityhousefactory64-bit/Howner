'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/context'
import Nav from '@/components/Nav'

type AdminTab = 'overview' | 'users' | 'listings' | 'transactions'
type UserFilter = 'all' | 'particulier' | 'pro'

interface Stats {
  total_users: number
  total_users_particulier: number
  total_users_pro: number
  total_listings: number
  total_listings_immo: number
  total_listings_service: number
  total_listings_demande: number
  total_matches: number
  total_reservations: number
  total_credits_sold: number
  total_revenue_cents: number
  total_tickets: number
  recent_signups: { id: string; name: string; type: string; created_at: string }[]
  recent_purchases: { id: string; user_name: string; pack_type: string; credits: number; tickets: number; amount_cents: number; created_at: string }[]
}

interface AdminUser {
  id: string
  name: string
  phone: string
  type: string
  pro_category: string | null
  credits: number
  tickets: number
  pro_rating: number | null
  review_count: number
  created_at: string
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatEuros(cents: number): string {
  return (cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const TICKET_TARGET = 200000
const REVENUE_TARGET_CENTS = 160000000 // 1 600 000 euros

export default function AdminPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [tab, setTab] = useState<AdminTab>('overview')
  const [stats, setStats] = useState<Stats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // Users tab state
  const [users, setUsers] = useState<AdminUser[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userFilter, setUserFilter] = useState<UserFilter>('all')
  const [userSearch, setUserSearch] = useState('')
  const [searchDebounce, setSearchDebounce] = useState('')

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounce(userSearch), 400)
    return () => clearTimeout(t)
  }, [userSearch])

  // Redirect non-admin
  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) {
      router.push('/compte')
    }
  }, [loading, user, router])

  // Load stats
  useEffect(() => {
    if (!user?.is_admin) return
    setStatsLoading(true)
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { if (!d.error) setStats(d) })
      .catch(() => {})
      .finally(() => setStatsLoading(false))
  }, [user])

  // Load users when tab active
  const loadUsers = useCallback(() => {
    if (!user?.is_admin) return
    setUsersLoading(true)
    const params = new URLSearchParams()
    if (userFilter !== 'all') params.set('type', userFilter)
    if (searchDebounce) params.set('search', searchDebounce)
    fetch(`/api/admin/users?${params.toString()}`)
      .then(r => r.json())
      .then(d => setUsers(d.users || []))
      .catch(() => {})
      .finally(() => setUsersLoading(false))
  }, [user, userFilter, searchDebounce])

  useEffect(() => {
    if (tab === 'users') loadUsers()
  }, [tab, loadUsers])

  if (loading || !user || !user.is_admin) {
    return (
      <div className="page">
        <Nav />
        <div className="content-medium" style={{ paddingTop: 60, textAlign: 'center' }}>
          <div className="text-xs text-muted">Chargement...</div>
        </div>
      </div>
    )
  }

  // Calculate pace estimate
  function estimateDays(current: number, target: number, createdAt: string): string {
    const daysSinceStart = Math.max(1, (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
    const dailyRate = current / daysSinceStart
    if (dailyRate <= 0) return '--'
    const remaining = target - current
    if (remaining <= 0) return 'Atteint'
    return Math.ceil(remaining / dailyRate).toString()
  }

  // Use first signup date as reference, or fallback
  const firstSignupDate = stats?.recent_signups?.length
    ? stats.recent_signups[stats.recent_signups.length - 1]?.created_at
    : user.created_at

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'overview', label: 'Vue globale' },
    { id: 'users', label: 'Utilisateurs' },
    { id: 'listings', label: 'Annonces' },
    { id: 'transactions', label: 'Transactions' },
  ]

  const ticketPct = stats ? Math.min(100, (stats.total_tickets / TICKET_TARGET) * 100) : 0
  const revenuePct = stats ? Math.min(100, (stats.total_revenue_cents / REVENUE_TARGET_CENTS) * 100) : 0

  return (
    <div className="page">
      <Nav />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px 60px' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--d)', fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
            Administration
          </h1>
          <p className="text-xs text-muted">Tableau de bord Howner</p>
        </div>

        {/* Gauges -- always visible */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {/* Tickets gauge */}
          <div style={{ padding: '16px 18px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <span className="text-xs" style={{ fontWeight: 600, color: 'rgba(255,255,255,.6)' }}>Tickets</span>
              <span className="mono" style={{ fontSize: 13, color: 'var(--a)', fontWeight: 700 }}>
                {stats ? stats.total_tickets.toLocaleString('fr-FR') : '--'}
              </span>
            </div>
            <div className="gauge-bar" style={{ height: 6, marginBottom: 6 }}>
              <div className="gauge-fill" style={{ width: `${ticketPct}%` }} />
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted">{ticketPct.toFixed(1)}%</span>
              <span className="text-xs text-muted">/ {(TICKET_TARGET).toLocaleString('fr-FR')}</span>
            </div>
            {stats && (
              <div className="text-xs" style={{ color: 'rgba(255,255,255,.3)', marginTop: 6, fontStyle: 'italic' }}>
                Seuil dans ~{estimateDays(stats.total_tickets, TICKET_TARGET, firstSignupDate)} jours
              </div>
            )}
          </div>

          {/* Revenue gauge */}
          <div style={{ padding: '16px 18px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <span className="text-xs" style={{ fontWeight: 600, color: 'rgba(255,255,255,.6)' }}>CA</span>
              <span className="mono" style={{ fontSize: 13, color: 'var(--a)', fontWeight: 700 }}>
                {stats ? formatEuros(stats.total_revenue_cents) : '--'} €
              </span>
            </div>
            <div className="gauge-bar" style={{ height: 6, marginBottom: 6 }}>
              <div className="gauge-fill" style={{ width: `${revenuePct}%` }} />
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted">{revenuePct.toFixed(1)}%</span>
              <span className="text-xs text-muted">/ 1 600 000 €</span>
            </div>
            {stats && (
              <div className="text-xs" style={{ color: 'rgba(255,255,255,.3)', marginTop: 6, fontStyle: 'italic' }}>
                Seuil dans ~{estimateDays(stats.total_revenue_cents, REVENUE_TARGET_CENTS, firstSignupDate)} jours
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-bar" style={{ marginBottom: 20 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`tab-btn ${tab === t.id ? 'active' : ''}`}
              style={{ fontSize: 11 }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB: Overview */}
        {tab === 'overview' && (
          <div>
            {statsLoading ? (
              <div className="text-center text-xs text-muted" style={{ padding: 40 }}>Chargement des stats...</div>
            ) : stats ? (
              <>
                {/* Stat cards grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 24 }}>
                  <StatCard label="INSCRITS" value={stats.total_users} gold />
                  <StatCard label="PARTICULIERS" value={stats.total_users_particulier} />
                  <StatCard label="PROS" value={stats.total_users_pro} />
                  <StatCard label="ANNONCES" value={stats.total_listings} gold />
                  <StatCard label="IMMO" value={stats.total_listings_immo} />
                  <StatCard label="SERVICES" value={stats.total_listings_service} />
                  <StatCard label="DEMANDES" value={stats.total_listings_demande} />
                  <StatCard label="MATCHS" value={stats.total_matches} />
                  <StatCard label="RESERVATIONS" value={stats.total_reservations} />
                  <StatCard label="CREDITS VENDUS" value={stats.total_credits_sold} gold />
                  <StatCard label="CA TOTAL" value={`${formatEuros(stats.total_revenue_cents)} €`} gold />
                  <StatCard label="TICKETS" value={stats.total_tickets.toLocaleString('fr-FR')} />
                </div>

                {/* Recent signups */}
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontFamily: 'var(--b)', fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Derniers inscrits</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {stats.recent_signups.map(u => (
                      <div key={u.id} className="card" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>{u.name || 'Sans nom'}</span>
                          <span className="badge" style={{ marginLeft: 8, padding: '1px 6px', fontSize: 8, background: u.type === 'pro' ? 'rgba(207,175,75,.1)' : 'rgba(255,255,255,.04)', color: u.type === 'pro' ? 'var(--a)' : 'rgba(255,255,255,.4)' }}>
                            {u.type === 'pro' ? 'PRO' : 'PART'}
                          </span>
                        </div>
                        <span className="text-xs text-muted">{formatDateTime(u.created_at)}</span>
                      </div>
                    ))}
                    {stats.recent_signups.length === 0 && (
                      <div className="text-xs text-muted" style={{ padding: 16, textAlign: 'center' }}>Aucun inscrit</div>
                    )}
                  </div>
                </div>

                {/* Recent purchases */}
                <div>
                  <h3 style={{ fontFamily: 'var(--b)', fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Derniers achats</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {stats.recent_purchases.map(p => (
                      <div key={p.id} className="card" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>{p.user_name}</span>
                          <span className="text-xs text-muted" style={{ marginLeft: 8 }}>{p.pack_type}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="mono" style={{ fontSize: 12, color: 'var(--a)', fontWeight: 700 }}>
                            {formatEuros(p.amount_cents)} €
                          </span>
                          <span className="text-xs text-muted">{p.credits}cr / {p.tickets}tk</span>
                          <span className="text-xs text-muted">{formatDate(p.created_at)}</span>
                        </div>
                      </div>
                    ))}
                    {stats.recent_purchases.length === 0 && (
                      <div className="text-xs text-muted" style={{ padding: 16, textAlign: 'center' }}>Aucun achat</div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-xs text-muted text-center" style={{ padding: 40 }}>Erreur de chargement</div>
            )}
          </div>
        )}

        {/* TAB: Utilisateurs */}
        {tab === 'users' && (
          <div>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {(['all', 'particulier', 'pro'] as UserFilter[]).map(f => (
                <button key={f} onClick={() => setUserFilter(f)}
                  style={{
                    padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    fontFamily: 'var(--b)', cursor: 'pointer', border: 'none',
                    background: userFilter === f ? 'rgba(207,175,75,.12)' : 'rgba(255,255,255,.04)',
                    color: userFilter === f ? 'var(--a)' : 'rgba(255,255,255,.45)',
                  }}>
                  {f === 'all' ? 'Tous' : f === 'particulier' ? 'Particuliers' : 'Pros'}
                </button>
              ))}
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Rechercher nom ou tel..."
                style={{
                  flex: 1, minWidth: 160, padding: '7px 12px', borderRadius: 8,
                  fontSize: 12, fontFamily: 'var(--b)', border: '1px solid rgba(255,255,255,.06)',
                  background: 'rgba(255,255,255,.03)', color: '#fff', outline: 'none',
                }}
              />
            </div>

            {/* Users list */}
            {usersLoading ? (
              <div className="text-xs text-muted text-center" style={{ padding: 30 }}>Chargement...</div>
            ) : users.length === 0 ? (
              <div className="text-xs text-muted text-center" style={{ padding: 30 }}>Aucun utilisateur</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--b)' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                      {['Nom', 'Type', 'Categorie', 'Credits', 'Tickets', 'Note', 'Inscrit'].map(h => (
                        <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: 'rgba(255,255,255,.4)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                        <td style={{ padding: '8px 10px', fontWeight: 600, color: '#fff' }}>{u.name || 'Sans nom'}</td>
                        <td style={{ padding: '8px 10px' }}>
                          <span style={{
                            padding: '1px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700,
                            background: u.type === 'pro' ? 'rgba(207,175,75,.1)' : 'rgba(255,255,255,.04)',
                            color: u.type === 'pro' ? 'var(--a)' : 'rgba(255,255,255,.4)',
                          }}>
                            {u.type === 'pro' ? 'PRO' : 'PART'}
                          </span>
                        </td>
                        <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,.5)', fontSize: 11 }}>{u.pro_category || '--'}</td>
                        <td style={{ padding: '8px 10px', fontFamily: 'var(--m)', color: 'var(--a)', fontWeight: 600 }}>{u.credits}</td>
                        <td style={{ padding: '8px 10px', fontFamily: 'var(--m)', color: '#a78bfa', fontWeight: 600 }}>{u.tickets}</td>
                        <td style={{ padding: '8px 10px', fontFamily: 'var(--m)', color: 'rgba(255,255,255,.5)' }}>
                          {u.pro_rating ? `${u.pro_rating}/5 (${u.review_count})` : '--'}
                        </td>
                        <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,.3)', fontSize: 11 }}>{formatDate(u.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: Annonces */}
        {tab === 'listings' && (
          <ListingsTab />
        )}

        {/* TAB: Transactions */}
        {tab === 'transactions' && (
          <TransactionsTab />
        )}

      </div>
    </div>
  )
}

/* ---------- Stat Card ---------- */
function StatCard({ label, value, gold }: { label: string; value: string | number; gold?: boolean }) {
  return (
    <div style={{
      padding: '14px 14px', borderRadius: 12,
      background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)',
    }}>
      <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: gold ? 'var(--a)' : '#fff', marginBottom: 2 }}>
        {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
      </div>
      <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </div>
    </div>
  )
}

/* ---------- Listings Tab (loads its own data) ---------- */
function ListingsTab() {
  const [listings, setListings] = useState<{ id: string; title: string; category: string; location: string; user_name?: string; reservations_count?: number; created_at: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Reuse existing listings endpoint
    fetch('/api/listings?limit=100')
      .then(r => r.json())
      .then(d => {
        const items = d.listings || []
        setListings(items)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-xs text-muted text-center" style={{ padding: 30 }}>Chargement...</div>
  if (listings.length === 0) return <div className="text-xs text-muted text-center" style={{ padding: 30 }}>Aucune annonce</div>

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--b)' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            {['Titre', 'Categorie', 'Lieu', 'Date'].map(h => (
              <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: 'rgba(255,255,255,.4)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {listings.map(l => (
            <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,.03)' }}>
              <td style={{ padding: '8px 10px', fontWeight: 600, color: '#fff' }}>{l.title}</td>
              <td style={{ padding: '8px 10px' }}>
                <span style={{
                  padding: '1px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700,
                  background: l.category === 'immo' ? 'rgba(207,175,75,.08)' : l.category === 'service' ? 'rgba(96,165,250,.08)' : 'rgba(167,139,250,.08)',
                  color: l.category === 'immo' ? 'var(--a)' : l.category === 'service' ? '#60a5fa' : '#a78bfa',
                }}>
                  {l.category.toUpperCase()}
                </span>
              </td>
              <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,.5)', fontSize: 11 }}>{l.location}</td>
              <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,.3)', fontSize: 11 }}>{formatDate(l.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------- Transactions Tab (loads its own data) ---------- */
function TransactionsTab() {
  const [purchases, setPurchases] = useState<{ id: string; user_name: string; pack_type: string; credits: number; tickets: number; amount_cents: number; created_at: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => setPurchases(d.recent_purchases || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-xs text-muted text-center" style={{ padding: 30 }}>Chargement...</div>
  if (purchases.length === 0) return <div className="text-xs text-muted text-center" style={{ padding: 30 }}>Aucune transaction</div>

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--b)' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            {['Utilisateur', 'Pack', 'Credits', 'Tickets', 'Montant', 'Date'].map(h => (
              <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: 'rgba(255,255,255,.4)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {purchases.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,.03)' }}>
              <td style={{ padding: '8px 10px', fontWeight: 600, color: '#fff' }}>{p.user_name}</td>
              <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,.5)', fontSize: 11 }}>{p.pack_type}</td>
              <td style={{ padding: '8px 10px', fontFamily: 'var(--m)', color: 'var(--a)', fontWeight: 600 }}>{p.credits}</td>
              <td style={{ padding: '8px 10px', fontFamily: 'var(--m)', color: '#a78bfa', fontWeight: 600 }}>{p.tickets}</td>
              <td style={{ padding: '8px 10px', fontFamily: 'var(--m)', color: 'var(--a)', fontWeight: 700 }}>{formatEuros(p.amount_cents)} €</td>
              <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,.3)', fontSize: 11 }}>{formatDate(p.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
