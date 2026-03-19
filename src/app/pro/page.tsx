'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
export default function ProRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/compte') }, [router])
  return <div style={{ minHeight: '100vh', background: '#060a13' }} />
}
