import { NextRequest, NextResponse } from 'next/server'
import { checkVerificationCode } from '@/lib/twilio'
import { supabase } from '@/lib/supabase'
import { createSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { phone, code, name, type, referralCode } = await req.json()

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
        .select('id')
        .eq('referral_code', referralCode)
        .single()

      if (referrer) {
        referredBy = referrer.id
        // Give referrer a bonus ticket
        await supabase
          .from('users')
          .update({ tickets: referrer.id })
          .eq('id', referrer.id)
        await supabase.from('credit_transactions').insert({
          user_id: referrer.id,
          amount: 0,
          type: 'referral',
        })
      }
    }

    // Create new user with 1 free credit + 1 free ticket
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        phone,
        name: name || '',
        type: type || 'particulier',
        credits: 1,
        tickets: 1,
        referred_by: referredBy,
      })
      .select()
      .single()

    if (error) {
      console.error('User creation error:', error)
      return NextResponse.json({ error: 'Erreur création compte' }, { status: 500 })
    }

    // Log signup bonus
    await supabase.from('credit_transactions').insert({
      user_id: newUser.id,
      amount: 1,
      type: 'signup_bonus',
    })

    await createSession(newUser.id)

    return NextResponse.json({ user: newUser, isNew: true })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: 'Erreur de vérification' }, { status: 500 })
  }
}
