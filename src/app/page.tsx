'use client'

import { useState, useEffect, useRef, RefObject } from 'react'
import Link from 'next/link'

/* ═══ CONSTANTS ═══ */
const TOTAL = 200000
const INIT = 4283

/* ═══ HOOKS ═══ */
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

/* ═══ LIVE ACTIVITY TICKER ═══ */
const FAKE_ACTIVITIES = [
  { icon: '🎟️', text: 'Marie L. vient de s\'inscrire', sub: '+1 ticket', time: 'il y a 12s' },
  { icon: '🤖', text: 'Thomas D. a lancé une Recherche IA', sub: '+1 ticket bonus', time: 'il y a 34s' },
  { icon: '💳', text: 'Julie R. a acheté le Pack 5', sub: '+5 tickets', time: 'il y a 1min' },
  { icon: '🎁', text: 'Karim B. a parrainé un ami', sub: '+1 ticket chacun', time: 'il y a 2min' },
  { icon: '🔍', text: 'Sophie M. a analysé un bien', sub: '+1 ticket bonus', time: 'il y a 3min' },
  { icon: '💳', text: 'Pierre V. a acheté le Pack 15', sub: '+15 tickets', time: 'il y a 4min' },
  { icon: '🎟️', text: 'Léa C. vient de s\'inscrire', sub: '+1 ticket', time: 'il y a 5min' },
  { icon: '🔨', text: 'Marc F. a trouvé un artisan IA', sub: '+1 ticket bonus', time: 'il y a 6min' },
  { icon: '💰', text: 'Nadia K. a monté son dossier bancaire', sub: '+1 ticket bonus', time: 'il y a 7min' },
  { icon: '💳', text: 'Antoine G. a acheté le Pack 40', sub: '+40 tickets', time: 'il y a 8min' },
]

function LiveTicker() {
  const [current, setCurrent] = useState(0)
  const [show, setShow] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setShow(false)
      setTimeout(() => {
        setCurrent(i => (i + 1) % FAKE_ACTIVITIES.length)
        setShow(true)
      }, 400)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  const a = FAKE_ACTIVITIES[current]

  return (
    <div style={{ position: 'fixed', bottom: 20, left: 20, zIndex: 90, maxWidth: 300, opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(10px)', transition: 'all .4s cubic-bezier(.16,1,.3,1)' }}>
      <div style={{ background: 'rgba(10,14,26,.92)', backdropFilter: 'blur(20px)', border: '1px solid rgba(207,175,75,.12)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(0,0,0,.5)' }}>
        <span style={{ fontSize: 18 }}>{a.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: '#fff', fontWeight: 600, lineHeight: 1.3 }}>{a.text}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
            <span style={{ fontFamily: 'var(--b)', fontSize: 9, color: '#34d399', fontWeight: 700 }}>{a.sub}</span>
            <span style={{ fontFamily: 'var(--b)', fontSize: 8, color: 'rgba(255,255,255,.2)' }}>{a.time}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══ GAUGE ═══ */
function Gauge({ mini }: { mini?: boolean }) {
  const [n, setN] = useState(INIT)
  const ref = useRef<HTMLDivElement>(null)
  const vis = useVis(ref)

  useEffect(() => {
    const id = setInterval(
      () => setN(p => Math.min(TOTAL, p + Math.floor(Math.random() * 3) + 1)),
      5e3 + Math.random() * 5e3
    )
    return () => clearInterval(id)
  }, [])

  const pct = (n / TOTAL) * 100

  if (mini)
    return (
      <div ref={ref} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 70, height: 3, borderRadius: 10, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 10, background: 'var(--a)', width: `${pct}%`, transition: 'width 1s' }} />
        </div>
        <span style={{ fontFamily: 'var(--m)', fontSize: 8, color: 'var(--a)' }}>
          {n.toLocaleString()}/{TOTAL / 1000}K
        </span>
      </div>
    )

  return (
    <div ref={ref} style={{ maxWidth: 500, width: '100%', opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(10px)', transition: 'all .8s cubic-bezier(.16,1,.3,1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399', animation: 'pulse 2s infinite' }} />
          <span style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Tirage en cours</span>
        </div>
        <span style={{ fontFamily: 'var(--m)', fontSize: 12, color: 'var(--a)', fontWeight: 700 }}>
          {n.toLocaleString()} / {TOTAL.toLocaleString()}
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 10, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', position: 'relative' }}>
        <div style={{ height: '100%', borderRadius: 10, background: 'linear-gradient(90deg, var(--a), #f5e6a3)', width: vis ? `${pct}%` : '0%', transition: 'width 2.5s cubic-bezier(.16,1,.3,1)', boxShadow: '0 0 16px rgba(207,175,75,0.3)' }} />
      </div>
      <div style={{ marginTop: 6, textAlign: 'center', fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: 2, fontWeight: 600 }}>
        TIRAGE SOUS HUISSIER DE JUSTICE DES 200 000 TICKETS ATTEINTS
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
      <div style={{ fontFamily: 'var(--m)', fontSize: 26, color: 'var(--a)', fontWeight: 700 }}>{v.toLocaleString()}{suffix}</div>
      <div style={{ fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.25)', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 3, fontWeight: 600 }}>{label}</div>
    </div>
  )
}

/* ═══ STEP CARD ═══ */
function StepCard({ step, icon, title, desc, bonus, index }: { step: number; icon: string; title: string; desc: string; bonus: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const vis = useVis(ref)
  return (
    <div ref={ref} style={{ flex: '1 1 200px', maxWidth: 250, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: '20px 16px', position: 'relative', opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(16px)', transition: `all .6s cubic-bezier(.16,1,.3,1) ${index * 0.1}s` }}>
      <div style={{ position: 'absolute', top: -10, left: 16, width: 22, height: 22, borderRadius: '50%', background: 'var(--a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--m)', fontSize: 10, fontWeight: 700, color: '#0a0e1a' }}>{step}</div>
      <div style={{ fontSize: 28, marginBottom: 10, marginTop: 4 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 4 }}>{title}</div>
      <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.35)', lineHeight: 1.6, marginBottom: 8 }}>{desc}</div>
      <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, background: 'rgba(52,211,153,.08)', border: '1px solid rgba(52,211,153,.15)', fontFamily: 'var(--b)', fontSize: 10, fontWeight: 700, color: '#34d399' }}>{bonus}</div>
    </div>
  )
}

/* ═══ AI SERVICE CARD ═══ */
function AICard({ icon, title, desc, index }: { icon: string; title: string; desc: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const vis = useVis(ref)
  const [h, setH] = useState(false)
  return (
    <div
      ref={ref}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        flex: '1 1 170px', maxWidth: 200, padding: '18px 14px',
        background: h ? 'rgba(207,175,75,.04)' : 'rgba(255,255,255,.015)',
        border: h ? '1px solid rgba(207,175,75,.15)' : '1px solid rgba(255,255,255,.05)',
        borderRadius: 12, cursor: 'pointer',
        opacity: vis ? 1 : 0, transform: vis ? (h ? 'translateY(-2px)' : 'none') : 'translateY(16px)',
        transition: `all .5s cubic-bezier(.16,1,.3,1) ${index * 0.06}s`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <span style={{ padding: '2px 8px', borderRadius: 5, background: 'rgba(207,175,75,.08)', border: '1px solid rgba(207,175,75,.15)', fontFamily: 'var(--m)', fontSize: 8, fontWeight: 700, color: 'var(--a)' }}>1 cr</span>
      </div>
      <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 12, color: '#fff', marginBottom: 4 }}>{title}</div>
      <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.35)', lineHeight: 1.5 }}>{desc}</div>
      <div style={{ marginTop: 8, fontFamily: 'var(--b)', fontSize: 9, color: '#34d399', fontWeight: 600 }}>+1 ticket bonus</div>
    </div>
  )
}

/* ═══ LISTING PREVIEW ═══ */
function ListingPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const vis = useVis(ref)
  const items = [
    { cat: 'Vente', title: 'T3 lumineux centre-ville', loc: 'Bayonne · Petit Bayonne', price: '245 000€', info: '68m² · 2 ch · DPE C', src: 'SeLoger', pro: false },
    { cat: 'Vente', title: 'Villa T5 piscine', loc: 'Biarritz · Côte des Basques', price: '895 000€', info: '165m² · 5 ch · Jardin 400m²', src: 'Howner', pro: true },
    { cat: 'Location', title: 'T2 meublé standing', loc: 'Anglet · Chambre d\'Amour', price: '890€/mois', info: '45m² · 1 ch · Parking', src: 'LeBonCoin', pro: false },
    { cat: 'Neuf', title: 'Programme Les Allées', loc: 'Bayonne · Saint-Esprit', price: 'Dès 195K€', info: 'T2→T4 · RT2020 · PTZ', src: 'Howner', pro: true },
  ]
  const colors: Record<string, string> = { Vente: '#cfaf4b', Location: '#60a5fa', Neuf: '#a78bfa' }

  return (
    <div ref={ref} style={{ maxWidth: 520, width: '100%', margin: '0 auto', opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(18px)', transition: 'all .8s cubic-bezier(.16,1,.3,1)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((l, i) => (
          <div key={i} style={{ padding: '12px 14px', background: l.pro ? 'rgba(207,175,75,0.03)' : 'rgba(255,255,255,0.015)', border: `1px solid ${l.pro ? 'rgba(207,175,75,0.1)' : 'rgba(255,255,255,0.05)'}`, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <span style={{ padding: '2px 7px', borderRadius: 4, background: `${colors[l.cat]}12`, border: `1px solid ${colors[l.cat]}25`, fontSize: 8, fontWeight: 700, color: colors[l.cat], fontFamily: 'var(--b)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{l.cat}</span>
                {l.pro && <span style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(207,175,75,0.08)', fontSize: 7, fontWeight: 700, color: 'var(--a)', fontFamily: 'var(--b)', letterSpacing: 0.5 }}>PRO</span>}
                <span style={{ fontFamily: 'var(--b)', fontSize: 8, color: 'rgba(255,255,255,0.18)' }}>via {l.src}</span>
              </div>
              <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 2 }}>{l.title}</div>
              <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{l.loc}</div>
              <div style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,0.22)', marginTop: 2 }}>{l.info}</div>
            </div>
            <div style={{ fontFamily: 'var(--m)', fontSize: 14, color: 'var(--a)', fontWeight: 700, flexShrink: 0 }}>{l.price}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 10 }}>
        <Link href="/browse" style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'var(--a)', textDecoration: 'none', fontWeight: 600 }}>
          Voir toutes les annonces →
        </Link>
      </div>
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

function MatchDemo() {
  const ps: Profile[] = [
    { type: 'Vendeur', c: '#cfaf4b', name: 'Villa T4 vue mer', sub: 'Biarritz · Particulier', price: '785 000€', tags: ['142m²', '4 ch', 'Jardin', 'Vue mer'] },
    { type: 'Promoteur', c: '#a78bfa', name: 'Programme Les Allées', sub: 'Bayonne · 4 lots dispo', price: 'Dès 195K€', tags: ['T2→T4', 'RT2020', 'PTZ'] },
    { type: 'Artisan ⭐4.9', c: '#34d399', name: 'Menuiserie Ospital', sub: 'Anglet · Super Pro', price: null, tags: ['Cuisines', 'Agencement', 'Décennale'] },
    { type: 'Locataire', c: '#60a5fa', name: 'Couple + enfant', sub: 'Cherche T3 · Bayonne · 900-1200€', price: null, tags: ['Parking', 'École', 'Dispo'] },
    { type: 'Courtier ⭐4.6', c: '#f472b6', name: 'Cabinet Duval', sub: 'Pays Basque · 203 avis', price: null, tags: ['Taux 3.2%', 'PTZ', 'Dossier 48h'] },
  ]

  const [i, setI] = useState(0)
  const [ox, setOx] = useState(0)
  const [sx, setSx] = useState<number | null>(null)
  const [sw, setSw] = useState<'l' | 'r' | null>(null)
  const [match, setMatch] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const vis = useVis(ref)

  const end = () => {
    if (Math.abs(ox) > 80) {
      const dir = ox > 0 ? 'r' : 'l'
      setSw(dir)
      if (dir === 'r') {
        setMatch(true)
        setTimeout(() => setMatch(false), 1400)
      }
      setTimeout(() => {
        setSw(null)
        setOx(0)
        setI(j => (j + 1) % ps.length)
      }, 280)
    } else {
      setOx(0)
    }
    setSx(null)
  }

  const p = ps[i]
  const tx = sw === 'r' ? 400 : sw === 'l' ? -400 : ox

  return (
    <div ref={ref} style={{ maxWidth: 340, width: '100%', margin: '0 auto', opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(18px)', transition: 'all .8s cubic-bezier(.16,1,.3,1)' }}>
      {match && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(10px)', animation: 'fadeIn .3s' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 8 }}>🎉</div>
            <div style={{ fontFamily: 'var(--d)', fontSize: 26, fontWeight: 700, background: 'linear-gradient(135deg, var(--a), #f5e6a3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>It&apos;s a Match !</div>
            <div style={{ fontFamily: 'var(--b)', fontSize: 13, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>{p.name}</div>
          </div>
        </div>
      )}
      <div style={{ position: 'relative', height: 190, marginBottom: 12 }}>
        <div style={{ position: 'absolute', width: '93%', left: '3.5%', top: 10, height: 175, background: 'rgba(255,255,255,.008)', border: '1px solid rgba(255,255,255,.03)', borderRadius: 13 }} />
        <div
          onMouseDown={e => setSx(e.clientX)}
          onMouseMove={e => { if (sx !== null) setOx(e.clientX - sx) }}
          onMouseUp={end}
          onMouseLeave={() => { if (sx !== null) end() }}
          onTouchStart={e => setSx(e.touches[0].clientX)}
          onTouchMove={e => { if (sx !== null) setOx(e.touches[0].clientX - sx) }}
          onTouchEnd={end}
          style={{ position: 'absolute', width: '100%', transform: `translateX(${tx}px) rotate(${ox * 0.06}deg)`, opacity: sw ? 0 : 1, transition: sw ? 'all .28s' : ox === 0 ? 'all .28s' : 'none', cursor: 'grab', userSelect: 'none' }}
        >
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 16px', position: 'relative' }}>
            {ox > 35 && <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(52,211,153,.15)', border: '2px solid #34d399', borderRadius: 7, padding: '2px 12px', fontFamily: 'var(--b)', fontWeight: 800, fontSize: 13, color: '#34d399', transform: 'rotate(-10deg)' }}>MATCH ✓</div>}
            {ox < -35 && <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(239,68,68,.12)', border: '2px solid #ef4444', borderRadius: 7, padding: '2px 12px', fontFamily: 'var(--b)', fontWeight: 800, fontSize: 13, color: '#ef4444', transform: 'rotate(10deg)' }}>PASSER</div>}
            <div style={{ display: 'inline-block', padding: '2px 7px', borderRadius: 4, background: `${p.c}12`, border: `1px solid ${p.c}25`, fontSize: 8, fontWeight: 700, color: p.c, fontFamily: 'var(--b)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{p.type}</div>
            <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 1 }}>{p.name}</div>
            <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>{p.sub}</div>
            {p.price && <div style={{ fontFamily: 'var(--m)', fontSize: 18, color: 'var(--a)', marginBottom: 6 }}>{p.price}</div>}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {p.tags.map((t, j) => (
                <span key={j} style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--b)' }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
        <button onClick={() => { setSw('l'); setTimeout(() => { setSw(null); setI(j => (j + 1) % ps.length) }, 280) }} style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(239,68,68,.06)', border: '1.5px solid rgba(239,68,68,.16)', color: '#ef4444', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✗</button>
        <button onClick={() => { setSw('r'); setMatch(true); setTimeout(() => setMatch(false), 1400); setTimeout(() => { setSw(null); setI(j => (j + 1) % ps.length) }, 280) }} style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(52,211,153,.06)', border: '1.5px solid rgba(52,211,153,.16)', color: '#34d399', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>♥</button>
      </div>
    </div>
  )
}

/* ═══ PRICING CARD ═══ */
function PCard({ title, sub, price, period, hl, features, idx, badge, note }: {
  title: string; sub: string; price: string; period?: string; hl?: boolean; features: string[]; idx: number; badge?: string; note?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const vis = useVis(ref)
  const [h, setH] = useState(false)

  return (
    <div
      ref={ref}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: hl ? 'linear-gradient(160deg, rgba(207,175,75,.08), rgba(10,14,26,.95))' : 'rgba(255,255,255,.015)',
        border: hl ? '1px solid rgba(207,175,75,.3)' : '1px solid rgba(255,255,255,.05)',
        borderRadius: 14, padding: '24px 18px',
        display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
        transform: vis ? (h ? 'translateY(-4px)' : 'none') : 'translateY(18px)',
        opacity: vis ? 1 : 0, transition: `all .5s cubic-bezier(.16,1,.3,1) ${idx * 0.06}s`,
        flex: '1 1 165px', maxWidth: 210, minWidth: 150,
        boxShadow: hl ? '0 8px 32px rgba(207,175,75,.08)' : 'none',
      }}
    >
      {badge && (
        <div style={{ position: 'absolute', top: 8, right: -22, background: 'var(--a)', color: '#0a0e1a', fontSize: 7, fontWeight: 800, letterSpacing: 1.5, padding: '2px 28px', transform: 'rotate(45deg)', fontFamily: 'var(--b)' }}>{badge}</div>
      )}
      <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: hl ? 'var(--a)' : 'rgba(255,255,255,.3)', fontFamily: 'var(--b)', fontWeight: 700, marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        <span style={{ fontFamily: 'var(--m)', fontSize: 32, color: '#fff', lineHeight: 1, fontWeight: 700 }}>{price}</span>
        {period && <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', fontFamily: 'var(--b)' }}>{period}</span>}
      </div>
      {note && <div style={{ fontSize: 10, color: '#34d399', fontFamily: 'var(--b)', fontWeight: 700, marginTop: 3 }}>{note}</div>}
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: 'var(--b)', marginTop: 2, marginBottom: 14, lineHeight: 1.4 }}>{sub}</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 10, color: 'rgba(255,255,255,.5)', fontFamily: 'var(--b)' }}>
            <span style={{ color: 'var(--a)', fontSize: 7, marginTop: 3 }}>◆</span>
            <span>{f}</span>
          </div>
        ))}
      </div>
      <Link href="/login" style={{
        width: '100%', padding: '10px 0', textAlign: 'center', display: 'block', textDecoration: 'none',
        background: hl ? 'linear-gradient(135deg, var(--a), #b8932e)' : 'rgba(255,255,255,.04)',
        border: hl ? 'none' : '1px solid rgba(255,255,255,.08)', borderRadius: 8,
        color: hl ? '#0a0e1a' : 'rgba(255,255,255,.6)', fontFamily: 'var(--b)', fontWeight: 700, fontSize: 11,
      }}>
        {price === '0€' ? 'Commencer' : 'Choisir'}
      </Link>
    </div>
  )
}

/* ═══ FAQ ═══ */
function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const vis = useVis(ref)
  const [open, setOpen] = useState(false)

  return (
    <div ref={ref} onClick={() => setOpen(!open)} style={{ marginBottom: 6, padding: '14px 16px', background: open ? 'rgba(207,175,75,.03)' : 'rgba(255,255,255,.015)', border: open ? '1px solid rgba(207,175,75,.1)' : '1px solid rgba(255,255,255,.04)', borderRadius: 10, cursor: 'pointer', opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(8px)', transition: `all .4s ease ${index * 0.04}s` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 13, color: '#fff' }}>{q}</div>
        <span style={{ color: 'var(--a)', fontSize: 14, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
      </div>
      {open && (
        <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.4)', lineHeight: 1.6, marginTop: 8 }}>{a}</div>
      )}
    </div>
  )
}

/* ═══ TESTIMONIAL ═══ */
function Testimonials() {
  const ref = useRef<HTMLDivElement>(null)
  const vis = useVis(ref)
  const items = [
    { name: 'Marie L.', type: 'Particulier', text: "J'ai trouvé mon T3 à Bayonne en 2 jours grâce à la recherche IA. Le crédit offert m'a convaincu de tester, j'ai fini par prendre le Pack 5.", stars: 5 },
    { name: 'Thomas M.', type: 'Artisan', text: "3 leads qualifiés en 1 semaine. Mieux que LeBonCoin Pro pour 5x moins cher. Et mes clients peuvent vérifier mes avis.", stars: 5 },
    { name: 'Sophie R.', type: 'Particulier', text: "L'analyse de devis m'a fait économiser 3 200€ sur ma rénovation cuisine. L'IA a détecté 2 postes surfacturés que j'aurais jamais vus.", stars: 5 },
  ]

  return (
    <div ref={ref} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 700, margin: '0 auto', opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(18px)', transition: 'all .8s cubic-bezier(.16,1,.3,1)' }}>
      {items.map((t, i) => (
        <div key={i} style={{ flex: '1 1 200px', maxWidth: 220, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: '16px 14px' }}>
          <div style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'var(--a)', marginBottom: 6 }}>{'★'.repeat(t.stars)}</div>
          <div style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.45)', lineHeight: 1.6, marginBottom: 10 }}>&ldquo;{t.text}&rdquo;</div>
          <div style={{ fontFamily: 'var(--b)', fontWeight: 700, fontSize: 11, color: '#fff' }}>{t.name}</div>
          <div style={{ fontFamily: 'var(--b)', fontSize: 9, color: 'rgba(255,255,255,.25)' }}>{t.type}</div>
        </div>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════ */
/* ═══ MAIN PAGE ═══ */
/* ═══════════════════════════════════════════════ */
export default function Howner() {
  const [pro, setPro] = useState(false)
  const [sY, setSY] = useState(0)

  useEffect(() => {
    const h = () => setSY(window.scrollY)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const faqs = [
    { q: "C'est quoi Howner ?", a: "Une plateforme qui réunit toutes les annonces immobilières du marché, un système de matching entre utilisateurs, et des outils IA pour chercher des biens, analyser des devis, trouver des artisans et monter des dossiers bancaires." },
    { q: "C'est quoi le jeu concours ?", a: "En t'inscrivant tu reçois 1 ticket + 1 crédit IA offerts. Chaque crédit acheté te donne un ticket bonus. À 200 000 tickets, tirage en direct avec huissier de justice. Le gagnant repart avec la villa." },
    { q: "C'est quoi un crédit IA ?", a: "1 crédit = 1 service IA (recherche de biens, analyse de devis, dossier bancaire, etc.) + 1 ticket bonus pour le jeu concours. 1 crédit offert à l'inscription, ensuite à partir de 9€." },
    { q: 'Les annonces sont gratuites ?', a: "Oui. Toutes les annonces du marché sont consultables gratuitement — agrégées depuis LeBonCoin, SeLoger, PAP et les pros Howner." },
    { q: 'Je suis pro, pourquoi venir ?', a: "Annonces illimitées de 0 à 169€/mois sans engagement (vs 200-600€/mois avec contrat 12 mois chez SeLoger/LeBonCoin). Matching avec des acheteurs et locataires. Données de demande en temps réel." },
    { q: "C'est légal ?", a: "Oui. Jeu concours conforme à la Directive Européenne 2005/29/CE. Tirage sous contrôle d'huissier de justice. Participation gratuite possible." },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#060a13', color: '#fff', overflowX: 'hidden' }}>

      {/* ═══ TICKER BAR ═══ */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: 'linear-gradient(90deg, var(--a), #e8c84a, var(--a))', padding: '5px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 50, whiteSpace: 'nowrap', animation: 'slide 40s linear infinite', fontFamily: 'var(--b)', fontSize: 10, fontWeight: 700, color: '#0a0e1a', letterSpacing: 0.5, textTransform: 'uppercase' }}>
          {[...Array(3)].map((_, i) => (
            <span key={i} style={{ display: 'flex', gap: 50 }}>
              <span>🎁 Villa 695 000€ à gagner — Jeu concours gratuit</span>
              <span>🎟️ 1 ticket + 1 crédit IA offerts à l&apos;inscription</span>
              <span>🤖 6 services IA immobiliers — 1 crédit offert</span>
              <span>⚡ Tirage dès 200 000 tickets · Huissier de justice</span>
            </span>
          ))}
        </div>
      </div>

      {/* ═══ NAV ═══ */}
      <nav style={{ position: 'fixed', top: 24, left: 0, right: 0, zIndex: 100, padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: sY > 80 ? 'rgba(6,10,19,.95)' : 'transparent', backdropFilter: sY > 80 ? 'blur(16px)' : 'none', borderBottom: sY > 80 ? '1px solid rgba(255,255,255,.04)' : 'none', transition: 'all .4s' }}>
        <span style={{ fontFamily: 'var(--m)', fontWeight: 700, fontSize: 16, color: 'var(--a)', letterSpacing: 2 }}>HOWNER</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Gauge mini />
          <Link href="/login" style={{ padding: '7px 16px', background: 'linear-gradient(135deg, var(--a), #b8932e)', borderRadius: 7, fontFamily: 'var(--b)', fontWeight: 700, fontSize: 10, color: '#0a0e1a', textDecoration: 'none', boxShadow: '0 2px 8px rgba(207,175,75,.2)' }}>
            Je participe
          </Link>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 20px 60px', position: 'relative' }}>
        {/* Ambient glow */}
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(207,175,75,.06) 0%, transparent 65%)', top: '35%', left: '50%', transform: `translate(-50%,-50%) translateY(${sY * 0.04}px)`, pointerEvents: 'none' }} />

        <div style={{ animation: 'fadeIn .8s cubic-bezier(.16,1,.3,1)', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(207,175,75,.06)', border: '1px solid rgba(207,175,75,.15)', borderRadius: 100, padding: '5px 16px', marginBottom: 24 }}>
            <span style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--a)', fontFamily: 'var(--b)', fontWeight: 700 }}>🎁 Inscription gratuite · 1 crédit IA + 1 ticket offerts</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 800, lineHeight: 1, maxWidth: 680, marginBottom: 16 }}>
            <span style={{ color: 'rgba(255,255,255,.95)' }}>Gagnez cette</span><br />
            <span style={{ background: 'linear-gradient(135deg, var(--a), #f5e6a3, var(--a))', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 5s linear infinite' }}>villa à 695 000€</span>
          </h1>

          {/* Villa specs */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
            {['149m²', '4 chambres', 'Boucau', 'Pays Basque', 'Architecte'].map((t, i) => (
              <span key={i} style={{ padding: '4px 10px', borderRadius: 100, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: 'var(--b)', fontWeight: 600 }}>{t}</span>
            ))}
          </div>

          {/* Sub text */}
          <p style={{ fontFamily: 'var(--b)', fontSize: 'clamp(12px, 1.5vw, 15px)', color: 'rgba(255,255,255,.4)', maxWidth: 480, lineHeight: 1.7, marginBottom: 28 }}>
            Inscris-toi gratuitement. Utilise l&apos;IA pour tes projets immobiliers.
            Chaque crédit te donne un ticket pour le tirage au sort.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
            <Link href="/login" style={{ padding: '14px 28px', background: 'linear-gradient(135deg, var(--a), #b8932e)', border: 'none', borderRadius: 10, color: '#0a0e1a', fontFamily: 'var(--b)', fontWeight: 800, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 20px rgba(207,175,75,.3)', display: 'flex', alignItems: 'center', gap: 8 }}>
              🎁 S&apos;inscrire gratuitement
            </Link>
            <Link href="/browse" style={{ padding: '14px 24px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, color: 'rgba(255,255,255,.6)', fontFamily: 'var(--b)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              Voir les annonces
            </Link>
          </div>

          {/* Gauge */}
          <Gauge />

          {/* Trust badges */}
          <div style={{ marginTop: 20, display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['📢 6 portails agrégés', '💞 Matching', '🤖 IA immobilière', '🎟️ Jeu concours', '⚖️ Huissier'].map((t, i) => (
              <span key={i} style={{ fontSize: 9, color: 'rgba(255,255,255,.2)', fontFamily: 'var(--b)', fontWeight: 500 }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', animation: 'pulse 2s infinite' }}>
          <div style={{ width: 20, height: 30, borderRadius: 10, border: '1.5px solid rgba(255,255,255,.15)', display: 'flex', justifyContent: 'center', paddingTop: 6 }}>
            <div style={{ width: 2, height: 6, borderRadius: 2, background: 'rgba(255,255,255,.25)', animation: 'fadeIn 1.5s infinite' }} />
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section style={{ padding: '40px 20px', borderTop: '1px solid rgba(255,255,255,.04)', borderBottom: '1px solid rgba(255,255,255,.04)', background: 'rgba(255,255,255,.008)' }}>
        <div style={{ maxWidth: 650, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
          <Ct end={847000} label="Biens référencés" suffix="+" />
          <Ct end={4283} label="Tickets distribués" />
          <Ct end={312} label="Matchs réalisés" />
          <Ct end={47} label="Pros inscrits" />
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section style={{ padding: '70px 20px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 800, color: '#fff', marginBottom: 6 }}>Comment gagner des tickets ?</h2>
          <p style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.3)' }}>Plus tu as de tickets, plus tu as de chances de gagner la villa.</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          <StepCard step={1} icon="🎟️" title="Inscris-toi" desc="Créé ton compte en 30 secondes avec ton numéro de téléphone." bonus="+1 ticket + 1 crédit IA gratuits" index={0} />
          <StepCard step={2} icon="🤖" title="Utilise l'IA" desc="Achète des crédits et utilise nos 6 services IA immobiliers." bonus="+1 ticket par crédit acheté" index={1} />
          <StepCard step={3} icon="🎁" title="Parraine" desc="Invite tes amis. Chacun reçoit un ticket bonus gratuit." bonus="+1 ticket par ami" index={2} />
        </div>
      </section>

      {/* ═══ AI SERVICES ═══ */}
      <section style={{ padding: '60px 20px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h2 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 800, color: '#fff', marginBottom: 6 }}>L&apos;IA travaille pour toi</h2>
          <p style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.3)', maxWidth: 460, margin: '0 auto' }}>6 services IA immobiliers. 1 crédit = 1 service + 1 ticket bonus pour le jeu concours.</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          <AICard icon="🔍" title="Recherche bien IA" desc="L'IA analyse tes critères et sélectionne les meilleures opportunités du marché." index={0} />
          <AICard icon="🏘️" title="Recherche location" desc="Scan du marché locatif complet. Les meilleurs biens selon tes critères." index={1} />
          <AICard icon="🔨" title="Recherche artisan" desc="Trouve le bon artisan : noté, vérifié, dans ta zone. Devis comparés." index={2} />
          <AICard icon="💰" title="Dossier bancaire" desc="L'IA monte ton dossier complet, prêt à envoyer à ta banque." index={3} />
          <AICard icon="📄" title="Analyse de devis" desc="Upload un devis, l'IA compare chaque ligne au prix du marché." index={4} />
          <AICard icon="📊" title="Analyse de bien" desc="Estimation DVF, analyse quartier, rentabilité, potentiel plus-value." index={5} />
        </div>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link href="/login" style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'var(--a)', textDecoration: 'none', fontWeight: 700 }}>
            Tester avec mon crédit offert →
          </Link>
        </div>
      </section>

      {/* ═══ BROWSE ═══ */}
      <section style={{ padding: '60px 20px', maxWidth: 640, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 800, color: '#fff', marginBottom: 6 }}>Toutes les annonces. Un seul endroit.</h2>
          <p style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.3)' }}>LeBonCoin, SeLoger, PAP, Bien&apos;ici + annonces natives des pros Howner.</p>
        </div>
        <ListingPreview />
      </section>

      {/* ═══ MATCHING ═══ */}
      <section style={{ padding: '60px 20px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 800, color: '#fff', marginBottom: 6 }}>Matching immobilier</h2>
          <p style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.3)' }}>Swipe pour connecter avec vendeurs, acheteurs, artisans, promoteurs et courtiers.</p>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10 }}>
            {['👤↔👤', '👤↔🏢', '🏢↔🏢'].map((t, i) => (
              <span key={i} style={{ padding: '3px 10px', borderRadius: 6, background: 'rgba(207,175,75,.04)', border: '1px solid rgba(207,175,75,.1)', fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.35)' }}>{t}</span>
            ))}
          </div>
        </div>
        <MatchDemo />
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 800, color: '#fff', marginBottom: 6 }}>Ce qu&apos;ils en pensent</h2>
        </div>
        <Testimonials />
      </section>

      {/* ═══ PRICING ═══ */}
      <section style={{ padding: '60px 20px', maxWidth: 1050, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
          <button onClick={() => setPro(false)} style={{ padding: '8px 16px', background: !pro ? 'rgba(207,175,75,.1)' : 'rgba(255,255,255,.02)', border: !pro ? '1px solid rgba(207,175,75,.3)' : '1px solid rgba(255,255,255,.06)', borderRadius: 8, color: !pro ? 'var(--a)' : 'rgba(255,255,255,.4)', fontFamily: 'var(--b)', fontWeight: !pro ? 700 : 500, fontSize: 11, cursor: 'pointer' }}>👤 Particulier</button>
          <button onClick={() => setPro(true)} style={{ padding: '8px 16px', background: pro ? 'rgba(207,175,75,.1)' : 'rgba(255,255,255,.02)', border: pro ? '1px solid rgba(207,175,75,.3)' : '1px solid rgba(255,255,255,.06)', borderRadius: 8, color: pro ? 'var(--a)' : 'rgba(255,255,255,.4)', fontFamily: 'var(--b)', fontWeight: pro ? 700 : 500, fontSize: 11, cursor: 'pointer' }}>🏢 Pro</button>
        </div>

        {!pro ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, color: '#fff', marginBottom: 4 }}>Crédits IA · 1 crédit = 1 service + 1 ticket</h2>
              <p style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.3)' }}>Plus tu achètes, moins c&apos;est cher — et plus tu as de chances de gagner.</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              <PCard idx={0} title="Offert" sub="1 crédit IA + 1 ticket" price="0€" features={['Consultation annonces illimitée', 'Matching entre utilisateurs', '1 crédit IA pour tester', '1 ticket jeu concours', 'Parrainage = tickets gratuits']} />
              <PCard idx={1} title="1 crédit" sub="1 service IA + 1 ticket" price="9€" features={['1 service IA au choix', '1 ticket bonus jeu concours', 'Résultat sauvegardé', 'Utilisation immédiate']} />
              <PCard idx={2} hl badge="POPULAIRE" title="Pack 5" sub="5 crédits + 5 tickets" price="39€" note="7,80€/crédit · -13%" features={['5 services IA au choix', '5 tickets bonus', 'Alertes personnalisées', 'Résultats sauvegardés', 'Meilleur rapport qualité/prix']} />
              <PCard idx={3} title="Pack 15" sub="15 crédits + 15 tickets" price="99€" note="6,60€/crédit · -27%" features={['15 services IA', 'Tout le Pack 5 inclus', 'Support prioritaire', '15 tickets bonus']} />
              <PCard idx={4} title="Pack 40" sub="40 crédits + 40 tickets" price="199€" note="4,98€ · Le moins cher" features={['40 services IA', 'Analyses approfondies', 'Dossier bancaire complet', '40 tickets bonus', 'Support VIP']} />
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, color: '#fff', marginBottom: 4 }}>Pros · Sans engagement · Résiliable en 1 clic</h2>
              <p style={{ fontFamily: 'var(--b)', fontSize: 11, color: 'rgba(255,255,255,.3)' }}>5x moins cher que SeLoger. Sans contrat 12 mois.</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              <PCard idx={0} title="Pro Gratuit" sub="3 annonces · Matching · Avis" price="0€" features={['Profil pro vérifié', '3 annonces actives', 'Matching acheteurs/locataires', 'Avis clients', 'Données demande basiques']} />
              <PCard idx={1} title="Artisan" sub="Illimité · Leads · Notes" price="79€" period="/mois" note="Sans engagement" features={['Annonces illimitées', 'Leads qualifiés zone', 'Matching clients', 'Profil noté', 'Données demande temps réel']} />
              <PCard idx={2} hl badge="TOP" title="Agent Immo" sub="Illimité · Matching · Analytics" price="129€" period="/mois" note="Sans engagement" features={['Annonces illimitées', 'Matching acheteurs qualifiés', 'Scoring IA annonces', 'Dashboard analytics', 'Données temps réel']} />
              <PCard idx={3} title="Promoteur" sub="Écoulez votre stock" price="169€" period="/mois" badge="NEW" note="Sans engagement" features={['Tous vos lots listés', 'Matching pré-qualifiés', 'Données par programme', 'Scoring prix vs marché', 'Visibilité prioritaire']} />
            </div>
          </>
        )}
      </section>

      {/* ═══ VILLA DETAIL ═══ */}
      <section style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', background: 'linear-gradient(160deg, rgba(207,175,75,.06), rgba(6,10,19,.95))', border: '1px solid rgba(207,175,75,.12)', borderRadius: 16, padding: '36px 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--a), transparent)' }} />
          <div style={{ fontFamily: 'var(--m)', fontSize: 9, letterSpacing: 3, color: 'var(--a)', textTransform: 'uppercase', marginBottom: 8 }}>Lot du jeu concours</div>
          <h2 style={{ fontFamily: 'var(--d)', fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 10 }}>Villa Boucau</h2>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
            {['149m²', '4 chambres', 'R+1', 'Boucau Haut', 'Pays Basque'].map((t, i) => (
              <span key={i} style={{ padding: '3px 10px', borderRadius: 100, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: 'var(--b)', fontWeight: 500 }}>{t}</span>
            ))}
          </div>
          <p style={{ fontFamily: 'var(--b)', fontSize: 12, color: 'rgba(255,255,255,.4)', lineHeight: 1.6, marginBottom: 18, maxWidth: 380, margin: '0 auto 18px' }}>Architecte intégré · Finitions Porcelanosa · Construction LSF · Clé en main · Livrée par Affinity Home</p>
          <div style={{ fontFamily: 'var(--m)', fontSize: 36, color: 'var(--a)', fontWeight: 700, textShadow: '0 0 20px rgba(207,175,75,.15)' }}>695 000€</div>
          <div style={{ marginTop: 10, fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.2)' }}>Participation gratuite possible · Aucun achat requis</div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section style={{ padding: '50px 20px', maxWidth: 500, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--d)', fontSize: 24, fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: 20 }}>FAQ</h2>
        {faqs.map((faq, i) => (
          <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
        ))}
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section style={{ padding: '50px 20px 70px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--d)', fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, color: '#fff', marginBottom: 8 }}>1 ticket offert. 1 crédit IA offert.</h2>
        <p style={{ fontFamily: 'var(--b)', fontSize: 13, color: 'rgba(255,255,255,.3)', marginBottom: 20 }}>Gratuit · Pas de carte bancaire · Tirage sous huissier</p>
        <Link href="/login" style={{ padding: '14px 32px', background: 'linear-gradient(135deg, var(--a), #b8932e)', border: 'none', borderRadius: 10, color: '#0a0e1a', fontFamily: 'var(--b)', fontWeight: 800, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 20px rgba(207,175,75,.25)', display: 'inline-block' }}>
          🎁 C&apos;est parti — Inscription gratuite
        </Link>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ padding: '24px 20px', borderTop: '1px solid rgba(255,255,255,.04)', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--m)', fontSize: 11, color: 'var(--a)', marginBottom: 6, letterSpacing: 2 }}>HOWNER</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 10 }}>
          <Link href="/browse" style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.25)', textDecoration: 'none' }}>Annonces</Link>
          <Link href="/match" style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.25)', textDecoration: 'none' }}>Matching</Link>
          <Link href="/login" style={{ fontFamily: 'var(--b)', fontSize: 10, color: 'rgba(255,255,255,.25)', textDecoration: 'none' }}>Connexion</Link>
        </div>
        <div style={{ fontFamily: 'var(--b)', fontSize: 8, color: 'rgba(255,255,255,.1)', lineHeight: 1.8 }}>
          Affinity House Factory SAS · SIRET 982 581 506 00010 · Anglet, France
          <br />Jeu concours gratuit · Directive EU 2005/29/CE · Huissier de justice
          <br />Règlement complet sur demande · Vérification d&apos;identité requise
        </div>
      </footer>

      {/* ═══ LIVE TICKER ═══ */}
      <LiveTicker />
    </div>
  )
}
