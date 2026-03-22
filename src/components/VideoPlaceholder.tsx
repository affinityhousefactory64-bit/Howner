'use client'

interface VideoPlaceholderProps {
  title?: string
  subtitle?: string
  aspectRatio?: string
  youtubeUrl?: string
  videoSrc?: string
}

export default function VideoPlaceholder({
  title = 'Video promo',
  subtitle = 'Bientôt disponible',
  aspectRatio = '16/9',
  youtubeUrl,
  videoSrc,
}: VideoPlaceholderProps) {
  // If a YouTube URL is provided, render the embed
  if (youtubeUrl) {
    const videoId = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/)?.[1]
    if (videoId) {
      return (
        <div style={{
          position: 'relative',
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(207,175,75,.15)',
          background: '#000',
          aspectRatio,
        }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="autoplay; fullscreen"
            title={title}
          />
        </div>
      )
    }
  }

  // If a direct video src is provided, render the video element
  if (videoSrc) {
    return (
      <div style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(207,175,75,.15)',
        background: '#000',
        aspectRatio,
      }}>
        <video
          src={videoSrc}
          controls
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          title={title}
        />
      </div>
    )
  }

  // Default: placeholder card
  return (
    <div style={{
      position: 'relative',
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid rgba(207,175,75,.15)',
      background: 'rgba(255,255,255,.02)',
      aspectRatio,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    }}>
      {/* Play button triangle */}
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: 'rgba(207,175,75,.1)',
        border: '1px solid rgba(207,175,75,.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 0,
          height: 0,
          borderTop: '12px solid transparent',
          borderBottom: '12px solid transparent',
          borderLeft: '20px solid var(--a)',
          marginLeft: 4,
        }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>{subtitle}</div>
      </div>
    </div>
  )
}
