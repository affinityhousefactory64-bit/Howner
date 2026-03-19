import { NextRequest, NextResponse } from 'next/server'
import { checkVerificationCode } from '@/lib/twilio'
import { supabase } from '@/lib/supabase'
import { createSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { phone, code, name, type, proType, referralCode } = await req.json()

    if (!phone || !code) {
      return NextResponse.json({ error: 'Téléphone et code requis' }, { status: 400 })
    }

    // Verify SMS code
    const approved = await checkVerificationCode(phone, code)
    if (!approved) {
      return NextResponse.json({ error: 'Code invalide' }, { status: 401 })
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single()

    if (existingUser) {
      await createSession(existingUser.id)
      return NextResponse.json({ user: existingUser, isNew: false })
    }

    // Handle referral
    let referredBy: string | null = null
    if (referralCode) {
      const { data: referrer } = await supabase
        .from('users')
        .select('id, tickets')
        .eq('referral_code', referralCode)
        .single()

      if (referrer) {
        referredBy = referrer.id
        // Give referrer a bonus ticket
        await supabase
          .from('users')
          .update({ tickets: referrer.tickets + 1 })
          .eq('id', referrer.id)

        try { await supabase.from('activity_log').insert({
          user_id: referrer.id,
          action: 'referral',
          details: { bonus: '1 ticket' },
        }) } catch { /* ignore */ }
      }
    }

    // Create new user — 1 free ticket (no free credits in new model)
    const userType = type === 'pro' ? 'pro' : 'particulier'
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        phone,
        name: name || '',
        type: userType,
        pro_type: userType === 'pro' ? (proType || 'agent') : null,
        credits: 0,
        tickets: 1,
        free_listing_used: false,
        referred_by: referredBy,
      })
      .select()
      .single()

    if (error) {
      console.error('User creation error:', error)
      return NextResponse.json({ error: 'Erreur création compte' }, { status: 500 })
    }

    // Log activity
    try { await supabase.from('activity_log').insert({
      user_id: newUser.id,
      action: 'signup',
      details: { name: name || 'Anonyme', type: userType },
    }) } catch { /* ignore */ }

    await createSession(newUser.id)

    return NextResponse.json({ user: newUser, isNew: true })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: 'Erreur de vérification' }, { status: 500 })
  }
}
