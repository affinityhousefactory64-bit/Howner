'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
export default function BrowseRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/annonces') }, [router])
  return <div style={{ minHeight: '100vh', background: '#060a13' }} />
}
