'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { STANDARD_PACKS, PRO_PACKS } from '@/lib/stripe'

/* ═══ CONSTANTS ═══ */
const TOTAL = 200000
const INIT = 4283

const TICKER_MESSAGES = [
  'PLATEFORME D\'ANNONCES IMMOBILIÈRES AVEC MATCHING',
  'DEVENEZ PROPRIÉTAIRE — VILLA 695 000€ À GAGNER',
  'INSCRIPTION GRATUITE · 1ÈRE ANNONCE OFFERTE',
  'MATCHING IMMOBILIER GRATUIT ET ILLIMITÉ',
  'TICKETS OFFERTS GRATUITEMENT · JAMAIS VENDUS',
  'HUISSIER DE JUSTICE · CONFORME EU 2005/29/CE',
]

const LIVE_MESSAGES = [
  { text: 'Nouvelle annonce — T4 vue mer Biarritz', sub: 'Vente · 420 000€', color: '#3b82f6' },
  { text: 'Profil vérifié — Agent immo Bayonne', sub: 'Sophie D. · 4.8★', color: '#34d399' },
  { text: 'Match : acheteur ↔ vendeur à Anglet', sub: 'Contact débloqué', color: '#f472b6' },
  { text: 'Annonce publiée — Studio Bayonne', sub: 'Location · 650€/mois', color: '#a855f7' },
  { text: 'Annonce boostée — Maison Boucau', sub: 'En tête 24h', color: '#cfaf4b' },
  { text: 'Pack Pro acheté — Courtier Biarritz', sub: '+30 tickets offerts', color: '#f59e0b' },
]

const FAQ_DATA = [
  { q: 'C\u2019est quoi Howner ?', a: 'Howner connecte les particuliers (acheteurs, vendeurs, locataires) avec les professionnels de l\u2019immobilier (agents, courtiers) par matching. Vous publiez ce que vous cherchez, le matching fait le reste. Inscription gratuite, 1ère annonce offerte, matching illimité.' },
  { q: 'Comment ça fonctionne pour un particulier ?', a: 'Vous vous inscrivez gratuitement. Vous postez votre recherche ("Je cherche un T3 à Bayonne", "Je cherche un courtier"). Les pros inscrits voient votre demande et vous apparaissez dans leur matching. Match mutuel = contact débloqué. Pas de spam, pas de harcèlement.' },
  { q: 'Comment ça fonctionne pour un professionnel ?', a: 'Agent immo ou courtier : vous créez votre profil personnel (pas celui de votre agence). Les particuliers qui cherchent vos services vous trouvent par matching. Vous boostez vos annonces avec des crédits pour être en tête. Vos clients viennent à vous.' },
  { q: 'C\u2019est quoi l\u2019histoire de la villa ?', a: 'Le ticket est OFFERT gratuitement avec chaque achat de crédit. C\u2019est un bonus, pas un produit. Chaque crédit acheté sur Howner offre un ticket bonus pour gagner une villa à 695\u202F000€ construite au Pays Basque. Quand 200\u202F000 tickets sont distribués, tirage en direct par huissier de justice. Le gagnant repart avec la villa. Puis un nouveau cycle commence.' },
  { q: 'C\u2019est légal ?', a: 'Oui. On vend des crédits (un service réel : poster, booster, alerter). Le ticket est un bonus offert avec l\u2019achat. Conforme à la Directive Européenne 2005/29/CE. Règlement déposé chez huissier de justice. Participation gratuite possible via inscription + parrainage.' },
  { q: 'Qu\u2019est-ce qui est gratuit ?', a: 'Presque tout. L\u2019inscription, la 1ère annonce, le scroll illimité, le matching, le contact après match mutuel, le parrainage illimité. Le seul produit payant = les crédits (pour poster des annonces supplémentaires, booster, ou activer des alertes).' },
  { q: 'Et si le seuil de 200 000 tickets n\u2019est pas atteint ?', a: 'Remboursement intégral garanti sous 30 jours. Les fonds sont sécurisés. Aucun risque.' },
]

const COMPARISON = [
  { feature: 'Publier une annonce', howner: true, leboncoin: 'Payant pros', seloger: 'Payant', travaux: '—' },
  { feature: 'Matching intelligent', howner: true, leboncoin: '—', seloger: '—', travaux: '—' },
  { feature: 'Contact sans spam', howner: true, leboncoin: '—', seloger: '—', travaux: '—' },
  { feature: 'Profil pro personnel', howner: true, leboncoin: '—', seloger: 'Par agence', travaux: '—' },
  { feature: 'Avis vérifiés', howner: true, leboncoin: '—', seloger: '—', travaux: 'Basic' },
  { feature: 'Boost à partir de 9€', howner: true, leboncoin: '30€+', seloger: '200€+', travaux: '—' },
  { feature: 'Ticket villa offert', howner: true, leboncoin: '—', seloger: '—', travaux: '—' },
]

const EXAMPLES = [
  {
    cat: 'IMMOBILIER', color: '#3b82f6',
    items: [
      { title: 'T3 lumineux avec terrasse', loc: 'Bayonne centre', price: '245 000€', by: 'Agent immo', stars: '4.8★' },
      { title: 'Maison 5p avec jardin', loc: 'Anglet', price: '380 000€', by: 'Particulier', stars: '' },
    ]
  },
  {
    cat: 'PROS', color: '#f59e0b',
    items: [
      { title: 'Estimation gratuite de votre bien', loc: 'Côte Basque', price: 'Gratuit', by: 'Agent immo', stars: '4.9★' },
      { title: 'Courtier — Meilleur taux garanti', loc: 'Bayonne · Biarritz', price: 'Gratuit', by: 'Courtier', stars: '4.7★' },
    ]
  },
  {
    cat: 'DEMANDES', color: '#a855f7',
    items: [
      { title: 'Recherche T2/T3 à louer', loc: 'Bayonne', price: 'Max 800€/mois', by: 'Particulier', stars: '' },
      { title: 'Cherche maison avec jardin', loc: 'Anglet · Boucau', price: 'Budget 350 000€', by: 'Particulier', stars: '' },
    ]
  },
]

/* ═══ SCROLL REVEAL ═══ */
function useReveal() {
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
  return ref
}
function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal()
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>
}

/* ═══ LIVE TICKER ═══ */
function LiveTicker() {
  const [current, setCurrent] = useState(0)
  const [show, setShow] = useState(true)
  useEffect(() => {
    const interval = setInterval(() => {
      setShow(false)
      setTimeout(() => { setCurrent(i => (i + 1) % LIVE_MESSAGES.length); setShow(true) }, 400)
    }, 4000)
    return () => clearInterval(interval)
  }, [])
  const msg = LIVE_MESSAGES[current]
  return (
    <div className="live-notif" style={{
      opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(10px)',
      transition: 'all .4s cubic-bezier(.16,1,.3,1)', borderLeft: `3px solid ${msg.color}`,
    }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: msg.color, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{msg.text}</div>
        {msg.sub && <div style={{ fontSize: 10, color: '#34d399', fontWeight: 700, marginTop: 2 }}>{msg.sub}</div>}
      </div>
    </div>
  )
}

/* ═══ STICKY CTA ═══ */
function StickyCTA() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 600)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
  return (
    <div className={`sticky-cta${visible ? ' visible' : ''}`}>
      <span className="text-muted text-xs" style={{ fontWeight: 600 }}>Cycle 1 en cours</span>
      <Link href="/login" className="btn-primary btn-shine" style={{ padding: '10px 24px', fontSize: 13 }}>
        Commencer — gratuit
      </Link>
    </div>
  )
}

/* ═══ MAIN PAGE ═══ */
export default function Home() {
  const [gaugeCount, setGaugeCount] = useState(INIT)
  const [pricingTab, setPricingTab] = useState<'standard' | 'pro'>('standard')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => setGaugeCount(p => Math.min(TOTAL, p + Math.floor(Math.random() * 3) + 1))
    const schedule = () => {
      const delay = 5000 + Math.random() * 3000
      return setTimeout(() => { tick(); timerId = schedule() }, delay)
    }
    let timerId = schedule()
    return () => clearTimeout(timerId)
  }, [])

  const gaugePct = (gaugeCount / TOTAL) * 100
  const remaining = TOTAL - gaugeCount
  const packs = pricingTab === 'standard' ? STANDARD_PACKS : PRO_PACKS

  return (
    <>
      {/* ════════ TICKER ════════ */}
      <div className="ticker-bar">
        <div className="ticker-content">
          {[...TICKER_MESSAGES, ...TICKER_MESSAGES].map((msg, i) => (
            <span className="ticker-item" key={i}>{msg}</span>
          ))}
        </div>
      </div>

      {/* ════════ NAV ════════ */}
      <nav className="nav">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span className="heading-md text-gradient" style={{ fontSize: 22, letterSpacing: -0.5 }}>HOWNER</span>
        </Link>
        <div className="nav-gauge" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 80, height: 4, borderRadius: 10, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 10, background: 'var(--a)', width: `${gaugePct}%`, transition: 'width 1s' }} />
          </div>
          <span className="mono text-gold" style={{ fontSize: 9 }}>{gaugeCount.toLocaleString()}/{TOTAL / 1000}K</span>
        </div>
        <Link href="/login" className="btn-primary btn-shine" style={{ padding: '8px 20px', fontSize: 13 }}>
          Commencer
        </Link>
      </nav>

      {/* ════════════════════════════════════════════════════════════
          HERO — Chaque personne doit comprendre en 5 secondes
          ════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '64px 0 0', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-glow" style={{ top: -100, right: -200, background: 'var(--a)' }} />
        <div className="hero-glow" style={{ bottom: -100, left: -200, background: '#3b82f6' }} />

        <div className="container text-center" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 20 }}>
            <span className="badge" style={{ background: 'transparent', border: 'none', color: 'rgba(207,175,75,.5)', fontSize: 11, padding: '4px 0', letterSpacing: 2, textTransform: 'uppercase' }}>
              Nouveau concept · Lancement Cycle 1
            </span>
          </div>

          <h1 className="heading-xl" style={{ marginBottom: 20, lineHeight: 1.15, letterSpacing: -1 }}>
            <span className="text-gradient" style={{ fontSize: 'inherit' }}>Devenez propriétaire.</span>
          </h1>

          <p style={{ fontSize: 18, lineHeight: 1.8, maxWidth: 540, margin: '0 auto 12px', color: 'rgba(255,255,255,.7)' }}>
            La 1ère plateforme d&apos;annonces immobilières avec matching. Trouvez le bon bien, le bon agent, le bon acheteur — en un swipe.
          </p>
          <p style={{ fontSize: 15, color: 'var(--a)', fontWeight: 700, marginBottom: 28 }}>
            + 1 ticket OFFERT pour gagner une villa à 695 000€
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
            <Link href="/login" className="btn-primary btn-shine" style={{ padding: '16px 40px', fontSize: 16 }}>
              Commencer gratuitement
            </Link>
            <Link href="#villa-section" className="btn-secondary">Voir la villa à gagner →</Link>
          </div>

          <p className="text-muted text-xs" style={{ marginBottom: 32 }}>
            Gratuit · 1ère annonce offerte · Matching illimité · 0 spam
          </p>
        </div>

        {/* Villa image */}
        <div className="container">
          <div className="villa-hero-wrapper">
            <img
              src="/villa/exterior-1.jpg"
              alt="Villa Boucau — construite par Affinity Home — Pays Basque"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,.9))', padding: '48px 24px 20px' }}>
              <p className="text-gold mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' }}>
                Le lot du Cycle 1
              </p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8, fontFamily: 'var(--d)' }}>
                Villa Boucau — <span className="text-gradient">695 000€</span>
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                {['149m²', '4 chambres', 'Piscine', 'Pays Basque'].map(spec => (
                  <span key={spec} style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,.8)', fontSize: 11, fontWeight: 600 }}>
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ GAUGE ════════ */}
      <Reveal>
        <section className="section-dark" style={{ padding: '28px 0 48px' }}>
          <div className="container">
            <div style={{ maxWidth: 560, margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                <div className="glow-dot" />
                <span className="text-muted text-xs" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Tirage en cours</span>
              </div>
              <div className="text-center" style={{ marginBottom: 10 }}>
                <span className="counter-num text-gold" style={{ fontSize: 28 }}>{gaugeCount.toLocaleString()}</span>
                <span className="mono text-muted" style={{ fontSize: 16 }}> / {TOTAL.toLocaleString()} tickets</span>
              </div>
              <div className="gauge-bar" style={{ height: 12, marginBottom: 10 }}>
                <div className="gauge-fill" style={{ width: `${gaugePct}%` }} />
              </div>
              <p className="mono text-center" style={{ fontSize: 13, color: '#f472b6', fontWeight: 700 }}>
                Plus que {remaining.toLocaleString()} tickets avant le tirage
              </p>
            </div>
          </div>
        </section>
      </Reveal>


      {/* ════════════════════════════════════════════════════════════
          VOUS CHERCHEZ — Chaque persona trouve sa réponse
          ════════════════════════════════════════════════════════════ */}
      <Reveal>
        <section className="section section-mid">
          <div className="container">
            <h2 className="heading-lg text-center" style={{ marginBottom: 8 }}>Qui êtes-vous ?</h2>
            <p className="text-muted text-sm text-center" style={{ maxWidth: 440, margin: '0 auto 32px' }}>
              Trois profils. Un seul objectif : se trouver.
            </p>

            <div className="grid-3">
              {[
                {
                  title: 'Vous cherchez un bien',
                  desc: 'Publiez votre recherche. Les agents qui ont votre bien vous trouvent. Match mutuel = contact sans spam.',
                  action: 'Trouver mon bien', color: '#3b82f6',
                },
                {
                  title: 'Vous vendez ou louez',
                  desc: '1ère annonce gratuite. Les acheteurs et locataires qui matchent vous contactent directement.',
                  action: 'Publier mon annonce', color: '#a855f7',
                },
                {
                  title: 'Vous êtes pro',
                  desc: 'Agent immo, courtier, promoteur : vos clients vous trouvent par matching. Profil personnel, avis vérifiés.',
                  action: 'Créer mon profil pro', color: '#cfaf4b',
                },
              ].map((card, i) => (
                <div key={i} className="card-glass text-center" style={{ borderColor: `${card.color}15` }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8, fontFamily: 'var(--d)' }}>{card.title}</h3>
                  <p className="text-muted text-xs" style={{ lineHeight: 1.6, marginBottom: 14 }}>{card.desc}</p>
                  <Link href="/login" style={{ fontSize: 12, fontWeight: 700, color: card.color, textDecoration: 'none' }}>
                    {card.action} →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>


      {/* ════════════════════════════════════════════════════════════
          LE PROBLÈME — Pourquoi les solutions actuelles ne marchent pas
          ════════════════════════════════════════════════════════════ */}
      <Reveal>
        <section className="section section-dark">
          <div className="container">
            <h2 className="heading-lg text-center" style={{ marginBottom: 8 }}>Pourquoi tout est cassé</h2>
            <p className="text-muted text-sm text-center" style={{ maxWidth: 500, margin: '0 auto 32px' }}>
              L&apos;immobilier en ligne n&apos;a pas changé depuis 15 ans. Personne n&apos;y gagne.
            </p>

            <div className="grid-2" style={{ gap: 20 }}>
              {/* Particuliers */}
              <div className="card-glass" style={{ borderColor: 'rgba(248,113,113,.12)' }}>
                <h3 className="heading-md" style={{ marginBottom: 16 }}>Si vous êtes particulier</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { problem: 'SeLoger', pain: 'Des milliers d\'annonces mais aucun matching. Vous cherchez seul pendant des mois.' },
                    { problem: 'LeBonCoin', pain: 'Pas de vérification, pas de profil agent, des annonces douteuses. Vous ne savez pas à qui vous parlez.' },
                    { problem: 'Agences classiques', pain: 'Vous poussez la porte d\'une agence et on vous propose ce qu\'ils ont, pas ce que vous cherchez.' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: '#f87171', fontSize: 14, lineHeight: 1.3, fontWeight: 700 }}>✗</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.8)' }}>{item.problem}</div>
                        <div className="text-muted text-xs" style={{ lineHeight: 1.6 }}>{item.pain}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pros */}
              <div className="card-glass" style={{ borderColor: 'rgba(248,113,113,.12)' }}>
                <h3 className="heading-md" style={{ marginBottom: 16 }}>Si vous êtes professionnel</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { problem: 'SeLoger / LeBonCoin', pain: 'Vous payez 200€/mois minimum pour être visible. Résultat : des curieux, pas des acheteurs.' },
                    { problem: 'Prospection terrain', pain: 'Porte-à-porte, flyers, cold calling. Du temps perdu sur des contacts non qualifiés.' },
                    { problem: 'Profil agence', pain: 'Vos clients choisissent une enseigne, pas vous. Votre réputation personnelle n\'existe pas en ligne.' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: '#f87171', fontSize: 14, lineHeight: 1.3, fontWeight: 700 }}>✗</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.8)' }}>{item.problem}</div>
                        <div className="text-muted text-xs" style={{ lineHeight: 1.6 }}>{item.pain}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>


      {/* ════════════════════════════════════════════════════════════
          LA SOLUTION — Howner résout chaque problème
          ════════════════════════════════════════════════════════════ */}
      <Reveal>
        <section className="section section-mid">
          <div className="container">
            <h2 className="heading-lg text-center" style={{ marginBottom: 8 }}>
              La solution : <span className="text-gradient">Howner</span>
            </h2>
            <p className="text-muted text-sm text-center" style={{ maxWidth: 480, margin: '0 auto 32px' }}>
              On connecte les bonnes personnes. Par matching. Sans spam.
            </p>

            <div className="grid-2" style={{ gap: 20 }}>
              {/* Pour les particuliers */}
              <div className="card-glass" style={{ borderColor: 'rgba(52,211,153,.12)' }}>
                <h3 className="heading-md" style={{ marginBottom: 16 }}>Pour les particuliers</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { title: 'Vous choisissez qui vous contacte', desc: 'Match mutuel = seuls les agents que vous avez sélectionnés peuvent vous écrire. Zéro démarchage.' },
                    { title: 'Des agents avec profil et avis', desc: 'Vous voyez leur nom, leur zone, leurs avis, leurs ventes. Vous choisissez en connaissance de cause.' },
                    { title: 'Publiez votre recherche gratuitement', desc: '"Je cherche un T3 à Bayonne max 250K" — les agents qui ont le bien vous trouvent.' },
                    { title: 'Inscription gratuite + 1 ticket OFFERT', desc: 'Vous n\'avez rien à payer pour utiliser Howner. Et on vous offre un ticket pour la villa.' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: '#34d399', fontSize: 14, lineHeight: 1.3, fontWeight: 700 }}>✓</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{item.title}</div>
                        <div className="text-muted text-xs" style={{ lineHeight: 1.6 }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pour les pros */}
              <div className="card-glass" style={{ borderColor: 'rgba(207,175,75,.12)' }}>
                <h3 className="heading-md" style={{ marginBottom: 16 }}>Pour les professionnels</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { title: 'Vos clients viennent à vous', desc: 'Les acheteurs et locataires publient ce qu\'ils cherchent. Vous apparaissez dans leur matching.' },
                    { title: 'Votre nom, pas celui de votre agence', desc: '"Sophie D. · Agent immo · Bayonne · 4.7★ · 43 ventes" — vos clients vous choisissent VOUS.' },
                    { title: 'Boostez pour 9€, pas 200€', desc: '1 crédit = 9€ = votre annonce en tête 24h. Pack Pro 30 crédits = 149€. Pas d\'abonnement.' },
                    { title: '+ 1 ticket OFFERT par crédit', desc: 'Chaque crédit acheté vous offre gratuitement un ticket pour gagner une villa à 695 000€.' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: '#cfaf4b', fontSize: 14, lineHeight: 1.3, fontWeight: 700 }}>✓</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{item.title}</div>
                        <div className="text-muted text-xs" style={{ lineHeight: 1.6 }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>


      {/* ════════ COMMENT ÇA MARCHE ════════ */}
      <Reveal>
        <section className="section section-dark">
          <div className="container">
            <h2 className="heading-lg text-center" style={{ marginBottom: 32 }}>Comment ça marche</h2>
            <div className="grid-3">
              {[
                { step: '01', title: 'Inscrivez-vous', desc: 'Gratuit. 1 ticket offert. Postez votre 1ère annonce ou demande — offerte.', color: '#3b82f6' },
                { step: '02', title: 'Matchez', desc: 'Parcourez les annonces et profils. Match mutuel = contact débloqué gratuitement.', color: '#a855f7' },
                { step: '03', title: 'Boostez avec des crédits', desc: 'Postez plus, boostez 24h, activez des alertes. Chaque crédit = 1 ticket pour la villa.', color: '#cfaf4b' },
              ].map(s => (
                <div key={s.step} className="card-glass text-center">
                  <div className="mono" style={{ fontSize: 48, fontWeight: 800, color: s.color, opacity: 0.15, lineHeight: 1, marginBottom: 8 }}>{s.step}</div>
                  <h3 className="heading-md" style={{ marginBottom: 8 }}>{s.title}</h3>
                  <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>


      {/* ════════ EXEMPLES D'ANNONCES ════════ */}
      <Reveal>
        <section className="section section-mid">
          <div className="container">
            <h2 className="heading-lg text-center" style={{ marginBottom: 8 }}>Ce que vous trouverez</h2>
            <p className="text-muted text-sm text-center" style={{ maxWidth: 480, margin: '0 auto 32px' }}>
              Biens immobiliers, pros vérifiés, demandes de particuliers — tout au même endroit.
            </p>
            <div className="grid-3">
              {EXAMPLES.map(cat => (
                <div key={cat.cat}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 4, height: 20, borderRadius: 2, background: cat.color }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: cat.color, textTransform: 'uppercase', letterSpacing: 1.5 }}>{cat.cat}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {cat.items.map((l, i) => (
                      <div key={i} className="card-glass" style={{ padding: '16px 18px' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4, lineHeight: 1.3 }}>{l.title}</div>
                        <div className="text-muted text-xs" style={{ marginBottom: 8 }}>{l.loc} · {l.price}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,.4)' }}>{l.by}</span>
                          {l.stars && <span className="text-xs" style={{ color: '#fbbf24' }}>{l.stars}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center" style={{ marginTop: 28 }}>
              <Link href="/annonces" className="btn-secondary">Explorer les annonces →</Link>
            </div>
          </div>
        </section>
      </Reveal>


      {/* ════════ COMPARAISON ════════ */}
      <Reveal>
        <section className="section section-dark">
          <div className="container" style={{ maxWidth: 800 }}>
            <h2 className="heading-lg text-center" style={{ marginBottom: 8 }}>Howner vs les plateformes actuelles</h2>
            <p className="text-muted text-sm text-center" style={{ marginBottom: 32 }}>Comparez par vous-même.</p>
            <div className="card-glass" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="compare-table">
                <thead>
                  <tr style={{ background: 'rgba(207,175,75,.03)' }}>
                    <th></th>
                    <th className="text-gold">Howner</th>
                    <th>LeBonCoin</th>
                    <th className="hide-mobile">SeLoger</th>
                    <th>Travaux.com</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr key={i}>
                      <td className="feature-col">{row.feature}</td>
                      <td><span className="check">✓</span></td>
                      <td>{row.leboncoin === '—' ? <span className="cross">✗</span> : <span className="text-muted text-xs">{row.leboncoin}</span>}</td>
                      <td className="hide-mobile">{row.seloger === '—' ? <span className="cross">✗</span> : <span className="text-muted text-xs">{row.seloger}</span>}</td>
                      <td>{row.travaux === '—' ? <span className="cross">✗</span> : <span className="text-muted text-xs">{row.travaux}</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </Reveal>


      {/* ════════ PRICING ════════ */}
      <Reveal>
        <section className="section section-accent">
          <div className="container text-center">
            <h2 className="heading-lg" style={{ marginBottom: 4 }}>Les crédits</h2>
            <p className="text-muted text-sm" style={{ marginBottom: 4 }}>
              1 crédit = poster une annonce, booster 24h, ou activer une alerte 30 jours
            </p>
            <p className="text-gold text-xs" style={{ marginBottom: 28, fontWeight: 700 }}>
              1 ticket OFFERT pour la villa à chaque crédit acheté — le ticket est gratuit
            </p>

            <div style={{ display: 'inline-flex', borderRadius: 12, border: '1px solid rgba(255,255,255,.08)', overflow: 'hidden', marginBottom: 28, background: 'rgba(255,255,255,.02)' }}>
              {(['standard', 'pro'] as const).map(tab => (
                <button key={tab} onClick={() => setPricingTab(tab)} style={{
                  padding: '12px 28px', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
                  background: pricingTab === tab ? 'var(--a)' : 'transparent',
                  color: pricingTab === tab ? '#0a0e1a' : 'rgba(255,255,255,.5)',
                  fontFamily: 'var(--b)', transition: 'all .2s',
                }}>
                  {tab === 'standard' ? 'Tout le monde' : 'Professionnels'}
                </button>
              ))}
            </div>

            <div className="packs-grid">
              {packs.map((pack, i) => {
                const isPopular = i === packs.length - 2
                const basePrice = pricingTab === 'standard' ? 9 : (packs[0].price / packs[0].credits / 100)
                const currentPerCredit = pack.price / pack.credits / 100
                const savings = pack.credits > (pricingTab === 'standard' ? 1 : 10) ? Math.round((1 - currentPerCredit / basePrice) * 100) : 0
                return (
                  <div key={pack.id} className={`pack-card${isPopular ? ' popular' : ''}`}>
                    {isPopular && <div className="pack-badge">Populaire</div>}
                    <div className="mono" style={{ fontSize: 38, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{pack.credits}</div>
                    <div className="text-muted text-sm" style={{ marginBottom: 14 }}>crédits</div>
                    <div className="text-gradient" style={{ fontSize: 30, fontWeight: 700, fontFamily: 'var(--d)', marginBottom: 4 }}>{pack.priceLabel}</div>
                    <div className="text-muted text-xs" style={{ marginBottom: 10 }}>{pack.pricePerCredit}/crédit</div>
                    {savings > 0 && (
                      <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, background: 'rgba(52,211,153,.08)', border: '1px solid rgba(52,211,153,.15)', fontSize: 11, fontWeight: 700, color: '#34d399', marginBottom: 10 }}>
                        -{savings}%
                      </div>
                    )}
                    <div style={{ marginBottom: 14 }}>
                      <span className="badge text-gold" style={{ background: 'rgba(207,175,75,.1)', fontSize: 11 }}>
                        +{pack.tickets} ticket{pack.tickets > 1 ? 's' : ''} offert{pack.tickets > 1 ? 's' : ''}
                      </span>
                    </div>
                    <Link href="/login" className="btn-primary btn-shine" style={{ width: '100%', padding: '11px 0', fontSize: 13 }}>Acheter</Link>
                  </div>
                )
              })}
            </div>
            <p className="text-muted text-sm" style={{ marginTop: 24 }}>
              Pas d&apos;abonnement. Le crédit n&apos;expire jamais. Le ticket est un bonus offert.
            </p>
          </div>
        </section>
      </Reveal>


      {/* ════════ VILLA ════════ */}
      <Reveal>
        <section className="section section-dark" id="villa-section">
          <div className="container">
            <h2 className="heading-lg text-center" style={{ marginBottom: 8 }}>La villa du Cycle 1</h2>
            <p className="text-muted text-sm text-center" style={{ marginBottom: 24 }}>
              Construite par Affinity Home · Finitions Porcelanosa · Construction LSF · Clé en main
            </p>
            <div className="gallery-main">
              <img className="gallery-img" src="/villa/exterior-1.jpg" alt="Villa Boucau — Extérieur" />
              <div className="gallery-side">
                <img className="gallery-side-img" src="/villa/cuisine.jpg" alt="Cuisine" />
                <img className="gallery-side-img" src="/villa/salon.jpg" alt="Salon" />
              </div>
            </div>
            <div className="gallery-thumbs" style={{ marginBottom: 20 }}>
              <img className="gallery-thumb" src="/villa/exterior-2.jpg" alt="Vue arrière" />
              <img className="gallery-thumb" src="/villa/chambre.jpg" alt="Chambre" />
              <img className="gallery-thumb" src="/villa/terrain.jpg" alt="Terrain" />
            </div>
            <div className="text-center">
              <Link href="/villa" className="btn-secondary">Voir la villa et le règlement →</Link>
            </div>
          </div>
        </section>
      </Reveal>


      {/* ════════ CONFIANCE ════════ */}
      <Reveal>
        <section className="section section-mid">
          <div className="container">
            <h2 className="heading-lg text-center" style={{ marginBottom: 32 }}>Confiance et garanties</h2>
            <div className="grid-3">
              {[
                { title: 'Huissier de justice', desc: 'Tirage filmé en direct sous contrôle d\u2019un huissier. Résultat incontestable.' },
                { title: 'Conforme EU 2005/29/CE', desc: 'Règlement déposé. Validé par Cabinet Hashtag Avocats (Paris).' },
                { title: 'Remboursement garanti', desc: 'Seuil non atteint = remboursement intégral sous 30 jours.' },
                { title: 'Paiement Stripe', desc: 'Vos données bancaires ne passent jamais par nos serveurs.' },
                { title: '1 compte = 1 numéro', desc: 'Vérification SMS. Anti-fraude. Anti multi-comptes.' },
                { title: 'Société française', desc: 'Affinity House Factory SAS · SIRET 982 581 506 00010 · Anglet.' },
                { title: 'Tickets OFFERTS, jamais vendus', desc: 'Les tickets sont un cadeau gratuit avec l\u2019achat de crédits. Le jeu-concours est accessible gratuitement par inscription et parrainage.' },
              ].map((x, i) => (
                <div key={i} className="card-glass text-center" style={{ padding: '20px 18px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{x.title}</div>
                  <div className="text-muted text-xs" style={{ lineHeight: 1.6 }}>{x.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>


      {/* ════════ MISSION ════════ */}
      <Reveal>
        <section className="section section-dark">
          <div className="container">
            <div className="card-glow" style={{ maxWidth: 720, margin: '0 auto' }}>
              <div className="card-glow-inner text-center">
                <h3 className="heading-md text-gold" style={{ marginBottom: 20 }}>Plus qu&apos;une plateforme — une mission</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24, marginBottom: 20 }}>
                  {[
                    { val: '4,2M', label: 'de mal-logés en France' },
                    { val: '350 000', label: 'sans-abri' },
                    { val: '274 000', label: 'constructions/an (besoin : 400 000)' },
                  ].map(stat => (
                    <div key={stat.label} style={{ minWidth: 100 }}>
                      <div className="counter-num text-gold" style={{ fontSize: 24 }}>{stat.val}</div>
                      <div className="text-muted text-xs" style={{ marginTop: 2 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: 'rgba(255,255,255,.7)', maxWidth: 500, margin: '0 auto' }}>
                  Howner finance la construction de logements neufs grâce à sa communauté.
                  On ne revend pas une villa existante — on la construit.<br />
                  <strong className="text-gold">Chaque cycle = 1 villa construite = emplois locaux + logement créé.</strong>
                </p>
              </div>
            </div>
          </div>
        </section>
      </Reveal>


      {/* ════════ FAQ ════════ */}
      <Reveal>
        <section className="section section-mid">
          <div className="container" style={{ maxWidth: 700 }}>
            <h2 className="heading-lg text-center" style={{ marginBottom: 32 }}>Questions fréquentes</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {FAQ_DATA.map((faq, i) => (
                <div key={i} className={`accordion-item${openFaq === i ? ' open' : ''}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <button className="accordion-trigger">
                    <span className="accordion-title">{faq.q}</span>
                    <span className="accordion-icon">+</span>
                  </button>
                  {openFaq === i && <div className="accordion-body">{faq.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ════════ FINAL CTA ════════ */}
      <section className="section section-dark text-center" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="hero-glow" style={{ bottom: -100, left: '50%', transform: 'translateX(-50%)', background: 'var(--a)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="heading-lg" style={{ marginBottom: 12 }}>Le Cycle 1 est ouvert.</h2>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,.6)', maxWidth: 460, margin: '0 auto 28px' }}>
            Inscription gratuite. 1ère annonce offerte. Matching illimité.<br />
            <strong style={{ color: 'rgba(255,255,255,.8)' }}>+ 1 ticket villa OFFERT dès votre inscription.</strong>
          </p>
          <Link href="/login" className="btn-primary btn-shine" style={{ padding: '18px 48px', fontSize: 17 }}>
            Commencer maintenant
          </Link>
          <p className="text-muted text-xs" style={{ marginTop: 14 }}>
            Déjà inscrit ? <Link href="/login" style={{ color: 'var(--a)', textDecoration: 'none' }}>Se connecter</Link>
          </p>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,.06)', padding: '48px 0 96px' }}>
        <div className="container text-center">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20, marginBottom: 16 }}>
            {[
              { label: 'Annonces', href: '/annonces' },
              { label: 'Match', href: '/match' },
              { label: 'Crédits', href: '/credits' },
              { label: 'Villa', href: '/villa' },
            ].map(link => (
              <Link key={link.href} href={link.href} className="text-muted text-sm" style={{ textDecoration: 'none' }}>
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-muted text-xs" style={{ lineHeight: 1.8, marginBottom: 8 }}>
            Howner finance la construction de logements neufs en France.<br />
            Affinity House Factory SAS · SIRET 982 581 506 00010 · Anglet, Pays Basque
          </p>
          <p className="text-muted text-xs">© 2025 Howner. Tous droits réservés.</p>
        </div>
      </footer>

      <LiveTicker />
      <StickyCTA />

      <style>{`
        @media (max-width: 639px) {
          .nav-gauge { display: none !important; }
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </>
  )
}
