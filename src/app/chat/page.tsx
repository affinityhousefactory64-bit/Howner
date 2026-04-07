'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PropertyCard {
  title: string
  price: string
  location: string
  score: number
  surface: string
  rooms: string
}

interface ProCard {
  name: string
  specialty: string
  rating: number
  zone: string
  experience: string
}

interface DevisResult {
  verdict: 'correct' | 'eleve' | 'bas'
  label: string
  estimated: string
  low: string
  high: string
  recommendations: string[]
}

interface EstimationResult {
  address: string
  estimation: string
  low: string
  high: string
  pricePerM2: string
  confidence: number
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  text?: string
  properties?: PropertyCard[]
  pros?: ProCard[]
  devis?: DevisResult
  estimation?: EstimationResult
}

/* ------------------------------------------------------------------ */
/*  Design tokens                                                      */
/* ------------------------------------------------------------------ */

const C = {
  gold: '#cfaf4b',
  gold2: '#e8d58c',
  bg: '#191C1F',
  bg2: '#1E2228',
  bg3: '#242930',
  white: '#ffffff',
  muted: 'rgba(255,255,255,.5)',
  border: 'rgba(207,175,75,.12)',
  fontD: "'Fraunces', serif",
  fontB: "'Syne', sans-serif",
  fontM: "'JetBrains Mono', monospace",
} as const

/* ------------------------------------------------------------------ */
/*  Mock data generators                                               */
/* ------------------------------------------------------------------ */

const MOCK_PROPERTIES: PropertyCard[] = [
  { title: 'T3 lumineux - Centre-ville', price: '245 000', location: 'Bayonne, 64100', score: 92, surface: '68 m2', rooms: '3 pieces' },
  { title: 'Maison T4 avec jardin', price: '385 000', location: 'Anglet, 64600', score: 87, surface: '105 m2', rooms: '4 pieces' },
  { title: 'Studio renove - Proche plage', price: '165 000', location: 'Biarritz, 64200', score: 78, surface: '32 m2', rooms: '1 piece' },
]

const MOCK_PROS: ProCard[] = [
  { name: 'Cabinet Moreau & Associes', specialty: 'Courtier immobilier', rating: 4.8, zone: 'Pays Basque', experience: '12 ans' },
  { name: 'Atelier Durand Architecture', specialty: 'Architecte DPLG', rating: 4.6, zone: 'Bayonne - Biarritz', experience: '8 ans' },
  { name: 'Renov\'Express 64', specialty: 'Artisan tous corps', rating: 4.4, zone: 'Cote Basque', experience: '15 ans' },
]

const MOCK_DEVIS: DevisResult = {
  verdict: 'eleve',
  label: 'Prix superieur au marche',
  estimated: '8 500',
  low: '5 200',
  high: '7 800',
  recommendations: [
    'Demandez une ventilation detaillee des postes',
    'Comparez avec 2 autres artisans de la zone',
    'Le poste "main d\'oeuvre" semble surevalue de 20%',
  ],
}

const MOCK_ESTIMATION: EstimationResult = {
  address: 'Quartier Saint-Esprit, Bayonne',
  estimation: '285 000',
  low: '265 000',
  high: '310 000',
  pricePerM2: '3 950',
  confidence: 85,
}

/* ------------------------------------------------------------------ */
/*  Quick action chips                                                 */
/* ------------------------------------------------------------------ */

const CHIPS = [
  { label: 'Rechercher un bien', prompt: 'Je cherche un appartement T3 a Bayonne avec un budget de 250 000 euros.' },
  { label: 'Analyser un devis', prompt: 'J\'ai recu un devis de 8 500 euros pour des travaux de plomberie, pouvez-vous l\'analyser ?' },
  { label: 'Trouver un pro', prompt: 'Je recherche un courtier immobilier dans le Pays Basque.' },
  { label: 'Estimer un bien', prompt: 'Combien vaut un appartement de 72m2 a Bayonne quartier Saint-Esprit ?' },
  { label: 'Aide a mon projet', prompt: 'Je souhaite acheter ma premiere residence principale, par ou commencer ?' },
]

/* ------------------------------------------------------------------ */
/*  AI response logic (keyword matching)                               */
/* ------------------------------------------------------------------ */

function generateResponse(text: string): Omit<Message, 'id' | 'role'> {
  const lower = text.toLowerCase()

  if (['cherche', 't2', 't3', 'appartement', 'maison', 'louer', 'acheter'].some(k => lower.includes(k))) {
    return {
      text: 'Voici 3 biens correspondant a votre recherche. J\'ai analyse les prix du marche, la localisation et les prestations pour vous attribuer un score de pertinence.',
      properties: MOCK_PROPERTIES,
    }
  }

  if (['devis', 'travaux', 'prix', 'plombier', 'electricien'].some(k => lower.includes(k))) {
    return {
      text: 'J\'ai analyse votre devis en le comparant aux prix du marche local. Voici mon diagnostic :',
      devis: MOCK_DEVIS,
    }
  }

  if (['courtier', 'agent', 'artisan', 'architecte', 'pro'].some(k => lower.includes(k))) {
    return {
      text: 'Voici les professionnels les mieux notes dans votre zone. Ces profils sont verifies et actifs sur la plateforme.',
      pros: MOCK_PROS,
    }
  }

  if (['estim', 'vaut', 'valeur'].some(k => lower.includes(k))) {
    return {
      text: 'Voici l\'estimation basee sur les transactions recentes et les caracteristiques du secteur :',
      estimation: MOCK_ESTIMATION,
    }
  }

  return {
    text: 'Je comprends votre demande. Pour une recherche precise, essayez de me decrire le type de bien, la zone geographique et votre budget. Je peux aussi analyser un devis, trouver un professionnel ou estimer la valeur d\'un bien.',
  }
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '16px 20px' }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: `linear-gradient(135deg, ${C.gold}, ${C.gold2})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 700, fontFamily: C.fontD, color: C.bg, flexShrink: 0,
      }}>H</div>
      <div style={{
        background: C.bg2, borderRadius: '18px 18px 18px 4px', padding: '14px 20px',
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 7, height: 7, borderRadius: '50%', background: C.muted,
            display: 'inline-block',
            animation: `howner-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}

function PropertyCards({ items }: { items: PropertyCard[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
      {items.map((p, i) => (
        <div key={i} style={{
          background: C.bg3, borderRadius: 14, padding: '16px 18px',
          border: `1px solid ${C.border}`, transition: 'border-color .2s',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <div style={{ fontFamily: C.fontD, fontSize: 15, fontWeight: 700, color: C.white }}>{p.title}</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{p.location}</div>
            </div>
            <div style={{
              background: `rgba(207,175,75,.15)`, color: C.gold, fontSize: 13, fontWeight: 700,
              fontFamily: C.fontM, padding: '4px 10px', borderRadius: 8,
            }}>{p.score}/100</div>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'rgba(255,255,255,.7)', marginBottom: 10 }}>
            <span>{p.surface}</span>
            <span>{p.rooms}</span>
          </div>
          <div style={{ fontFamily: C.fontM, fontSize: 18, fontWeight: 700, color: C.gold }}>{p.price} EUR</div>
        </div>
      ))}
    </div>
  )
}

function ProCards({ items }: { items: ProCard[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
      {items.map((p, i) => (
        <div key={i} style={{
          background: C.bg3, borderRadius: 14, padding: '16px 18px',
          border: `1px solid ${C.border}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <div>
              <div style={{ fontFamily: C.fontD, fontSize: 15, fontWeight: 700, color: C.white }}>{p.name}</div>
              <div style={{ fontSize: 13, color: C.gold, marginTop: 2 }}>{p.specialty}</div>
            </div>
            <div style={{
              background: `rgba(207,175,75,.15)`, color: C.gold, fontSize: 13, fontWeight: 700,
              fontFamily: C.fontM, padding: '4px 10px', borderRadius: 8,
            }}>{p.rating}/5</div>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'rgba(255,255,255,.7)' }}>
            <span>{p.zone}</span>
            <span>{p.experience}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function DevisCard({ d }: { d: DevisResult }) {
  const verdictColors: Record<string, { bg: string; text: string }> = {
    correct: { bg: 'rgba(75,207,120,.15)', text: '#4bcf78' },
    eleve: { bg: 'rgba(207,100,75,.15)', text: '#cf6a4b' },
    bas: { bg: 'rgba(75,150,207,.15)', text: '#4b96cf' },
  }
  const vc = verdictColors[d.verdict] || verdictColors.eleve
  const range = parseFloat(d.high.replace(/\s/g, '')) - parseFloat(d.low.replace(/\s/g, ''))
  const est = parseFloat(d.estimated.replace(/\s/g, '')) - parseFloat(d.low.replace(/\s/g, ''))
  const pct = Math.min(100, Math.max(0, (est / range) * 100))

  return (
    <div style={{ background: C.bg3, borderRadius: 14, padding: '18px 18px', border: `1px solid ${C.border}`, marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{
          background: vc.bg, color: vc.text, fontSize: 12, fontWeight: 700,
          fontFamily: C.fontM, padding: '5px 12px', borderRadius: 8, textTransform: 'uppercase' as const,
          letterSpacing: '.5px',
        }}>{d.label}</span>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 6 }}>Fourchette du marche</div>
        <div style={{ position: 'relative' as const, height: 8, background: 'rgba(255,255,255,.08)', borderRadius: 4 }}>
          <div style={{
            position: 'absolute' as const, top: 0, left: 0, height: '100%',
            width: '100%', background: `linear-gradient(90deg, #4bcf78, ${C.gold}, #cf6a4b)`,
            borderRadius: 4, opacity: 0.6,
          }} />
          <div style={{
            position: 'absolute' as const, top: -4, left: `${pct}%`,
            width: 16, height: 16, borderRadius: '50%', background: C.white,
            border: `3px solid ${vc.text}`, transform: 'translateX(-50%)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, fontFamily: C.fontM }}>
          <span style={{ color: '#4bcf78' }}>{d.low} EUR</span>
          <span style={{ color: C.gold, fontWeight: 700 }}>Devis: {d.estimated} EUR</span>
          <span style={{ color: '#cf6a4b' }}>{d.high} EUR</span>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>Recommandations</div>
        {d.recommendations.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13, color: 'rgba(255,255,255,.8)' }}>
            <span style={{ color: C.gold, flexShrink: 0 }}>--</span>
            <span>{r}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function EstimationCard({ e }: { e: EstimationResult }) {
  return (
    <div style={{ background: C.bg3, borderRadius: 14, padding: '18px 18px', border: `1px solid ${C.border}`, marginTop: 12 }}>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>{e.address}</div>
      <div style={{ fontFamily: C.fontD, fontSize: 28, fontWeight: 700, color: C.gold, marginBottom: 12 }}>
        {e.estimation} EUR
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase' as const, letterSpacing: '.5px' }}>Fourchette basse</div>
          <div style={{ fontFamily: C.fontM, fontSize: 15, color: C.white }}>{e.low} EUR</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase' as const, letterSpacing: '.5px' }}>Fourchette haute</div>
          <div style={{ fontFamily: C.fontM, fontSize: 15, color: C.white }}>{e.high} EUR</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase' as const, letterSpacing: '.5px' }}>Prix / m2</div>
          <div style={{ fontFamily: C.fontM, fontSize: 15, color: C.white }}>{e.pricePerM2} EUR</div>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 6 }}>Indice de confiance</div>
        <div style={{ position: 'relative' as const, height: 6, background: 'rgba(255,255,255,.08)', borderRadius: 3 }}>
          <div style={{
            height: '100%', width: `${e.confidence}%`, borderRadius: 3,
            background: `linear-gradient(90deg, ${C.gold}, ${C.gold2})`,
          }} />
        </div>
        <div style={{ fontSize: 12, fontFamily: C.fontM, color: C.gold, marginTop: 4 }}>{e.confidence}%</div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Chat Page                                                     */
/* ------------------------------------------------------------------ */

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [credits, setCredits] = useState(3)
  const [ticketFlash, setTicketFlash] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, typing, scrollToBottom])

  const handleSend = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed || typing || credits <= 0) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    const delay = 1000 + Math.random() * 1000
    setTimeout(() => {
      const response = generateResponse(trimmed)
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', ...response }
      setMessages(prev => [...prev, aiMsg])
      setTyping(false)
      setCredits(prev => Math.max(0, prev - 1))
      setTicketFlash(true)
      setTimeout(() => setTicketFlash(false), 2000)
    }, delay)
  }, [input, typing, credits])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChip = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  const hasMessages = messages.length > 0

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100dvh',
      background: C.bg, fontFamily: C.fontB, color: C.white, overflow: 'hidden',
    }}>

      {/* --- Bounce keyframes --- */}
      <style>{`
        @keyframes howner-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes howner-fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes howner-ticketFlash {
          0% { opacity: 0; transform: translateY(4px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-4px); }
        }
      `}</style>

      {/* ============================================================ */}
      {/*  TOP BAR                                                      */}
      {/* ============================================================ */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', borderBottom: `1px solid ${C.border}`,
        background: C.bg2, flexShrink: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/" style={{
            fontFamily: C.fontD, fontSize: 18, fontWeight: 800, color: C.gold,
            textDecoration: 'none', letterSpacing: '1px',
          }}>HOWNER</Link>
          <Link href="/" style={{ fontSize: 12, color: C.muted, textDecoration: 'none' }}>Accueil</Link>
        </div>

        <div style={{
          fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.7)',
          letterSpacing: '.5px', position: 'absolute' as const, left: '50%', transform: 'translateX(-50%)',
        }}>
          Agent IA Immobilier
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' as const }}>
          {ticketFlash && (
            <span style={{
              position: 'absolute' as const, right: 80, top: -2,
              fontSize: 12, fontFamily: C.fontM, color: '#4bcf78', fontWeight: 700,
              animation: 'howner-ticketFlash 2s ease forwards', whiteSpace: 'nowrap' as const,
            }}>+1 ticket</span>
          )}
          <Link href="/credits" style={{
            display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none',
            background: 'rgba(207,175,75,.1)', padding: '6px 14px', borderRadius: 8,
            border: `1px solid ${C.border}`,
          }}>
            <span style={{ fontFamily: C.fontM, fontSize: 13, fontWeight: 700, color: C.gold }}>
              {credits}
            </span>
            <span style={{ fontSize: 12, color: C.muted }}>credits</span>
          </Link>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  CHAT AREA                                                    */}
      {/* ============================================================ */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, overflowY: 'auto', padding: '20px 16px',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* --- Welcome state --- */}
        {!hasMessages && !typing && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center',
            padding: '40px 20px', maxWidth: 520, margin: '0 auto',
            animation: 'howner-fadeIn .5s ease',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: `linear-gradient(135deg, ${C.gold}, ${C.gold2})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800, fontFamily: C.fontD, color: C.bg,
              marginBottom: 20,
            }}>H</div>

            <h1 style={{
              fontFamily: C.fontD, fontSize: 22, fontWeight: 700, color: C.white,
              marginBottom: 8, lineHeight: 1.3,
            }}>
              Bonjour ! Je suis votre agent immobilier IA.
            </h1>

            <p style={{ fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 1.6 }}>
              Je peux :
            </p>

            <div style={{
              display: 'flex', flexDirection: 'column', gap: 8,
              width: '100%', marginBottom: 32, textAlign: 'left',
            }}>
              {[
                'Rechercher des biens immobiliers selon vos criteres',
                'Analyser vos devis de travaux et detecter les anomalies',
                'Trouver des professionnels qualifies pres de chez vous',
                'Estimer la valeur d\'un bien immobilier',
                'Vous accompagner dans votre projet immobilier',
              ].map((cap, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  fontSize: 14, color: 'rgba(255,255,255,.75)', lineHeight: 1.5,
                }}>
                  <span style={{ color: C.gold, fontFamily: C.fontM, fontSize: 12, marginTop: 2, flexShrink: 0 }}>{'>'}</span>
                  <span>{cap}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', marginBottom: 20 }}>
              Que puis-je faire pour vous ?
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, justifyContent: 'center' }}>
              {CHIPS.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleChip(chip.prompt)}
                  style={{
                    background: 'rgba(207,175,75,.08)', border: `1px solid ${C.border}`,
                    borderRadius: 20, padding: '8px 16px', fontSize: 13,
                    color: C.gold2, cursor: 'pointer', fontFamily: C.fontB, fontWeight: 500,
                    transition: 'all .2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(207,175,75,.18)'
                    e.currentTarget.style.borderColor = C.gold
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(207,175,75,.08)'
                    e.currentTarget.style.borderColor = C.border
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- Messages --- */}
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 16,
              animation: 'howner-fadeIn .3s ease',
            }}
          >
            {msg.role === 'assistant' && (
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${C.gold}, ${C.gold2})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, fontFamily: C.fontD, color: C.bg,
                marginRight: 10, marginTop: 2,
              }}>H</div>
            )}

            <div style={{ maxWidth: '85%', minWidth: 0 }}>
              {/* Text bubble */}
              {msg.text && (
                <div style={{
                  background: msg.role === 'user' ? C.gold : C.bg2,
                  color: msg.role === 'user' ? C.bg : C.white,
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '12px 18px', fontSize: 14, lineHeight: 1.6,
                  fontWeight: msg.role === 'user' ? 500 : 400,
                }}>
                  {msg.text}
                </div>
              )}

              {/* Property cards */}
              {msg.properties && <PropertyCards items={msg.properties} />}

              {/* Pro cards */}
              {msg.pros && <ProCards items={msg.pros} />}

              {/* Devis */}
              {msg.devis && <DevisCard d={msg.devis} />}

              {/* Estimation */}
              {msg.estimation && <EstimationCard e={msg.estimation} />}
            </div>
          </div>
        ))}

        {/* --- Typing indicator --- */}
        {typing && <TypingIndicator />}
      </div>

      {/* ============================================================ */}
      {/*  INPUT AREA                                                   */}
      {/* ============================================================ */}
      <div style={{
        flexShrink: 0, borderTop: `1px solid ${C.border}`,
        background: C.bg2, padding: '12px 16px 16px',
      }}>
        {/* Quick chips (when messages exist) */}
        {hasMessages && (
          <div style={{
            display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10,
            scrollbarWidth: 'none' as const,
          }}>
            {CHIPS.map((chip, i) => (
              <button
                key={i}
                onClick={() => handleChip(chip.prompt)}
                style={{
                  background: 'rgba(207,175,75,.06)', border: `1px solid rgba(207,175,75,.1)`,
                  borderRadius: 16, padding: '6px 12px', fontSize: 12,
                  color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontFamily: C.fontB,
                  whiteSpace: 'nowrap' as const, flexShrink: 0, transition: 'all .2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = C.gold2
                  e.currentTarget.style.borderColor = C.gold
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'rgba(255,255,255,.5)'
                  e.currentTarget.style.borderColor = 'rgba(207,175,75,.1)'
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* Input row */}
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-end',
          background: C.bg3, borderRadius: 16, padding: '10px 12px 10px 18px',
          border: `1px solid ${C.border}`,
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Decrivez ce que vous cherchez..."
            rows={1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: C.white, fontSize: 14, fontFamily: C.fontB, resize: 'none' as const,
              lineHeight: 1.5, maxHeight: 120, minHeight: 22,
            }}
            onInput={e => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = Math.min(el.scrollHeight, 120) + 'px'
            }}
            disabled={typing || credits <= 0}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || typing || credits <= 0}
            style={{
              width: 40, height: 40, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: input.trim() && !typing && credits > 0
                ? `linear-gradient(135deg, ${C.gold}, ${C.gold2})`
                : 'rgba(255,255,255,.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all .2s',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={input.trim() && !typing && credits > 0 ? C.bg : C.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </div>

        {/* Credit counter */}
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
          marginTop: 10, fontSize: 12, color: C.muted, fontFamily: C.fontM,
        }}>
          <span>1 credit par message</span>
          <span style={{ color: 'rgba(255,255,255,.2)' }}>|</span>
          <span style={{ color: credits > 0 ? C.gold : '#cf6a4b' }}>
            {credits} credit{credits !== 1 ? 's' : ''} restant{credits !== 1 ? 's' : ''}
          </span>
        </div>

        {/* No credits warning */}
        {credits <= 0 && (
          <div style={{
            textAlign: 'center', marginTop: 8,
            animation: 'howner-fadeIn .3s ease',
          }}>
            <Link href="/credits" style={{
              fontSize: 13, color: C.gold, fontWeight: 600,
              textDecoration: 'underline', textUnderlineOffset: '3px',
            }}>
              Acheter des credits pour continuer
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
