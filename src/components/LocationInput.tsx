'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Suggestion {
  label: string
  city: string
  postcode: string
}

interface LocationInputProps {
  value: string
  onChange: (city: string, zipcode: string) => void
  placeholder?: string
  className?: string
}

export default function LocationInput({ value, onChange, placeholder, className }: LocationInputProps) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync external value
  useEffect(() => {
    setQuery(value)
  }, [value])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }
    try {
      const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&type=municipality&limit=6`)
      const data = await res.json()
      if (data.features && data.features.length > 0) {
        const items: Suggestion[] = data.features.map((f: { properties: { label: string; city: string; postcode: string } }) => ({
          label: f.properties.label,
          city: f.properties.city || f.properties.label,
          postcode: f.properties.postcode || '',
        }))
        setSuggestions(items)
        setOpen(true)
        setActiveIndex(-1)
      } else {
        setSuggestions([])
        setOpen(false)
      }
    } catch {
      setSuggestions([])
      setOpen(false)
    }
  }, [])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    onChange(val, '')

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      fetchSuggestions(val)
    }, 300)
  }

  function handleSelect(s: Suggestion) {
    const displayValue = s.postcode ? `${s.city} (${s.postcode})` : s.city
    setQuery(displayValue)
    onChange(s.city, s.postcode)
    setOpen(false)
    setSuggestions([])
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (suggestions.length > 0) setOpen(true) }}
        placeholder={placeholder || 'Rechercher une ville...'}
        className={className}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 50,
          marginTop: 4,
          background: '#1a1a1a',
          border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,.5)',
        }}>
          {suggestions.map((s, i) => (
            <button
              key={`${s.city}-${s.postcode}-${i}`}
              onClick={() => handleSelect(s)}
              onMouseEnter={() => setActiveIndex(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '10px 14px',
                background: i === activeIndex ? 'rgba(255,255,255,.06)' : 'transparent',
                border: 'none',
                borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--b)',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>
                {s.city}
              </span>
              {s.postcode && (
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', fontWeight: 500 }}>
                  {s.postcode}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
