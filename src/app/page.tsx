'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

/* ═══ CONSTANTS ═══ */
const TOTAL = 200000
const INIT = 47382

const FAQ_DATA = [
  { q: 'C\u2019est quoi Howner ?', a: 'Howner est un agent IA conversationnel dédié à l\u2019immobilier. Il scrape tous les portails, analyse vos devis, trouve le bon professionnel et vous guide dans votre projet. Chaque crédit acheté vous offre un ticket pour participer au tirage d\u2019une villa à 695 000\u202F\u20ac.' },
  { q: 'Comment fonctionnent les crédits ?', a: '1 crédit = 1 action. Recherche de biens, analyse de devis, mise en relation avec un pro, estimation ou assistance projet. Chaque crédit acheté vous offre aussi 1 ticket pour le tirage de la villa. Votre premier crédit est offert à l\u2019inscription.' },
  { q: 'C\u2019est quoi le tirage de la villa ?', a: 'Quand 200 000 tickets sont distribués, un tirage au sort a lieu en direct, filmé, sous le contrôle d\u2019un huissier de justice. Le gagnant repart avec la villa. Puis un nouveau cycle démarre avec une nouvelle villa.' },
  { q: 'C\u2019est légal ?', a: 'Oui. Jeu concours promotionnel conforme à la Directive Européenne 2005/29/CE. On vend des crédits pour des services réels (recherche, analyse, mise en relation). Les tickets sont offerts en bonus. Participation gratuite possible via inscription et parrainage.' },
  { q: 'La villa est réelle ?', a: 'Oui. Villa Boucau — 149m², 4 chambres, piscine, R+1, Boucau Haut, Pays Basque. Construite par Affinity House Factory SAS (SIRET 982 581 506 00010). Finitions Porcelanosa, construction LSF, clé en main. Valeur : 695 000\u202F\u20ac.' },
  { q: 'Je peux participer gratuitement ?', a: 'Oui. L\u2019inscription est gratuite et vous offre 1 crédit + 1 ticket. Le parrainage vous donne 1 crédit + 1 ticket pour chaque ami inscrit, sans limite.' },
]

const AGENTS = [
  { icon: '\u2315', title: 'Recherche de biens', desc: 'Scrape tous les portails. Trie par score qualité/prix.' },
  { icon: '\u2261', title: 'Analyse de devis', desc: 'Votre devis est-il au bon prix ? Réponse en 10 secondes.' },
  { icon: '\u2605', title: 'Trouve un pro', desc: 'Plombier, agent, courtier, architecte. Les meilleurs de votre zone.' },
  { icon: '\u25C8', title: 'Estimation de bien', desc: 'Combien vaut votre bien ? Données DVF + IA.' },
  { icon: '\u2192', title: 'Assistant projet', desc: 'Achat, vente, rénovation. L\u2019IA vous guide étape par étape.' },
]

/* ═══ SCROLL REVEAL ═══ */
function Reveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return <div ref={ref} className="reveal">{children}</div>
}

/* ═══ LIVE NOTIFICATIONS ═══ */
function LiveNotif() {
  const msgs = [
    { text: 'Thomas a demandé un T3 à Bayonne à l\u2019agent IA', sub: '12 biens trouvés en 8 secondes', color: '#cfaf4b' },
    { text: 'Marie s\u2019est inscrite', sub: '1 crédit offert + 1 ticket offert', color: '#34d399' },
    { text: 'Pierre a fait analyser un devis plomberie', sub: 'Résultat : devis 18% au-dessus du marché', color: '#f472b6' },
    { text: 'Sophie a acheté un Pack 10', sub: '+10 crédits + 10 tickets offerts', color: '#f59e0b' },
    { text: 'Lucas a trouvé un courtier à Biarritz via l\u2019agent', sub: '4.8 étoiles · 92 dossiers traités', color: '#3b82f6' },
    { text: 'La jauge vient de dépasser 47 000', sub: 'Plus que 153 000 tickets avant le tirage', color: '#a855f7' },
  ]
  const [i, setI] = useState(0)
  const [show, setShow] = useState(true)
  useEffect(() => {
    const t = setInterval(() => {
      setShow(false)
      setTimeout(() => { setI(p => (p + 1) % msgs.length); setShow(true) }, 400)
    }, 4000)
    return () => clearInterval(t)
  }, [])
  const m = msgs[i]
  return (
    <div className="live-notif" style={{ opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(10px)', transition: 'all .4s', borderLeft: `3px solid ${m.color}` }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 12, fontWeight: 600 }}>{m.text}</div>
        <div style={{ fontSize: 10, color: '#34d399', fontWeight: 700, marginTop: 2 }}>{m.sub}</div>
      </div>
    </div>
  )
}

/* ═══ STICKY CTA ═══ */
function StickyCTA() {
  const [v, setV] = useState(false)
  useEffect(() => {
    const h = () => setV(window.scrollY > 500)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  return (
    <div className={`sticky-cta${v ? ' visible' : ''}`}>
      <span className="text-muted text-xs" style={{ fontWeight: 600 }}>Villa 695 000\u20ac à gagner</span>
      <a href="#packs" className="btn-primary btn-shine" style={{ padding: '10px 24px', fontSize: 13 }}>Acheter des crédits</a>
    </div>
  )
}

/* ═══ FAKE CHAT (HERO) ═══ */
function HeroChat() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    timers.push(setTimeout(() => setStep(1), 800))
    timers.push(setTimeout(() => setStep(2), 2200))
    timers.push(setTimeout(() => setStep(3), 4000))
    timers.push(setTimeout(() => setStep(4), 5500))
    timers.push(setTimeout(() => setStep(5), 7000))
    return () => timers.forEach(clearTimeout)
  }, [])

  const bubbleUser: React.CSSProperties = {
    background: 'var(--a)',
    color: '#191C1F',
    padding: '12px 16px',
    borderRadius: '16px 16px 4px 16px',
    fontSize: 14,
    fontWeight: 600,
    maxWidth: '85%',
    marginLeft: 'auto',
    lineHeight: 1.5,
  }

  const bubbleAI: React.CSSProperties = {
    background: '#242930',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: '16px 16px 16px 4px',
    fontSize: 14,
    maxWidth: '85%',
    lineHeight: 1.5,
  }

  const cardStyle: React.CSSProperties = {
    background: '#1a1d21',
    border: '1px solid rgba(207,175,75,.12)',
    borderRadius: 10,
    padding: '10px 14px',
    marginTop: 6,
  }

  const properties = [
    { name: 'T3 Bayonne Centre', price: '235 000\u20ac', size: '68m\u00b2', score: '9.2/10' },
    { name: 'T3 St-Esprit', price: '219 000\u20ac', size: '62m\u00b2', score: '8.7/10' },
    { name: 'T3 Mousserolles', price: '242 000\u20ac', size: '71m\u00b2', score: '8.4/10' },
  ]

  return (
    <div style={{
      background: '#1a1d21',
      border: '1px solid rgba(207,175,75,.08)',
      borderRadius: 16,
      maxWidth: 680,
      margin: '0 auto',
      padding: '24px 20px',
      minHeight: 320,
    }}>
      {/* Chat header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#191C1F' }}>H</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Agent Howner</div>
          <div style={{ fontSize: 10, color: '#34d399', fontWeight: 600 }}>En ligne</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* User message */}
        {step >= 1 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', animation: 'fadeUp .4s ease' }}>
            <div style={bubbleUser}>
              Je cherche un T3 à Bayonne, max 250 000\u20ac, proche écoles
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {step === 2 && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', animation: 'fadeUp .3s ease' }}>
            <div style={{ ...bubbleAI, display: 'flex', gap: 4, alignItems: 'center', padding: '14px 20px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,.4)', animation: 'dotPulse 1.2s infinite 0s' }} />
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,.4)', animation: 'dotPulse 1.2s infinite .2s' }} />
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,.4)', animation: 'dotPulse 1.2s infinite .4s' }} />
            </div>
          </div>
        )}

        {/* AI response */}
        {step >= 3 && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', animation: 'fadeUp .4s ease' }}>
            <div style={bubbleAI}>
              J&apos;ai trouvé 12 biens sur 4 portails. Voici les 3 meilleurs :
            </div>
          </div>
        )}

        {/* Property cards */}
        {step >= 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '85%', animation: 'fadeUp .4s ease' }}>
            {properties.map((p, i) => (
              <div key={i} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{p.name}</span>
                  <span style={{ fontSize: 12, fontFamily: 'var(--m)', color: 'var(--a)', fontWeight: 700 }}>{p.price}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>{p.size}</span>
                  <span style={{ fontSize: 11, color: '#34d399', fontWeight: 700 }}>Score {p.score}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Follow-up */}
        {step >= 5 && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', animation: 'fadeUp .4s ease' }}>
            <div style={bubbleAI}>
              Voulez-vous que j&apos;analyse le prix du premier ou que je trouve un courtier ?
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══ MAIN ═══ */
export default function Home() {
  const [gauge, setGauge] = useState(INIT)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => setGauge(p => Math.min(TOTAL, p + Math.floor(Math.random() * 3) + 1))
    const go = () => { const d = 5000 + Math.random() * 3000; return setTimeout(() => { tick(); id = go() }, d) }
    let id = go()
    return () => clearTimeout(id)
  }, [])

  const pct = (gauge / TOTAL) * 100

  const TICKER_MESSAGES = [
    'VOTRE AGENT IMMOBILIER IA',
    'TOUS LES BIENS, TOUS LES PORTAILS',
    'ANALYSE DE DEVIS EN 10 SECONDES',
    'TROUVEZ LE BON PRO INSTANTANEMENT',
    'VILLA 695 000\u20ac A GAGNER',
    '1 CREDIT OFFERT A L\'INSCRIPTION',
  ]

  return (
    <>
      {/* ══ TICKER BAR ══ */}
      <div className="ticker-bar">
        <div className="ticker-content">
          {[...TICKER_MESSAGES, ...TICKER_MESSAGES].map((msg, i) => (
            <span className="ticker-item" key={i}>{msg}</span>
          ))}
        </div>
      </div>

      {/* ══ NAV ══ */}
      <nav className="nav">
        <Link href="/" style={{ textDecoration: 'none' }}><span className="heading-md text-gold" style={{ fontSize: 20 }}>HOWNER</span></Link>
        <div className="nav-gauge" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 80, height: 4, borderRadius: 10, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 10, background: 'var(--a)', width: `${pct}%`, transition: 'width 1s' }} />
          </div>
          <span className="mono text-gold" style={{ fontSize: 9 }}>{gauge.toLocaleString()}/{TOTAL / 1000}K</span>
        </div>
        <Link href="/login" className="btn-primary" style={{ padding: '8px 20px', fontSize: 13 }}>Essayer gratuit</Link>
      </nav>

      {/* ══ HERO — AI AGENT ══ */}
      <section style={{ position: 'relative', paddingTop: 'clamp(80px, 12vh, 140px)', paddingBottom: 'clamp(60px, 8vh, 100px)', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', padding: '0 20px', marginBottom: 40 }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: 20,
            border: '1px solid rgba(207,175,75,.2)',
            background: 'rgba(207,175,75,.06)',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--a)',
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginBottom: 24,
          }}>
            Marketplace immobilière IA
          </div>
          <h1 className="heading-xl" style={{ marginBottom: 16, fontSize: 'clamp(34px, 7vw, 64px)' }}>
            Votre agent immobilier <span className="text-gold">IA.</span>
          </h1>
          <p style={{ fontSize: 'clamp(14px, 2.5vw, 18px)', color: 'rgba(255,255,255,.55)', marginBottom: 40, lineHeight: 1.7, maxWidth: 600, margin: '0 auto 40px' }}>
            Dites-lui ce que vous cherchez. Il scrape tous les portails et trouve en 10 secondes.
          </p>
        </div>

        {/* Fake chat interface */}
        <div style={{ padding: '0 20px' }}>
          <HeroChat />
        </div>

        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <Link href="/login" className="btn-primary btn-shine" style={{ padding: '16px 48px', fontSize: 16 }}>
            Essayer gratuitement — 1 crédit offert
          </Link>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', marginTop: 14 }}>
            Inscription gratuite · 1 crédit + 1 ticket offerts · Aucun engagement
          </p>
        </div>
      </section>

      {/* ══ JAUGE FOMO ══ */}
      <Reveal>
        <section className="section section-mid" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div className="container text-center" style={{ maxWidth: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 12px #34d399', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>Tirage en cours — Cycle 1</span>
            </div>
            <div className="mono" style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              {gauge.toLocaleString()}
            </div>
            <div className="text-muted" style={{ fontSize: 14, marginBottom: 16 }}>tickets sur 200 000</div>
            <div className="gauge-bar" style={{ height: 14, marginBottom: 16 }}>
              <div className="gauge-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="mono" style={{ fontSize: 15, color: '#f472b6', fontWeight: 700, marginBottom: 8 }}>
              Plus que {(TOTAL - gauge).toLocaleString()} avant le tirage
            </p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', letterSpacing: 2, textTransform: 'uppercase' }}>
              Tirage filmé en direct · Huissier de justice · Le gagnant repart avec les clés
            </p>
          </div>
        </section>
      </Reveal>

      {/* ══ LES 5 AGENTS HOWNER ══ */}
      <Reveal>
        <section className="section" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div className="container text-center">
            <h2 className="heading-lg" style={{ marginBottom: 8 }}>Les 5 agents Howner</h2>
            <p className="text-muted text-sm" style={{ marginBottom: 36 }}>1 crédit = 1 action. Chaque utilisation vous offre aussi 1 ticket pour le tirage.</p>

            <div className="agents-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, maxWidth: 1000, margin: '0 auto' }}>
              {AGENTS.map((a, i) => (
                <div key={i} className="card" style={{ padding: '24px 24px', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: 'rgba(207,175,75,.08)',
                    border: '1px solid rgba(207,175,75,.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    color: 'var(--a)',
                    flexShrink: 0,
                    fontWeight: 700,
                  }}>
                    {a.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 700 }}>{a.title}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--a)', padding: '2px 8px', borderRadius: 6, background: 'rgba(207,175,75,.1)', border: '1px solid rgba(207,175,75,.15)' }}>1 crédit</span>
                    </div>
                    <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ══ CE QUE HOWNER SCRAPE ══ */}
      <Reveal>
        <section style={{ paddingTop: 32, paddingBottom: 32 }}>
          <div className="container text-center">
            <p style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 20 }}>Ce que Howner scrape pour vous</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 0 }}>
              {['LeBonCoin', 'SeLoger', 'PAP', 'Bien\'ici', 'Logic-Immo', '+ agences locales'].map((name, i) => (
                <span key={i} style={{ fontSize: 14, color: 'rgba(255,255,255,.35)', fontWeight: 600, padding: '6px 16px', borderRight: i < 5 ? '1px solid rgba(255,255,255,.08)' : 'none' }}>
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ══ COMMENT ÇA MARCHE ══ */}
      <Reveal>
        <section className="section section-mid" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div className="container text-center">
            <h2 className="heading-lg" style={{ marginBottom: 32 }}>Comment ça marche</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, maxWidth: 900, margin: '0 auto' }}>
              {[
                { step: '1', title: 'Décrivez', desc: 'Dites à l\u2019agent ce que vous cherchez en langage naturel.' },
                { step: '2', title: 'L\u2019IA cherche', desc: 'Howner scrape tous les portails et analyse en temps réel.' },
                { step: '3', title: 'Vous choisissez', desc: 'Résultats triés par score. Réservez, contactez, décidez.' },
              ].map(s => (
                <div key={s.step} className="card" style={{ padding: '28px 24px', textAlign: 'center' }}>
                  <div className="mono text-gold" style={{ fontSize: 36, fontWeight: 700, marginBottom: 10 }}>{s.step}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{s.title}</div>
                  <div className="text-muted text-sm" style={{ lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ══ PACKS CRÉDITS ══ */}
      <Reveal>
        <section className="section" id="packs" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div className="container text-center">
            <h2 className="heading-lg" style={{ marginBottom: 8 }}>Packs crédits</h2>
            <p className="text-muted text-sm" style={{ marginBottom: 8 }}>
              1 crédit = 1 recherche, 1 analyse, ou 1 mise en relation
            </p>
            <p className="text-gold text-xs" style={{ fontWeight: 700, marginBottom: 32 }}>
              + 1 ticket OFFERT par crédit pour le tirage de la villa à 695 000\u20ac
            </p>

            <div className="packs-grid" style={{ maxWidth: 900, margin: '0 auto' }}>
              {[
                { n: 1, price: '9\u20ac', per: '9\u20ac', t: 1 },
                { n: 5, price: '39\u20ac', per: '7,80\u20ac', t: 5, save: 13 },
                { n: 10, price: '69\u20ac', per: '6,90\u20ac', t: 10, save: 23, pop: true },
                { n: 20, price: '119\u20ac', per: '5,95\u20ac', t: 20, save: 34 },
              ].map((pk, i) => (
                <div key={i} className={`pack-card${pk.pop ? ' popular' : ''}`}>
                  {pk.pop && <div className="pack-badge">Populaire</div>}
                  <div className="mono" style={{ fontSize: 40, fontWeight: 700 }}>{pk.n}</div>
                  <div className="text-muted text-sm" style={{ marginBottom: 8 }}>crédit{pk.n > 1 ? 's' : ''}</div>
                  <div className="text-gold" style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--d)', marginBottom: 4 }}>{pk.price}</div>
                  <div className="text-muted text-xs" style={{ marginBottom: 8 }}>{pk.per}/crédit</div>
                  {pk.save && <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, background: 'rgba(52,211,153,.08)', border: '1px solid rgba(52,211,153,.15)', fontSize: 11, fontWeight: 700, color: '#34d399', marginBottom: 8 }}>-{pk.save}%</div>}
                  <div style={{ marginBottom: 12 }}>
                    <span className="badge text-gold" style={{ background: 'rgba(207,175,75,.1)', fontSize: 12 }}>+{pk.t} ticket{pk.t > 1 ? 's' : ''} offert{pk.t > 1 ? 's' : ''}</span>
                  </div>
                  <Link href="/login" className="btn-primary" style={{ width: '100%', padding: '10px 0', fontSize: 13 }}>Acheter</Link>
                </div>
              ))}
            </div>
            <p className="text-muted text-xs" style={{ marginTop: 20 }}>Les crédits n&apos;expirent jamais. Utilisez-les quand vous voulez.</p>
          </div>
        </section>
      </Reveal>

      {/* ══ LA VILLA ══ */}
      <Reveal>
        <section className="section section-mid" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div className="container text-center">
            <h2 className="heading-lg" style={{ marginBottom: 8 }}>La villa à gagner — Cycle 1</h2>
            <p className="text-muted text-sm" style={{ marginBottom: 24 }}>
              Villa Boucau — 149m\u00b2 · 4 chambres · Piscine · Pays Basque
            </p>
            <div style={{ maxWidth: 700, margin: '0 auto', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(207,175,75,.12)', position: 'relative' }}>
              <img src="/villa/exterior-1.jpg" alt="Villa Boucau — 695 000\u20ac" style={{ width: '100%', height: 'auto', display: 'block' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,.85))', padding: '50px 20px 20px', textAlign: 'center' }}>
                <div className="mono text-gold" style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>695 000\u20ac</div>
                <p className="text-muted text-xs">Construite par Affinity House Factory</p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginTop: 20, lineHeight: 1.7 }}>
              Chaque crédit acheté = 1 ticket offert pour le tirage
            </p>
            <Link href="/villa" className="btn-primary" style={{ padding: '12px 32px', fontSize: 14, marginTop: 16, display: 'inline-block' }}>En savoir plus</Link>
          </div>
        </section>
      </Reveal>

      {/* ══ PROS ══ */}
      <Reveal>
        <section className="section" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div className="container" style={{ maxWidth: 700 }}>
            <div className="card" style={{ padding: '36px 28px', textAlign: 'center' }}>
              <h2 className="heading-lg" style={{ marginBottom: 8 }}>Vous êtes professionnel ?</h2>
              <p className="text-muted text-sm" style={{ marginBottom: 6 }}>
                Agent immo, courtier, artisan, architecte, diagnostiqueur...
              </p>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
                50 000 utilisateurs qualifiés vous attendent.
              </p>
              <p className="text-muted text-sm" style={{ marginBottom: 24 }}>
                Votre profil personnel, pas celui de votre agence.
              </p>
              <Link href="/login" className="btn-primary" style={{ padding: '12px 36px', fontSize: 14 }}>Devenir Pro Howner — dès 39\u20ac/mois</Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ══ CONFIANCE ══ */}
      <Reveal>
        <section style={{ paddingTop: 32, paddingBottom: 32 }}>
          <div className="container">
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24, textAlign: 'center' }}>
              {[
                'Huissier de justice',
                'Directive EU 2005/29/CE',
                'Paiement Stripe sécurisé',
                'Tickets OFFERTS, jamais vendus',
                'Remboursement garanti si seuil non atteint',
              ].map((t, i) => (
                <span key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontWeight: 600, letterSpacing: 0.5 }}>{t}</span>
              ))}
            </div>
            <p className="text-muted text-xs text-center" style={{ marginTop: 16 }}>
              Affinity House Factory SAS · SIRET 982 581 506 00010 · Anglet, Pays Basque
            </p>
          </div>
        </section>
      </Reveal>

      {/* ══ FAQ ══ */}
      <Reveal>
        <section className="section section-mid" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div className="container" style={{ maxWidth: 700 }}>
            <h2 className="heading-lg text-center" style={{ marginBottom: 32 }}>Questions fréquentes</h2>
            {FAQ_DATA.map((faq, i) => (
              <div key={i} className="card" style={{ padding: 0, cursor: 'pointer', marginBottom: 8 }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{faq.q}</span>
                  <span className="text-gold" style={{ fontSize: 18, transition: 'transform .2s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                </div>
                {openFaq === i && <div style={{ padding: '0 20px 16px' }}><p className="text-muted text-sm" style={{ lineHeight: 1.7 }}>{faq.a}</p></div>}
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ══ CTA FINAL ══ */}
      <section style={{ position: 'relative', padding: '80px 20px', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #191C1F 0%, #242930 50%, #191C1F 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="heading-lg" style={{ marginBottom: 12, fontSize: 'clamp(22px, 4vw, 36px)' }}>Votre agent immobilier vous attend.</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.5)', marginBottom: 28 }}>
            1 crédit offert. 0 engagement.
          </p>
          <Link href="/login" className="btn-primary btn-shine" style={{ padding: '16px 48px', fontSize: 16 }}>Commencer gratuitement</Link>
          <p style={{ marginTop: 16 }}>
            <Link href="/login" style={{ fontSize: 13, color: 'rgba(255,255,255,.35)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Déjà inscrit ? Se connecter</Link>
          </p>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,.06)', padding: '32px 0', textAlign: 'center' }}>
        <div className="container">
          <p className="text-muted text-xs" style={{ lineHeight: 2 }}>
            Affinity House Factory SAS · SIRET 982 581 506 00010 · Anglet, Pays Basque<br />
            Jeu concours promotionnel · Directive EU 2005/29/CE · Huissier de justice<br />
            Participation gratuite possible · Tickets offerts en bonus · Jamais vendus
          </p>
          <p className="text-muted text-xs" style={{ marginTop: 8 }}>&copy; 2025 Howner</p>
        </div>
      </footer>

      <LiveNotif />
      <StickyCTA />

      <style>{`
        @media(max-width:639px){.nav-gauge{display:none!important}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dotPulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.1)}}
        @media(min-width:640px){
          .agents-grid{grid-template-columns:repeat(2,1fr)!important}
        }
        @media(min-width:1024px){
          .agents-grid{grid-template-columns:repeat(3,1fr)!important}
        }
      `}</style>
    </>
  )
}
