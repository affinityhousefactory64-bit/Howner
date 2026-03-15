import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

// Mock profiles for MVP — will be replaced by real Supabase queries
const MOCK_PROFILES = [
  { id: 'u1', name: 'Villa T4 vue mer', type: 'particulier', sub: 'Biarritz · Vendeur particulier', price: '785 000€', tags: ['142m²', '4 ch', 'Jardin', 'Vue mer'], color: '#cfaf4b', role: 'Vendeur' },
  { id: 'u2', name: 'Programme Les Allées', type: 'promoteur', sub: 'Bayonne · 4 lots disponibles', price: 'Dès 195K€', tags: ['T2→T4', 'RT2020', 'PTZ'], color: '#a78bfa', role: 'Promoteur' },
  { id: 'u3', name: 'Menuiserie Ospital', type: 'artisan', sub: 'Anglet · ⭐ 4.9/5 · 127 avis', price: null, tags: ['Cuisines', 'Agencement', 'Décennale'], color: '#34d399', role: 'Artisan' },
  { id: 'u4', name: 'Couple + enfant', type: 'particulier', sub: 'Cherche T3 · Bayonne · 900-1200€', price: null, tags: ['Parking', 'École', 'Dispo maintenant'], color: '#60a5fa', role: 'Locataire' },
  { id: 'u5', name: 'Cabinet Duval', type: 'courtier', sub: 'Pays Basque · ⭐ 4.6 · 203 avis', price: null, tags: ['Taux 3.2%', 'PTZ', 'Dossier 48h'], color: '#f472b6', role: 'Courtier' },
  { id: 'u6', name: 'Maison T5 Anglet', type: 'particulier', sub: 'Anglet · Vendeur particulier', price: '520 000€', tags: ['120m²', '5 ch', 'Garage', 'Jardin'], color: '#cfaf4b', role: 'Vendeur' },
  { id: 'u7', name: 'Plomberie Etcheverry', type: 'artisan', sub: 'BAB · ⭐ 4.7 · 89 avis', price: null, tags: ['Salle de bain', 'Chauffage', 'Urgences'], color: '#34d399', role: 'Artisan' },
  { id: 'u8', name: 'Agence Côte Basque Immo', type: 'agent', sub: 'Biarritz · 340 biens en portefeuille', price: null, tags: ['Vente', 'Location', 'Gestion'], color: '#f59e0b', role: 'Agent Immo' },
]

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  // In production: query Supabase for users not yet swiped
  return NextResponse.json({ profiles: MOCK_PROFILES })
}
