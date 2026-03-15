'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/context'
import Nav from '@/components/Nav'

const PRO_PLANS = [
  { id: 'artisan', name: 'Artisan', price: '29€/mois', features: ['Profil vérifié', 'Badge Pro', 'Visible dans le matching', '5 crédits IA/mois', 'Statistiques de profil'] },
  { id: 'agent', name: 'Agent Immo', price: '79€/mois', features: ['Profil vérifié', 'Badge Pro', 'Visible dans le matching', '15 crédits IA/mois', 'Publication d\'annonces', 'Leads qualifiés', 'Statistiques avancées'] },
  { id: 'promoteur', name: 'Promoteur', price: '199€/mois', features: ['Profil vérifié', 'Badge Pro', 'Visible dans le matching', '40 crédits IA/mois', 'Publication programmes neufs', 'Leads qualifiés premium', 'Analytics complet', 'Support prioritaire'] },
] as const

const STATS = [
  { label: 'Vues profil', value: '—', sub: 'Ce mois' },
  { label: 'Matchs reçus', value: '—', sub: 'Ce mois' },
  { label: 'Leads générés', value: '—', sub: 'Ce mois' },
  { label: 'Taux de réponse', value: '—', sub: 'Global' },
]

export default function ProDashboardPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'leads' | 'subscription'>('overview')

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--b)', color: 'rgba(255,255,255,.3)' }}>Chargement...</div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const isPro = user.type !== 'particulier'

  if (!isPro) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#fff' }}>
        <Nav />
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 18px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏢</div>
          <h1 style={{ fontFamily: 'var(--d)', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Espace Pro</h1>
          <p style={{ fontFamily: 'var(--b)', fontSize: 13, color: 'rgba(255,255,255,.4)', marginBottom: 32 }}>
            Cet espace est réservé aux professionnels de l&apos;immobilier.
            Passez en compte pro pour accéder à vos outils.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            style={{ padding: '12px 28px', background: 'linear-gradient(135deg, var(--a), #b8932e)', border: 'none', borderRadius: 9, color: '#0a0e1a', fontFamily: 'var(--b)', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
          >
            Retour au Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#fff' }}>
      <Nav />
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '28px 18px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--d)', fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Espace Pro</h1>
            <p style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.3)' }}>
              {user.name} · {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
            </p>
          </div>
          <div style={{
            padding: '5px 12px', borderRadius: 6,
            background: 'rgba(52,211,153,.06)', border: '1px solid rgba(52,211,153,.2)',
            fontFamily: 'var(--m)', fontSize: 9, color: '#34d399', fontWeight: 700,
          }}>
            PRO ACTIF
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,.04)', paddingBottom: 1 }}>
          {([['overview', 'Vue d\'ensemble'], ['listings', 'Mes annonces'], ['leads', 'Leads'], ['subscription', 'Abonnement']] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                padding: '8px 14px', cursor: 'pointer', background: 'none', border: 'none',
                borderBottom: activeTab === id ? '2px solid var(--a)' : '2px solid transparent',
                fontFamily: 'var(--b)', fontSize: 11,
                fontWeight: activeTab === id ? 700 : 500,
                color: activeTab === id ? 'var(--a)' : 'rgba(255,255,255,.3)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, marginBottom: 24 }}>
              {STATS.map((s) => (
                <div key={s.label} style={{
                  background: 'rgba(255,255,255,.015)', border: '1px solid rgba(255,255,255,.05)',
                  borderRadius: 12, padding: '16px 14px', textAlign: 'center',
                }}>
                  <div style={{ fontFamily: 'var(--m)', fontSize: 28, color: 'var(--a)' }}>{s.value}</div>
                  <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.4)', fontWeight: 700, marginTop: 2 }}>{s.label}</div>
                  <div style={{ fontFamily: 'var(--b)', fontSize: 8, color: 'rgba(255,255,255,.15)', marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <h2 style={{ fontFamily: 'var(--d)', fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Actions rapides</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {[
                { icon: '📝', label: 'Publier une annonce', desc: 'Ajoutez un bien à votre vitrine' },
                { icon: '💞', label: 'Voir les matchs', desc: 'Consultez vos connexions' },
                { icon: '🤖', label: 'IA Assistant', desc: 'Utilisez vos crédits IA' },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={() => {
                    if (a.label === 'Voir les matchs') router.push('/match')
                    if (a.label === 'IA Assistant') router.push('/dashboard')
                  }}
                  style={{
                    flex: '1 1 200px', padding: '16px 14px', textAlign: 'left', cursor: 'pointer',
                    background: 'rgba(255,255,255,.015)', border: '1px solid rgba(255,255,255,.05)',
                    borderRadius: 12,
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{a.icon}</div>
                  <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 12, color: '#fff', marginBottom: 2 }}>{a.label}</div>
                  <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{a.desc}</div>
                </button>
              ))}
            </div>

            {/* Credits */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              <div style={{ flex: 1, background: 'rgba(207,175,75,.04)', border: '1px solid rgba(207,175,75,.1)', borderRadius: 12, padding: '16px 14px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--m)', fontSize: 28, color: 'var(--a)' }}>{user.credits}</div>
                <div style={{ fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.25)', marginTop: 2 }}>CRÉDITS IA</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(168,139,250,.04)', border: '1px solid rgba(168,139,250,.1)', borderRadius: 12, padding: '16px 14px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--m)', fontSize: 28, color: '#a78bfa' }}>{user.tickets}</div>
                <div style={{ fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.25)', marginTop: 2 }}>TICKETS JEU</div>
              </div>
            </div>
          </>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'var(--d)', fontSize: 18, fontWeight: 800 }}>Mes annonces</h2>
              <button style={{
                padding: '8px 16px', background: 'linear-gradient(135deg, var(--a), #b8932e)',
                border: 'none', borderRadius: 8, fontFamily: 'var(--b)', fontWeight: 700,
                fontSize: 11, color: '#0a0e1a', cursor: 'pointer',
              }}>
                + Nouvelle annonce
              </button>
            </div>

            <div style={{
              padding: '48px 20px', textAlign: 'center',
              background: 'rgba(255,255,255,.015)', border: '1px solid rgba(255,255,255,.05)',
              borderRadius: 14,
            }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
              <div style={{ fontFamily: 'var(--b)', fontSize: 14, color: 'rgba(255,255,255,.4)', marginBottom: 4 }}>Aucune annonce publiée</div>
              <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.2)' }}>
                Publiez votre première annonce pour apparaître dans les recherches
              </div>
            </div>
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <div>
            <h2 style={{ fontFamily: 'var(--d)', fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Leads qualifiés</h2>
            <div style={{
              padding: '48px 20px', textAlign: 'center',
              background: 'rgba(255,255,255,.015)', border: '1px solid rgba(255,255,255,.05)',
              borderRadius: 14,
            }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📩</div>
              <div style={{ fontFamily: 'var(--b)', fontSize: 14, color: 'rgba(255,255,255,.4)', marginBottom: 4 }}>Aucun lead pour le moment</div>
              <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.2)' }}>
                Les leads apparaîtront ici lorsque des utilisateurs matcheront avec votre profil
              </div>
            </div>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div>
            <h2 style={{ fontFamily: 'var(--d)', fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Abonnement Pro</h2>
            <p style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.3)', marginBottom: 20 }}>
              Choisissez le plan adapté à votre activité
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {PRO_PLANS.map((plan) => {
                const isCurrent = plan.id === user.type
                return (
                  <div key={plan.id} style={{
                    flex: '1 1 220px', maxWidth: 260,
                    background: isCurrent ? 'rgba(207,175,75,.04)' : 'rgba(255,255,255,.015)',
                    border: isCurrent ? '1px solid rgba(207,175,75,.2)' : '1px solid rgba(255,255,255,.05)',
                    borderRadius: 14, padding: '20px 16px',
                  }}>
                    {isCurrent && (
                      <div style={{
                        display: 'inline-block', padding: '3px 8px', borderRadius: 4, marginBottom: 10,
                        background: 'rgba(52,211,153,.08)', border: '1px solid rgba(52,211,153,.2)',
                        fontFamily: 'var(--m)', fontSize: 8, color: '#34d399', fontWeight: 700, letterSpacing: 1,
                      }}>
                        PLAN ACTUEL
                      </div>
                    )}
                    <div style={{ fontFamily: 'var(--d)', fontSize: 18, fontWeight: 800, marginBottom: 2 }}>{plan.name}</div>
                    <div style={{ fontFamily: 'var(--m)', fontSize: 22, color: 'var(--a)', fontWeight: 700, marginBottom: 12 }}>{plan.price}</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {plan.features.map((f) => (
                        <li key={f} style={{
                          fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.4)',
                          padding: '3px 0', display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                          <span style={{ color: '#34d399', fontSize: 10 }}>✓</span> {f}
                        </li>
                      ))}
                    </ul>
                    <button style={{
                      width: '100%', padding: '10px 0', marginTop: 14,
                      background: isCurrent ? 'rgba(255,255,255,.04)' : 'linear-gradient(135deg, var(--a), #b8932e)',
                      border: isCurrent ? '1px solid rgba(255,255,255,.08)' : 'none',
                      borderRadius: 8, fontFamily: 'var(--b)', fontWeight: 700, fontSize: 11,
                      color: isCurrent ? 'rgba(255,255,255,.3)' : '#0a0e1a',
                      cursor: isCurrent ? 'default' : 'pointer',
                    }}>
                      {isCurrent ? 'Plan actif' : 'Choisir ce plan'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
