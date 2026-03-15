import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationCode } from '@/lib/twilio'

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Numéro de téléphone requis' }, { status: 400 })
    }

    // Normalize: ensure +33 format
    const normalized = phone.startsWith('+') ? phone : `+33${phone.replace(/^0/, '')}`

    const status = await sendVerificationCode(normalized)

    return NextResponse.json({ status, phone: normalized })
  } catch (error) {
    console.error('SMS send error:', error)
    return NextResponse.json({ error: "Erreur lors de l'envoi du SMS" }, { status: 500 })
  }
}
