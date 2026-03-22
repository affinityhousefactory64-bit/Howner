'use client'

interface CollectionCardProps {
  cardNumber: number
  cycle?: number
  small?: boolean
}

export default function CollectionCard({ cardNumber, cycle = 1, small = false }: CollectionCardProps) {
  const formattedNumber = String(cardNumber).padStart(5, '0')

  if (small) {
    return (
      <div style={{
        width: 100, height: 140, borderRadius: 8,
        background: 'linear-gradient(135deg, #0a0e1a 0%, #111827 100%)',
        border: '1px solid rgba(207,175,75,.25)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 8, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(207,175,75,1) 10px, rgba(207,175,75,1) 11px)',
        }} />
        <div style={{ fontFamily: 'var(--d)', fontSize: 8, color: 'var(--a)', letterSpacing: 2, marginBottom: 4, position: 'relative' }}>HOWNER</div>
        <div style={{ fontFamily: 'var(--m)', fontSize: 16, fontWeight: 700, color: '#fff', position: 'relative' }}>#{formattedNumber}</div>
        <div style={{ fontSize: 7, color: 'rgba(255,255,255,.3)', marginTop: 4, position: 'relative' }}>Cycle {cycle}</div>
      </div>
    )
  }

  return (
    <div style={{
      width: 200, height: 280, borderRadius: 14,
      background: 'linear-gradient(135deg, #0a0e1a 0%, #111827 50%, #0a0e1a 100%)',
      border: '1.5px solid rgba(207,175,75,.3)',
      boxShadow: '0 0 30px rgba(207,175,75,.08), inset 0 1px 0 rgba(207,175,75,.1)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(207,175,75,1) 10px, rgba(207,175,75,1) 11px)',
      }} />

      {/* Gold corner accents */}
      <div style={{ position: 'absolute', top: 12, left: 12, width: 20, height: 20, borderTop: '1px solid rgba(207,175,75,.3)', borderLeft: '1px solid rgba(207,175,75,.3)' }} />
      <div style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderTop: '1px solid rgba(207,175,75,.3)', borderRight: '1px solid rgba(207,175,75,.3)' }} />
      <div style={{ position: 'absolute', bottom: 12, left: 12, width: 20, height: 20, borderBottom: '1px solid rgba(207,175,75,.3)', borderLeft: '1px solid rgba(207,175,75,.3)' }} />
      <div style={{ position: 'absolute', bottom: 12, right: 12, width: 20, height: 20, borderBottom: '1px solid rgba(207,175,75,.3)', borderRight: '1px solid rgba(207,175,75,.3)' }} />

      {/* Logo */}
      <div style={{
        fontFamily: 'var(--d)', fontSize: 14, fontWeight: 700, color: 'var(--a)',
        letterSpacing: 4, marginBottom: 20, position: 'relative',
      }}>
        HOWNER
      </div>

      {/* Card number */}
      <div style={{
        fontFamily: 'var(--m)', fontSize: 32, fontWeight: 700, color: '#fff',
        marginBottom: 8, position: 'relative',
        textShadow: '0 0 20px rgba(207,175,75,.2)',
      }}>
        #{formattedNumber}
      </div>

      {/* Divider */}
      <div style={{ width: 40, height: 1, background: 'rgba(207,175,75,.2)', marginBottom: 12, position: 'relative' }} />

      {/* Cycle info */}
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: 2, textTransform: 'uppercase', position: 'relative' }}>
        Cycle {cycle}
      </div>
      <div style={{ fontSize: 9, color: 'rgba(255,255,255,.25)', marginTop: 4, position: 'relative' }}>
        Villa Boucau
      </div>
    </div>
  )
}
