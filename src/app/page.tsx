'use client'

import { useState, useEffect, useRef, RefObject } from 'react'

const TOTAL = 200000
const INIT = 4283

function useVis(ref: RefObject<HTMLElement | null>, t = 0.1) {
  const [v, setV] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const o = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setV(true) },
      { threshold: t }
    )
    o.observe(ref.current)
    return () => o.disconnect()
  }, [ref, t])
  return v
}

/* ═══ GAUGE ═══ */
function Gauge({ mini }: { mini?: boolean }) {
  const [n, setN] = useState(INIT)
  const ref = useRef<HTMLDivElement>(null)
  const vis = useVis(ref)

  useEffect(() => {
    const id = setInterval(
      () => setN((p) => Math.min(TOTAL, p + Math.floor(Math.random() * 3) + 1)),
      5e3 + Math.random() * 5e3
    )
    return () => clearInterval(id)
  }, [])

  const pct = (n / TOTAL) * 100

  if (mini)
    return (
      <div ref={ref} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 70, height: 3, borderRadius: 10, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 10, background: 'var(--a)', width: `${pct}%` }} />
        </div>
        <span style={{ fontFamily: 'var(--m)', fontSize: 8, color: 'var(--a)' }}>
          {n.toLocaleString()}/{TOTAL / 1000}K
        </span>
      </div>
    )

  return (
    <div ref={ref} style={{ maxWidth: 460, width: '100%', opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(10px)', transition: 'all .8s cubic-bezier(.16,1,.3,1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399', animation: 'pulse 2s infinite' }} />
          <span style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Tirage en cours</span>
        </div>
        <span style={{ fontFamily: 'var(--m)', fontSize: 11, color: 'var(--a)' }}>
          {n.toLocaleString()} / {TOTAL.toLocaleString()} tickets
        </span>
      </div>
      <div style={{ height: 5, borderRadius: 10, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 10, background: 'linear-gradient(90deg, var(--a), #f5e6a3)', width: vis ? `${pct}%` : '0%', transition: 'width 2.5s cubic-bezier(.16,1,.3,1)', boxShadow: '0 0 12px rgba(207,175,75,0.25)' }} />
      </div>
      <div style={{ marginTop: 5, textAlign: 'center', fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,0.16)', letterSpacing: 2 }}>
        JEU CONCOURS GRATUIT · TIRAGE DÈS 200 000 TICKETS · HUISSIER DE JUSTICE
      </div>
    </div>
  )
}

/* ═══ LISTING BROWSE ═══ */
function Listings() {
  const ref = useRef<HTMLDivElement>(null)
  const vis = useVis(ref)
  const items = [
    { cat: 'Vente', title: 'T3 lumineux centre-ville', loc: 'Bayonne · Petit Bayonne', price: '245 000€', info: '68m² · 2 ch · DPE C', src: 'SeLoger', pro: false },
    { cat: 'Location', title: 'T2 meublé standing', loc: 'Anglet · Chambre d\'Amour', price: '890€/mois', info: '45m² · 1 ch · Parking', src: 'LeBonCoin', pro: false },
    { cat: 'Vente', title: 'Villa T5 piscine', loc: 'Biarritz · Côte des Basques', price: '895 000€', info: '165m² · 5 ch · Jardin 400m²', src: 'Howner', pro: true },
    { cat: 'Neuf', title: 'Programme Les Allées — 4 lots', loc: 'Bayonne · Quartier Saint-Esprit', price: 'Dès 195 000€', info: 'T2 au T4 · RT2020 · PTZ éligible', src: 'Howner', pro: true },
    { cat: 'Location', title: 'Maison T4 avec jardin', loc: 'Boucau · Boucau Haut', price: '1 350€/mois', info: '110m² · 3 ch · Garage', src: 'PAP', pro: false },
    { cat: 'Vente', title: 'T4 rénové vue Nive', loc: 'Bayonne · Grand Bayonne', price: '320 000€', info: '85m² · 3 ch · Terrasse', src: 'Bien\'ici', pro: false },
  ]
  const colors: Record<string, string> = { Vente: '#cfaf4b', Location: '#60a5fa', Neuf: '#a78bfa' }

  return (
    <div ref={ref} style={{ maxWidth: 540, width: '100%', margin: '0 auto', opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(18px)', transition: 'all .8s cubic-bezier(.16,1,.3,1)' }}>
      <div style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
        {['Tous les biens', 'Vente', 'Location', 'Neuf', 'Annonces Pro'].map((f, i) => (
          <button key={i} style={{ padding: '4px 10px', borderRadius: 6, background: i === 0 ? 'rgba(207,175,75,0.08)' : 'rgba(255,255,255,0.02)', border: i === 0 ? '1px solid rgba(207,175,75,0.2)' : '1px solid rgba(255,255,255,0.05)', fontFamily: 'var(--b)', fontSize: 9, fontWeight: i === 0 ? 700 : 500, color: i === 0 ? 'var(--a)' : 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>{f}</button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((l, i) => (
          <div key={i} style={{ padding: '11px 12px', background: l.pro ? 'rgba(207,175,75,0.02)' : 'rgba(255,255,255,0.012)', border: `1px solid ${l.pro ? 'rgba(207,175,75,0.08)' : 'rgba(255,255,255,0.04)'}`, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                <span style={{ padding: '1px 6px', borderRadius: 4, background: `${colors[l.cat]}10`, border: `1px solid ${colors[l.cat]}22`, fontSize: 8, fontWeight: 700, color: colors[l.cat], fontFamily: 'var(--b)', textTransform: 'uppercase' }}>{l.cat}</span>
                {l.pro && <span style={{ padding: '1px 5px', borderRadius: 3, background: 'rgba(207,175,75,0.06)', fontSize: 7, fontWeight: 700, color: 'var(--a)', fontFamily: 'var(--b)' }}>HOWNER PRO</span>}
                <span style={{ fontFamily: 'var(--b)', fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>via {l.src}</span>
              </div>
              <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 1 }}>{l.title}</div>
              <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{l.loc}</div>
              <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,0.22)', marginTop: 2 }}>{l.info}</div>
            </div>
            <div style={{ fontFamily: 'var(--m)', fontSize: 14, color: 'var(--a)', flexShrink: 0 }}>{l.price}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 8, fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,0.18)' }}>Annonces agrégées de 6 portails + annonces natives Howner Pro</div>
    </div>
  )
}

/* ═══ MATCH DEMO ═══ */
interface Profile {
  type: string
  c: string
  name: string
  sub: string
  price: string | null
  tags: string[]
}

function MatchCardComponent({ p, onSwipe }: { p: Profile; onSwipe: (d: 'l' | 'r') => void }) {
  const [sx, setSx] = useState<number | null>(null)
  const [ox, setOx] = useState(0)
  const [sw, setSw] = useState<'l' | 'r' | null>(null)

  const end = () => {
    if (Math.abs(ox) > 80) {
      const dir = ox > 0 ? 'r' : 'l'
      setSw(dir as 'l' | 'r')
      setTimeout(() => {
        onSwipe(dir as 'l' | 'r')
        setSw(null)
        setOx(0)
      }, 280)
    } else {
      setOx(0)
    }
    setSx(null)
  }

  const tx = sw === 'r' ? 400 : sw === 'l' ? -400 : ox

  return (
    <div
      onMouseDown={(e) => setSx(e.clientX)}
      onMouseMove={(e) => { if (sx !== null) setOx(e.clientX - sx) }}
      onMouseUp={end}
      onMouseLeave={() => { if (sx !== null) end() }}
      onTouchStart={(e) => setSx(e.touches[0].clientX)}
      onTouchMove={(e) => { if (sx !== null) setOx(e.touches[0].clientX - sx) }}
      onTouchEnd={end}
      style={{ position: 'absolute', width: '100%', transform: `translateX(${tx}px) rotate(${ox * 0.06}deg)`, opacity: sw ? 0 : 1, transition: sw ? 'all .28s' : ox === 0 ? 'all .28s' : 'none', cursor: 'grab', userSelect: 'none' }}
    >
      <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 16px', position: 'relative' }}>
        {ox > 35 && (
          <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(52,211,153,.15)', border: '2px solid #34d399', borderRadius: 7, padding: '2px 12px', fontFamily: 'var(--b)', fontWeight: 800, fontSize: 13, color: '#34d399', transform: 'rotate(-10deg)' }}>MATCH ✓</div>
        )}
        {ox < -35 && (
          <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(239,68,68,.12)', border: '2px solid #ef4444', borderRadius: 7, padding: '2px 12px', fontFamily: 'var(--b)', fontWeight: 800, fontSize: 13, color: '#ef4444', transform: 'rotate(10deg)' }}>PASSER</div>
        )}
        <div style={{ display: 'inline-block', padding: '2px 7px', borderRadius: 4, background: `${p.c}12`, border: `1px solid ${p.c}25`, fontSize: 8, fontWeight: 700, color: p.c, fontFamily: 'var(--b)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{p.type}</div>
        <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 1 }}>{p.name}</div>
        <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>{p.sub}</div>
        {p.price && <div style={{ fontFamily: 'var(--m)', fontSize: 18, color: 'var(--a)', marginBottom: 6 }}>{p.price}</div>}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {p.tags.map((t, i) => (
            <span key={i} style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--b)' }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function MatchDemo() {
  const ps: Profile[] = [
    { type: 'Vendeur', c: '#cfaf4b', name: 'Villa T4 vue mer', sub: 'Biarritz · Particulier', price: '785 000€', tags: ['142m²', '4 ch', 'Jardin', 'Vue mer'] },
    { type: 'Promoteur', c: '#a78bfa', name: 'Programme Les Allées', sub: 'Bayonne · 4 lots dispo', price: 'Dès 195K€', tags: ['T2→T4', 'RT2020', 'PTZ'] },
    { type: 'Artisan ⭐4.9', c: '#34d399', name: 'Menuiserie Ospital', sub: 'Anglet · Super Pro', price: null, tags: ['Cuisines', 'Agencement', 'Décennale'] },
    { type: 'Locataire', c: '#60a5fa', name: 'Couple + enfant', sub: 'Cherche T3 · Bayonne · 900-1200€', price: null, tags: ['Parking', 'École', 'Dispo'] },
    { type: 'Courtier ⭐4.6', c: '#f472b6', name: 'Cabinet Duval', sub: 'Pays Basque · 203 avis', price: null, tags: ['Taux 3.2%', 'PTZ', 'Dossier 48h'] },
  ]
  const [i, setI] = useState(0)
  const [m, setM] = useState(false)
  const [mn, setMn] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const vis = useVis(ref)

  const sw = (d: 'l' | 'r') => {
    if (d === 'r') {
      setMn(ps[i].name)
      setM(true)
      setTimeout(() => {
        setM(false)
        setI((j) => (j + 1) % ps.length)
      }, 1400)
    } else {
      setI((j) => (j + 1) % ps.length)
    }
  }

  return (
    <div ref={ref} style={{ maxWidth: 360, width: '100%', margin: '0 auto', opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(18px)', transition: 'all .8s cubic-bezier(.16,1,.3,1)' }}>
      {m && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(10px)', animation: 'fadeIn .3s' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 8 }}>🎉</div>
            <div style={{ fontFamily: 'var(--d)', fontSize: 26, fontWeight: 700, background: 'linear-gradient(135deg, var(--a), #f5e6a3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>It&apos;s a Match !</div>
            <div style={{ fontFamily: 'var(--b)', fontSize: 13, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>{mn}</div>
          </div>
        </div>
      )}
      <div style={{ position: 'relative', height: 200, marginBottom: 12 }}>
        <div style={{ position: 'absolute', width: '93%', left: '3.5%', top: 10, height: 185, background: 'rgba(255,255,255,.008)', border: '1px solid rgba(255,255,255,.03)', borderRadius: 13 }} />
        <MatchCardComponent p={ps[i]} onSwipe={sw} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
        <button onClick={() => sw('l')} style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(239,68,68,.06)', border: '1.5px solid rgba(239,68,68,.16)', color: '#ef4444', fontSize: 17, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✗</button>
        <button onClick={() => sw('r')} style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(52,211,153,.06)', border: '1.5px solid rgba(52,211,153,.16)', color: '#34d399', fontSize: 17, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>♥</button>
      </div>
    </div>
  )
}

/* ═══ AI SKILLS ═══ */
function AISkills() {
  const ref = useRef<HTMLDivElement>(null)
  const vis = useVis(ref)
  const skills = [
    { icon: '🔍', title: 'Recherche de biens IA', desc: "L'IA analyse tes critères et te trouve les meilleures opportunités sur tout le marché — vente et location.", tag: '1 crédit' },
    { icon: '🔨', title: 'Recherche artisan IA', desc: 'Trouve le bon artisan pour ton projet : plombier, électricien, maçon, menuisier. Noté et vérifié.', tag: '1 crédit' },
    { icon: '💰', title: 'Dossier bancaire IA', desc: "L'IA monte ton dossier de financement complet, prêt à envoyer à ta banque ou ton courtier.", tag: '1 crédit' },
    { icon: '📄', title: 'Analyse de devis', desc: "Upload un devis artisan, l'IA compare chaque ligne aux prix du marché et détecte les surcharges.", tag: '1 crédit' },
    { icon: '📊', title: 'Analyse de bien', desc: 'Estimation DVF, analyse quartier, rentabilité locative, potentiel plus-value. Rapport complet.', tag: '1 crédit' },
    { icon: '🏘️', title: 'Recherche location IA', desc: "L'IA scanne tout le marché locatif et te sélectionne les meilleurs biens selon tes critères.", tag: '1 crédit' },
  ]

  return (
    <div ref={ref} style={{ maxWidth: 600, width: '100%', margin: '0 auto', opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(18px)', transition: 'all .8s cubic-bezier(.16,1,.3,1)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {skills.map((s, i) => (
          <div key={i} style={{ flex: '1 1 170px', maxWidth: 190, padding: '14px 12px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <span style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(207,175,75,0.08)', border: '1px solid rgba(207,175,75,0.15)', fontFamily: 'var(--b)', fontSize: 8, fontWeight: 700, color: 'var(--a)' }}>{s.tag}</span>
            </div>
            <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 11, color: '#fff', marginBottom: 3 }}>{s.title}</div>
            <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{s.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 12, fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
        1 crédit offert à l&apos;inscription pour tester · Chaque crédit inclut 1 ticket bonus jeu concours
      </div>
    </div>
  )
}

/* ═══ PRICING ═══ */
interface PCardProps {
  title: string
  sub: string
  price: string
  period?: string
  hl?: boolean
  features: string[]
  idx: number
  badge?: string
  note?: string
}

function PCard({ title, sub, price, period, hl, features, idx, badge, note }: PCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const vis = useVis(ref)
  const [h, setH] = useState(false)

  return (
    <div
      ref={ref}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: hl ? 'linear-gradient(160deg, rgba(207,175,75,.08), rgba(10,14,26,.95))' : 'rgba(255,255,255,.012)',
        border: hl ? '1px solid rgba(207,175,75,.3)' : '1px solid rgba(255,255,255,.05)',
        borderRadius: 13, padding: '22px 16px',
        display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
        transform: vis ? (h ? 'translateY(-3px)' : 'none') : 'translateY(18px)',
        opacity: vis ? 1 : 0, transition: `all .5s cubic-bezier(.16,1,.3,1) ${idx * 0.06}s`,
        flex: '1 1 165px', maxWidth: 210, minWidth: 150,
      }}
    >
      {badge && (
        <div style={{ position: 'absolute', top: 8, right: -22, background: 'var(--a)', color: '#0a0e1a', fontSize: 7, fontWeight: 800, letterSpacing: 1.5, padding: '1.5px 28px', transform: 'rotate(45deg)', fontFamily: 'var(--b)' }}>{badge}</div>
      )}
      <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: hl ? 'var(--a)' : 'rgba(255,255,255,.25)', fontFamily: 'var(--b)', fontWeight: 600, marginBottom: 6 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        <span style={{ fontFamily: 'var(--m)', fontSize: 30, color: '#fff', lineHeight: 1 }}>{price}</span>
        {period && <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', fontFamily: 'var(--b)' }}>{period}</span>}
      </div>
      {note && <div style={{ fontSize: 9, color: '#34d399', fontFamily: 'var(--b)', fontWeight: 600, marginTop: 2 }}>{note}</div>}
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.28)', fontFamily: 'var(--b)', marginTop: 2, marginBottom: 12, lineHeight: 1.3 }}>{sub}</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 5, fontSize: 10, color: 'rgba(255,255,255,.48)', fontFamily: 'var(--b)' }}>
            <span style={{ color: 'var(--a)', fontSize: 7, marginTop: 3 }}>◆</span>
            <span>{f}</span>
          </div>
        ))}
      </div>
      <button style={{ width: '100%', padding: '9px 0', background: hl ? 'linear-gradient(135deg, var(--a), #b8932e)' : 'rgba(255,255,255,.03)', border: hl ? 'none' : '1px solid rgba(255,255,255,.06)', borderRadius: 8, color: hl ? '#0a0e1a' : 'rgba(255,255,255,.6)', fontFamily: 'var(--b)', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
        {price === '0€' ? 'Commencer' : 'Choisir'}
      </button>
    </div>
  )
}

/* ═══ REFERRAL ═══ */
function Referral() {
  const [c, setC] = useState(false)

  return (
    <div style={{ background: 'rgba(207,175,75,.04)', border: '1px solid rgba(207,175,75,.1)', borderRadius: 12, padding: '16px 14px', maxWidth: 360, width: '100%', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 2 }}>🎁 Invite un ami = 1 ticket chacun</div>
      <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.3)', marginBottom: 10 }}>Gratuit pour tout le monde</div>
      <div style={{ display: 'flex', gap: 5 }}>
        <div style={{ flex: 1, padding: '7px 8px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 6, fontFamily: 'var(--m)', fontSize: 9, color: 'rgba(255,255,255,.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>howner.fr/r/albert7x9k</div>
        <button
          onClick={() => {
            navigator.clipboard.writeText('https://howner.fr/r/albert7x9k').catch(() => {})
            setC(true)
            setTimeout(() => setC(false), 2e3)
          }}
          style={{ padding: '7px 12px', background: c ? 'rgba(52,211,153,.12)' : 'linear-gradient(135deg, var(--a), #b8932e)', border: c ? '1px solid rgba(52,211,153,.2)' : 'none', borderRadius: 6, color: c ? '#34d399' : '#0a0e1a', fontFamily: 'var(--b)', fontWeight: 700, fontSize: 9, cursor: 'pointer' }}
        >
          {c ? '✓' : 'Copier'}
        </button>
      </div>
    </div>
  )
}

/* ═══ COUNTER ═══ */
function Ct({ end, label, suffix = '' }: { end: number; label: string; suffix?: string }) {
  const [v, setV] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const vis = useVis(ref)

  useEffect(() => {
    if (!vis) return
    const t0 = Date.now()
    const go = () => {
      const p = Math.min(1, (Date.now() - t0) / 1800)
      setV(Math.floor((1 - Math.pow(1 - p, 4)) * end))
      if (p < 1) requestAnimationFrame(go)
    }
    go()
  }, [vis, end])

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--m)', fontSize: 22, color: 'var(--a)' }}>{v.toLocaleString()}{suffix}</div>
      <div style={{ fontFamily: 'var(--b)', fontSize: 8, color: 'rgba(255,255,255,.2)', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 3 }}>{label}</div>
    </div>
  )
}

/* ═══ FAQ ITEM ═══ */
function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const vis = useVis(ref)

  return (
    <div ref={ref} style={{ marginBottom: 8, padding: '13px 14px', background: 'rgba(255,255,255,.012)', border: '1px solid rgba(255,255,255,.04)', borderRadius: 10, opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(8px)', transition: `all .4s ease ${index * 0.04}s` }}>
      <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 12, color: '#fff', marginBottom: 3 }}>{q}</div>
      <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.35)', lineHeight: 1.55 }}>{a}</div>
    </div>
  )
}

/* ═══ MAIN ═══ */
export default function Howner() {
  const [pro, setPro] = useState(false)
  const [ph, setPh] = useState('')

  const [sY, setSY] = useState(0)

  useEffect(() => {
    const h = () => setSY(window.scrollY)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const faqs = [
    { q: "C'est quoi Howner ?", a: "Une plateforme qui réunit toutes les annonces immobilières du marché (vente et location), un système de matching entre utilisateurs, et des outils IA pour chercher des biens, analyser des devis, trouver des artisans et monter des dossiers bancaires." },
    { q: "C'est quoi le jeu concours ?", a: "En t'inscrivant tu reçois 1 ticket + 1 crédit IA offerts. Chaque crédit acheté te donne un ticket bonus. À 200 000 tickets, tirage en direct avec huissier de justice. Le gagnant repart avec la villa. Et on relance un nouveau cycle." },
    { q: 'Les annonces sont gratuites ?', a: "Oui. Tu consultes toutes les annonces du marché gratuitement — agrégées depuis LeBonCoin, SeLoger, PAP et les pros inscrits sur Howner." },
    { q: "C'est quoi un crédit IA ?", a: "Un service réalisé par l'IA : recherche de biens personnalisée, recherche d'artisans, analyse de devis, dossier bancaire, analyse de bien, recherche de location. 1 crédit offert à l'inscription, ensuite à partir de 9€." },
    { q: 'Je suis pro, pourquoi venir ?', a: "Annonces illimitées de 0 à 169€/mois sans engagement (vs 200-600€ avec contrat 12 mois chez SeLoger/LeBonCoin). Matching avec des acheteurs et locataires. Données de demande en temps réel." },
    { q: "C'est légal ?", a: "Oui. Jeu concours conforme à la Directive Européenne 2005/29/CE. Validé par notre cabinet d'avocats partenaire. Tirage sous contrôle d'huissier de justice." },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#fff', overflowX: 'hidden' }}>
      {/* Ticker */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: 'var(--a)', padding: '4px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 44, whiteSpace: 'nowrap', animation: 'slide 38s linear infinite', fontFamily: 'var(--b)', fontSize: 10, fontWeight: 700, color: '#0a0e1a', letterSpacing: 0.8, textTransform: 'uppercase' }}>
          {[...Array(3)].map((_, i) => (
            <span key={i} style={{ display: 'flex', gap: 44 }}>
              <span>🎁 Jeu concours gratuit — Villa 695 000€ au Pays Basque</span>
              <span>🎟️ 1 ticket + 1 crédit IA offerts à l&apos;inscription</span>
              <span>🏢 Pros : annonces illimitées sans engagement</span>
              <span>⚡ Tirage dès 200 000 tickets</span>
            </span>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 22, left: 0, right: 0, zIndex: 100, padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: sY > 60 ? 'rgba(10,14,26,.92)' : 'transparent', backdropFilter: sY > 60 ? 'blur(14px)' : 'none', transition: 'all .4s' }}>
        <span style={{ fontFamily: 'var(--m)', fontWeight: 700, fontSize: 15, color: 'var(--a)' }}>HOWNER</span>
        <Gauge mini />
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '110px 18px 50px', position: 'relative' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(207,175,75,.04) 0%, transparent 65%)', top: '40%', left: '50%', transform: `translate(-50%,-50%) translateY(${sY * 0.05}px)`, pointerEvents: 'none' }} />
        <div style={{ animation: 'fadeIn .8s cubic-bezier(.16,1,.3,1)', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(207,175,75,.06)', border: '1px solid rgba(207,175,75,.12)', borderRadius: 100, padding: '3px 12px', marginBottom: 22 }}>
            <span style={{ fontSize: 8, letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--a)', fontFamily: 'var(--b)', fontWeight: 700 }}>🎁 Jeu concours gratuit · 1 crédit IA offert · 1 ticket offert</span>
          </div>
          <h1 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(32px, 5.5vw, 62px)', fontWeight: 800, lineHeight: 1, maxWidth: 620, marginBottom: 12 }}>
            <span style={{ color: 'rgba(255,255,255,.92)' }}>Cherche. Trouve.</span><br />
            <span style={{ background: 'linear-gradient(135deg, var(--a), #f5e6a3, var(--a))', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 5s linear infinite' }}>Gagne ta maison.</span>
          </h1>
          <p style={{ fontFamily: 'var(--b)', fontSize: 'clamp(12px, 1.4vw, 15px)', color: 'rgba(255,255,255,.38)', maxWidth: 460, lineHeight: 1.6, marginBottom: 22 }}>
            Tous les biens du marché réunis. Matching entre particuliers et pros.
            L&apos;IA cherche, analyse et monte tes dossiers. Et chaque crédit te donne un ticket pour le jeu concours — une villa à 695 000€ au Pays Basque.
          </p>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
            <button onClick={() => setPro(false)} style={{ padding: '8px 14px', background: !pro ? 'rgba(207,175,75,.1)' : 'rgba(255,255,255,.02)', border: !pro ? '1px solid rgba(207,175,75,.3)' : '1px solid rgba(255,255,255,.06)', borderRadius: 8, color: !pro ? 'var(--a)' : 'rgba(255,255,255,.4)', fontFamily: 'var(--b)', fontWeight: !pro ? 700 : 500, fontSize: 11, cursor: 'pointer' }}>👤 Particulier</button>
            <button onClick={() => setPro(true)} style={{ padding: '8px 14px', background: pro ? 'rgba(207,175,75,.1)' : 'rgba(255,255,255,.02)', border: pro ? '1px solid rgba(207,175,75,.3)' : '1px solid rgba(255,255,255,.06)', borderRadius: 8, color: pro ? 'var(--a)' : 'rgba(255,255,255,.4)', fontFamily: 'var(--b)', fontWeight: pro ? 700 : 500, fontSize: 11, cursor: 'pointer' }}>🏢 Pro</button>
          </div>
          {/* Villa */}
          <div style={{ background: 'rgba(207,175,75,.05)', border: '1px solid rgba(207,175,75,.12)', borderRadius: 10, padding: '10px 18px', marginBottom: 24, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--m)', fontSize: 22, color: 'var(--a)' }}>695 000€</div>
            <div style={{ fontFamily: 'var(--b)', fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.22)', marginTop: 1 }}>Villa Boucau · 149m² · 4 chambres · Pays Basque</div>
          </div>
          {/* CTA */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 28 }}>
            <input type="tel" placeholder={pro ? 'Numéro pro' : 'Ton numéro'} value={ph} onChange={(e) => setPh(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && ph) window.location.href = `/login?phone=${encodeURIComponent(ph)}${pro ? '&type=pro' : ''}` }} style={{ padding: '11px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 9, color: '#fff', fontFamily: 'var(--b)', fontSize: 13, width: 175, outline: 'none' }} />
            <button onClick={() => { if (ph) window.location.href = `/login?phone=${encodeURIComponent(ph)}${pro ? '&type=pro' : ''}` }} style={{ padding: '11px 20px', background: 'linear-gradient(135deg, var(--a), #b8932e)', border: 'none', borderRadius: 9, color: '#0a0e1a', fontFamily: 'var(--b)', fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: '0 3px 14px rgba(207,175,75,.25)' }}>
              {pro ? '🏢 Créer mon profil pro' : '🎁 1 ticket + 1 crédit offerts'}
            </button>
          </div>
          <Gauge />
          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['📢 Toutes les annonces', '💞 Matching', '🤖 1 crédit IA offert', '🎁 1 ticket offert', '⚖️ Huissier de justice'].map((t, i) => (
              <span key={i} style={{ fontSize: 8, color: 'rgba(255,255,255,.16)', fontFamily: 'var(--b)' }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '30px 18px', borderTop: '1px solid rgba(255,255,255,.03)', borderBottom: '1px solid rgba(255,255,255,.03)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 14 }}>
          <Ct end={847000} label="Biens référencés" suffix="+" />
          <Ct end={4283} label="Tickets distribués" />
          <Ct end={312} label="Matchs réalisés" />
          <Ct end={47} label="Pros inscrits" />
        </div>
      </section>

      {/* ═══ BROWSE ═══ */}
      <section style={{ padding: '60px 18px', maxWidth: 640, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(20px, 3.2vw, 28px)', fontWeight: 800, color: '#fff', marginBottom: 4 }}>Tous les biens du marché. Un seul endroit.</h2>
          <p style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.28)' }}>LeBonCoin, SeLoger, PAP, Bien&apos;ici, notaires + annonces natives des pros Howner. Vente et location.</p>
        </div>
        <Listings />
      </section>

      {/* ═══ MATCHING ═══ */}
      <section style={{ padding: '50px 18px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, color: '#fff', marginBottom: 4 }}>Matching entre utilisateurs Howner</h2>
          <p style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.28)' }}>Swipe pour connecter avec des vendeurs, acheteurs, locataires, artisans, promoteurs et courtiers inscrits sur Howner.</p>
          <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginTop: 10 }}>
            {['👤↔👤 Particulier', '👤↔🏢 Pro', '🏢↔🏢 Pro'].map((t, i) => (
              <span key={i} style={{ padding: '3px 8px', borderRadius: 5, background: 'rgba(207,175,75,.04)', border: '1px solid rgba(207,175,75,.1)', fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.35)' }}>{t}</span>
            ))}
          </div>
        </div>
        <MatchDemo />
      </section>

      {/* ═══ AI SKILLS ═══ */}
      <section style={{ padding: '50px 18px', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, color: '#fff', marginBottom: 4 }}>L&apos;IA travaille pour toi. 1 crédit offert.</h2>
          <p style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.28)' }}>Chaque crédit = 1 service IA + 1 ticket bonus pour le jeu concours. Teste gratuitement avec ton crédit offert.</p>
        </div>
        <AISkills />
      </section>

      {/* ═══ PRICING ═══ */}
      <section style={{ padding: '50px 18px', maxWidth: 1050, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 14 }}>
          <button onClick={() => setPro(false)} style={{ padding: '7px 14px', background: !pro ? 'rgba(207,175,75,.1)' : 'rgba(255,255,255,.02)', border: !pro ? '1px solid rgba(207,175,75,.3)' : '1px solid rgba(255,255,255,.05)', borderRadius: 7, color: !pro ? 'var(--a)' : 'rgba(255,255,255,.35)', fontFamily: 'var(--b)', fontWeight: !pro ? 700 : 500, fontSize: 10, cursor: 'pointer' }}>👤 Particulier</button>
          <button onClick={() => setPro(true)} style={{ padding: '7px 14px', background: pro ? 'rgba(207,175,75,.1)' : 'rgba(255,255,255,.02)', border: pro ? '1px solid rgba(207,175,75,.3)' : '1px solid rgba(255,255,255,.05)', borderRadius: 7, color: pro ? 'var(--a)' : 'rgba(255,255,255,.35)', fontFamily: 'var(--b)', fontWeight: pro ? 700 : 500, fontSize: 10, cursor: 'pointer' }}>🏢 Pro</button>
        </div>
        {!pro ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(18px, 2.8vw, 26px)', fontWeight: 800, color: '#fff', marginBottom: 4 }}>Crédits IA · Chaque crédit = 1 service + 1 ticket</h2>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              <PCard idx={0} title="Offert" sub="1 crédit IA + 1 ticket jeu concours" price="0€" features={['Consultation annonces', 'Matching entre utilisateurs', '1 crédit IA pour tester', '1 ticket jeu concours', 'Parrainage = tickets gratuits']} />
              <PCard idx={1} title="1 crédit" sub="1 service IA + 1 ticket bonus" price="9€" features={['Recherche bien IA', 'OU recherche artisan IA', 'OU dossier bancaire IA', 'OU analyse de devis', 'OU analyse de bien', '1 ticket bonus']} />
              <PCard idx={2} hl badge="POPULAIRE" title="Pack 5" sub="5 crédits + 5 tickets bonus" price="39€" note="7,80€ / crédit" features={['5 services IA au choix', 'Alertes personnalisées', 'Résultats sauvegardés', '5 tickets bonus']} />
              <PCard idx={3} title="Pack 15" sub="15 crédits + 15 tickets bonus" price="99€" note="6,60€ / crédit" features={['15 services IA', 'Tout le Pack 5 inclus', 'Support prioritaire', '15 tickets bonus']} />
              <PCard idx={4} title="Pack 40" sub="40 crédits + 40 tickets bonus" price="199€" note="4,98€ · Le - cher" features={['40 services IA', 'Analyse quartier profonde', 'Dossier bancaire complet', '40 tickets bonus']} />
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(18px, 2.8vw, 26px)', fontWeight: 800, color: '#fff', marginBottom: 4 }}>Pros · Sans engagement · Résiliable en 1 clic</h2>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              <PCard idx={0} title="Pro Gratuit" sub="3 annonces · Matching · Avis" price="0€" features={['Profil pro vérifié', '3 annonces actives', 'Matching acheteurs/locataires', 'Avis clients', 'Données demande basiques']} />
              <PCard idx={1} title="Artisan" sub="Illimité · Leads · Notes" price="79€" period="/mois" note="Sans engagement" features={['Annonces illimitées', 'Leads qualifiés dans votre zone', 'Matching clients', 'Profil noté', 'Données demande temps réel']} />
              <PCard idx={2} hl badge="TOP" title="Agent Immo" sub="Illimité · Matching · Analytics" price="129€" period="/mois" note="Sans engagement" features={['Annonces vente + location illimitées', 'Matching acheteurs qualifiés', 'Scoring IA annonces', 'Dashboard analytics', 'Données demande temps réel']} />
              <PCard idx={3} title="Promoteur" sub="Écoulez votre stock" price="169€" period="/mois" badge="NEW" note="Sans engagement" features={['Tous vos lots listés', 'Matching acheteurs pré-qualifiés', 'Données demande par programme', 'Scoring prix vs marché', 'Visibilité prioritaire']} />
            </div>
          </>
        )}
      </section>

      {/* ═══ REFERRAL ═══ */}
      <section style={{ padding: '44px 18px' }}><Referral /></section>

      {/* ═══ VILLA ═══ */}
      <section style={{ padding: '40px 18px', textAlign: 'center' }}>
        <div style={{ maxWidth: 440, margin: '0 auto', background: 'linear-gradient(160deg, rgba(207,175,75,.04), rgba(10,14,26,.9))', border: '1px solid rgba(207,175,75,.08)', borderRadius: 14, padding: '28px 20px' }}>
          <div style={{ fontFamily: 'var(--m)', fontSize: 8, letterSpacing: 3, color: 'var(--a)', textTransform: 'uppercase', marginBottom: 6 }}>Lot du jeu concours</div>
          <h2 style={{ fontFamily: 'var(--d)', fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Villa Boucau</h2>
          <div style={{ display: 'flex', gap: 5, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
            {['149m²', '4 chambres', 'R+1', 'Boucau Haut', 'Pays Basque'].map((t, i) => (
              <span key={i} style={{ padding: '2px 7px', borderRadius: 100, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)', fontSize: 9, color: 'rgba(255,255,255,.35)', fontFamily: 'var(--b)' }}>{t}</span>
            ))}
          </div>
          <p style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.35)', lineHeight: 1.5, marginBottom: 14, maxWidth: 360, margin: '0 auto 14px' }}>Architecte intégré · Finitions Porcelanosa · Construction LSF · Clé en main · Livrée par Affinity Home</p>
          <div style={{ fontFamily: 'var(--m)', fontSize: 30, color: 'var(--a)', textShadow: '0 0 16px rgba(207,175,75,.12)' }}>695 000€</div>
          <div style={{ marginTop: 8, fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.16)' }}>Participation gratuite possible · Ticket offert à l&apos;inscription · Aucun achat requis</div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section style={{ padding: '40px 18px', maxWidth: 460, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--d)', fontSize: 22, fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: 18 }}>FAQ</h2>
        {faqs.map((faq, i) => (
          <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
        ))}
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{ padding: '36px 18px 60px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(20px, 3.5vw, 30px)', fontWeight: 800, color: '#fff', marginBottom: 5 }}>1 ticket offert. 1 crédit IA offert. Inscris-toi.</h2>
        <p style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.25)', marginBottom: 14 }}>Et une chance de gagner une villa à 695 000€ au Pays Basque.</p>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ padding: '12px 26px', background: 'linear-gradient(135deg, var(--a), #b8932e)', border: 'none', borderRadius: 10, color: '#0a0e1a', fontFamily: 'var(--b)', fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: '0 3px 14px rgba(207,175,75,.22)' }}>🎁 C&apos;est parti</button>
      </section>

      <footer style={{ padding: 18, borderTop: '1px solid rgba(255,255,255,.03)', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--m)', fontSize: 10, color: 'var(--a)', marginBottom: 4 }}>HOWNER</div>
        <div style={{ fontFamily: 'var(--b)', fontSize: 7, color: 'rgba(255,255,255,.1)', lineHeight: 1.8 }}>
          Affinity House Factory SAS · SIRET 982 581 506 00010 · Anglet, France
          <br />Jeu concours gratuit · Chaque crédit inclut un service IA réel · Directive EU 2005/29/CE
          <br />Cabinet d&apos;avocats partenaire · Tirage sous contrôle d&apos;huissier · Participation gratuite possible
          <br />Vérification d&apos;identité requise · Règlement complet sur demande
        </div>
      </footer>
    </div>
  )
}
