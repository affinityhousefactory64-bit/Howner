'use client'

import { useState, useRef, useCallback } from 'react'

interface MediaUploadProps {
  type: 'photo' | 'video' | 'both'
  maxFiles?: number
  maxSizeMB?: number
  onUpload: (urls: string[]) => void
  existingUrls?: string[]
}

const PHOTO_ACCEPT = '.jpg,.jpeg,.png,.webp,.heic'
const VIDEO_ACCEPT = '.mp4,.mov,.webm'

function getAccept(type: 'photo' | 'video' | 'both'): string {
  if (type === 'photo') return PHOTO_ACCEPT
  if (type === 'video') return VIDEO_ACCEPT
  return `${PHOTO_ACCEPT},${VIDEO_ACCEPT}`
}

function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/')
}

export default function MediaUpload({
  type,
  maxFiles,
  maxSizeMB,
  onUpload,
  existingUrls = [],
}: MediaUploadProps) {
  const defaultMaxFiles = type === 'video' ? 1 : 10
  const defaultMaxSizeMB = type === 'video' ? 50 : 5
  const limit = maxFiles ?? defaultMaxFiles
  const sizeLimit = maxSizeMB ?? defaultMaxSizeMB

  const [urls, setUrls] = useState<string[]>(existingUrls)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      const remaining = limit - urls.length
      if (remaining <= 0) {
        setError(`Maximum ${limit} fichier${limit > 1 ? 's' : ''} atteint`)
        return
      }
      const toUpload = fileArray.slice(0, remaining)

      // Validate sizes
      for (const f of toUpload) {
        if (f.size > sizeLimit * 1024 * 1024) {
          setError(`${f.name} dépasse ${sizeLimit} Mo`)
          return
        }
      }

      setError('')
      setUploading(true)
      setProgress(0)

      const uploaded: string[] = []
      for (let i = 0; i < toUpload.length; i++) {
        const file = toUpload[i]
        const formData = new FormData()
        formData.append('file', file)

        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Erreur upload')
          uploaded.push(data.url)
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Erreur upload')
          break
        }
        setProgress(Math.round(((i + 1) / toUpload.length) * 100))
      }

      if (uploaded.length > 0) {
        const newUrls = [...urls, ...uploaded]
        setUrls(newUrls)
        onUpload(newUrls)
      }
      setUploading(false)
    },
    [urls, limit, sizeLimit, onUpload],
  )

  function handleRemove(index: number) {
    const newUrls = urls.filter((_, i) => i !== index)
    setUrls(newUrls)
    onUpload(newUrls)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(true)
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
  }

  const canAddMore = urls.length < limit && !uploading

  return (
    <div>
      {/* Drop zone */}
      {canAddMore && (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          style={{
            border: `2px dashed ${dragOver ? 'var(--a)' : 'rgba(255,255,255,.08)'}`,
            borderRadius: 12,
            padding: '24px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragOver ? 'rgba(207,175,75,.04)' : 'rgba(255,255,255,.02)',
            transition: 'all .2s',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.4)', marginBottom: 4 }}>
            {type === 'video'
              ? 'Glissez une vidéo ou cliquez'
              : type === 'photo'
                ? 'Glissez des photos ou cliquez'
                : 'Glissez des fichiers ou cliquez'}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.2)' }}>
            {type === 'video' ? 'MP4, MOV, WebM' : type === 'photo' ? 'JPG, PNG, WebP, HEIC' : 'Photos et vidéos'}
            {' '}&middot; Max {sizeLimit} Mo
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={getAccept(type)}
            multiple={limit > 1}
            style={{ display: 'none' }}
            onChange={e => {
              if (e.target.files) handleFiles(e.target.files)
              e.target.value = ''
            }}
          />
        </div>
      )}

      {/* Progress bar */}
      {uploading && (
        <div style={{ marginTop: 10 }}>
          <div style={{
            height: 4, borderRadius: 2, background: 'rgba(255,255,255,.06)', overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress}%`, height: '100%', background: 'var(--a)',
              borderRadius: 2, transition: 'width .3s',
            }} />
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 4, textAlign: 'center' }}>
            {progress}%
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ fontSize: 11, color: '#f87171', marginTop: 8 }}>{error}</div>
      )}

      {/* Previews */}
      {urls.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: type === 'video' ? '1fr' : 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: 8,
          marginTop: 10,
        }}>
          {urls.map((url, i) => {
            const isVideo = url.match(/\.(mp4|mov|webm)$/i)
            return (
              <div key={url} style={{ position: 'relative' }}>
                {isVideo ? (
                  <video
                    src={url}
                    controls
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      background: '#000',
                      maxHeight: 200,
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    paddingBottom: '100%',
                    borderRadius: 8,
                    background: `url(${url}) center/cover`,
                    border: '1px solid rgba(255,255,255,.06)',
                  }} />
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemove(i) }}
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(0,0,0,.7)',
                    color: '#fff',
                    fontSize: 12,
                    lineHeight: '20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  aria-label="Supprimer"
                >
                  &times;
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
