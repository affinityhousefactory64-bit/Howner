import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// =============================================================================
// HOWNER — Seed Script
// POST /api/seed?key=howner2026
// Populates the database with realistic French demo data
// =============================================================================

const SEED_SECRET = 'howner2026'
const PHONE_PREFIX = '+336'

function fakePhone(index: number): string {
  return `${PHONE_PREFIX}${String(10000000 + index).slice(0, 8)}`
}

function referralCode(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .toUpperCase()
    .slice(0, 6) + String(Math.floor(1000 + Math.random() * 9000))
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function futureDate(daysAhead: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  return d.toISOString()
}

function pastDate(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString()
}

// =============================================================================
// USER DATA
// =============================================================================

interface SeedUser {
  phone: string
  name: string
  type: 'particulier' | 'pro'
  pro_category?: string | null
  pro_specialty?: string | null
  pro_zone?: string | null
  pro_rating?: number | null
  pro_transactions?: number
  tickets: number
  credits: number
  referral_code: string
}

const particuliers: SeedUser[] = [
  'Marie Dupont', 'Thomas Bernard', 'Julie Martin', 'Pierre Moreau',
  'Camille Petit', 'Lucas Garcia', 'Emma Robert', 'Hugo Durand',
  'Léa Simon', 'Antoine Laurent', 'Chloé Lefebvre', 'Maxime Roux',
  'Sophie Michel', 'Julien Bertrand', 'Manon Giraud',
].map((name, i) => ({
  phone: fakePhone(i),
  name,
  type: 'particulier' as const,
  pro_category: null,
  pro_specialty: null,
  pro_zone: null,
  pro_rating: null,
  pro_transactions: 0,
  tickets: randomInt(1, 15),
  credits: randomInt(0, 5),
  referral_code: referralCode(name),
}))

const pros: SeedUser[] = [
  { name: 'Sophie Durand', pro_category: 'agent', pro_specialty: 'Agent immobilier', pro_zone: 'Bayonne', pro_rating: 4.8, pro_transactions: 43 },
  { name: 'Marc Lefèvre', pro_category: 'agent', pro_specialty: 'Agent immobilier', pro_zone: 'Biarritz', pro_rating: 4.6, pro_transactions: 38 },
  { name: 'Nadia Kessler', pro_category: 'courtier', pro_specialty: 'Courtier immobilier', pro_zone: 'Bayonne/Biarritz', pro_rating: 4.7, pro_transactions: 89 },
  { name: 'Jean-Marc Laporte', pro_category: 'artisan', pro_specialty: 'Plombier', pro_zone: 'Pays Basque', pro_rating: 4.9, pro_transactions: 127 },
  { name: 'Patrick Souza', pro_category: 'artisan', pro_specialty: 'Électricien', pro_zone: 'BAB', pro_rating: 4.5, pro_transactions: 95 },
  { name: 'Isabelle Moreau', pro_category: 'architecte', pro_specialty: 'Architecte', pro_zone: 'Côte Basque', pro_rating: 4.8, pro_transactions: 34 },
  { name: 'David Chen', pro_category: 'courtier', pro_specialty: 'Courtier immobilier', pro_zone: 'Anglet', pro_rating: 4.4, pro_transactions: 56 },
  { name: 'Stéphane Blanc', pro_category: 'artisan', pro_specialty: 'Peintre', pro_zone: 'Pays Basque', pro_rating: 4.7, pro_transactions: 210 },
  { name: 'Olivier Faure', pro_category: 'agent', pro_specialty: 'Agent immobilier', pro_zone: 'Anglet', pro_rating: 4.5, pro_transactions: 28 },
  { name: 'Caroline Vidal', pro_category: 'diagnostiqueur', pro_specialty: 'Diagnostiqueur immobilier', pro_zone: 'BAB', pro_rating: 4.6, pro_transactions: 340 },
  { name: 'Yannick Le Goff', pro_category: 'artisan', pro_specialty: 'Maçon', pro_zone: 'Pays Basque', pro_rating: 4.8, pro_transactions: 78 },
  { name: 'Sandrine Petit', pro_category: 'agent', pro_specialty: 'Agent immobilier', pro_zone: 'Hendaye', pro_rating: 4.3, pro_transactions: 22 },
  { name: 'François Dubois', pro_category: 'promoteur', pro_specialty: 'Promoteur immobilier', pro_zone: 'Côte Basque', pro_rating: 4.7, pro_transactions: 12 },
  { name: 'Aurélie Martin', pro_category: 'courtier', pro_specialty: 'Courtier immobilier', pro_zone: 'Pays Basque', pro_rating: 4.9, pro_transactions: 145 },
  { name: 'Karim Benali', pro_category: 'artisan', pro_specialty: 'Carreleur', pro_zone: 'BAB', pro_rating: 4.6, pro_transactions: 88 },
  { name: 'Christophe Dumas', pro_category: 'artisan', pro_specialty: 'Menuisier', pro_zone: 'Pays Basque', pro_rating: 4.7, pro_transactions: 62 },
  { name: 'Valérie Roche', pro_category: 'architecte', pro_specialty: 'Décorateur d\'intérieur', pro_zone: 'Biarritz', pro_rating: 4.8, pro_transactions: 47 },
  { name: 'Bruno Garcia', pro_category: 'artisan', pro_specialty: 'Couvreur', pro_zone: 'Pays Basque', pro_rating: 4.5, pro_transactions: 130 },
  { name: 'Élodie Fournier', pro_category: 'agent', pro_specialty: 'Agent immobilier', pro_zone: 'Bayonne', pro_rating: 4.6, pro_transactions: 31 },
  { name: 'Mathieu Costa', pro_category: 'artisan', pro_specialty: 'Chauffagiste', pro_zone: 'BAB', pro_rating: 4.4, pro_transactions: 76 },
  { name: 'Nathalie Blanc', pro_category: 'courtier', pro_specialty: 'Gestionnaire de patrimoine', pro_zone: 'Pays Basque', pro_rating: 4.7, pro_transactions: 89 },
  { name: 'Romain Duval', pro_category: 'demenageur', pro_specialty: 'Déménageur', pro_zone: 'BAB', pro_rating: 4.3, pro_transactions: 420 },
  { name: 'Sylvie Arnaud', pro_category: 'courtier', pro_specialty: 'Notaire', pro_zone: 'Bayonne', pro_rating: 4.9, pro_transactions: 890 },
  { name: 'Guillaume Mercier', pro_category: 'architecte', pro_specialty: 'Architecte', pro_zone: 'Anglet', pro_rating: 4.6, pro_transactions: 28 },
  { name: 'Amélie Bonnet', pro_category: 'agent', pro_specialty: 'Agent immobilier', pro_zone: 'Saint-Jean-de-Luz', pro_rating: 4.7, pro_transactions: 35 },
].map((p, i) => ({
  phone: fakePhone(15 + i),
  name: p.name,
  type: 'pro' as const,
  pro_category: p.pro_category,
  pro_specialty: p.pro_specialty,
  pro_zone: p.pro_zone,
  pro_rating: p.pro_rating,
  pro_transactions: p.pro_transactions,
  tickets: randomInt(1, 15),
  credits: randomInt(0, 5),
  referral_code: referralCode(p.name),
}))

const allUsers = [...particuliers, ...pros]

// =============================================================================
// LISTING DATA
// =============================================================================

interface SeedListing {
  title: string
  description: string
  category: string
  subcategory: string
  location: string
  price: number | null
  surface: number | null
  rooms: number | null
  property_type?: string | null
  bedrooms?: number | null
  dpe?: string | null
  is_boosted?: boolean
  boost_expires_at?: string | null
  // ownerName is used to link to the user after insert
  ownerName: string
}

const immoListings: SeedListing[] = [
  {
    title: 'T2 lumineux centre Bayonne',
    description: 'Bel appartement T2 en plein centre de Bayonne, lumineux et traversant. Proche commerces et transports, idéal premier achat ou investissement locatif.',
    category: 'immo', subcategory: 'vente', location: 'Bayonne',
    price: 185000, surface: 45, rooms: 2, bedrooms: 1, property_type: 'appartement', dpe: 'C',
    ownerName: 'Sophie Durand',
  },
  {
    title: 'Maison 5p avec jardin Anglet',
    description: 'Spacieuse maison familiale de 5 pièces avec jardin arboré de 400m². Quartier calme et résidentiel, proche écoles et commerces. Garage double.',
    category: 'immo', subcategory: 'vente', location: 'Anglet',
    price: 420000, surface: 120, rooms: 5, bedrooms: 3, property_type: 'maison', dpe: 'D',
    ownerName: 'Marc Lefèvre',
  },
  {
    title: 'T3 vue mer Biarritz',
    description: 'Magnifique T3 avec vue imprenable sur l\'océan. Terrasse plein sud de 15m², résidence sécurisée avec piscine. Prestations haut de gamme, parking en sous-sol.',
    category: 'immo', subcategory: 'vente', location: 'Biarritz',
    price: 380000, surface: 72, rooms: 3, bedrooms: 2, property_type: 'appartement', dpe: 'B',
    is_boosted: true, boost_expires_at: futureDate(14),
    ownerName: 'Sophie Durand',
  },
  {
    title: 'Studio meublé Bayonne',
    description: 'Studio entièrement meublé et équipé, idéal étudiant ou jeune actif. Situé au cœur du Petit Bayonne, à deux pas des quais de la Nive.',
    category: 'immo', subcategory: 'location', location: 'Bayonne',
    price: 550, surface: 22, rooms: 1, bedrooms: 0, property_type: 'appartement', dpe: 'E',
    ownerName: 'Marie Dupont',
  },
  {
    title: 'T4 rénové Anglet',
    description: 'Appartement T4 entièrement rénové avec goût. Cuisine équipée ouverte, double séjour lumineux, trois chambres. Cave et place de parking.',
    category: 'immo', subcategory: 'vente', location: 'Anglet',
    price: 295000, surface: 85, rooms: 4, bedrooms: 3, property_type: 'appartement', dpe: 'C',
    ownerName: 'Olivier Faure',
  },
  {
    title: 'Villa contemporaine Boucau',
    description: 'Villa contemporaine de 2020, prestations premium. Grand séjour cathédrale, suite parentale avec dressing, jardin paysager et piscine chauffée.',
    category: 'immo', subcategory: 'vente', location: 'Boucau',
    price: 520000, surface: 140, rooms: 6, bedrooms: 4, property_type: 'maison', dpe: 'A',
    ownerName: 'François Dubois',
  },
  {
    title: 'T2 avec terrasse Biarritz',
    description: 'Charmant T2 avec grande terrasse exposée ouest. Résidence calme à 800m de la plage, gardien et local vélos. Disponible immédiatement.',
    category: 'immo', subcategory: 'location', location: 'Biarritz',
    price: 850, surface: 40, rooms: 2, bedrooms: 1, property_type: 'appartement', dpe: 'C',
    ownerName: 'Amélie Bonnet',
  },
  {
    title: 'Maison basque Espelette',
    description: 'Authentique maison basque rénovée au cœur d\'Espelette. Colombages rouges, poutres apparentes, jardin clos. Vue sur les montagnes environnantes.',
    category: 'immo', subcategory: 'vente', location: 'Espelette',
    price: 345000, surface: 110, rooms: 5, bedrooms: 3, property_type: 'maison', dpe: 'D',
    ownerName: 'Élodie Fournier',
  },
  {
    title: 'Terrain constructible Boucau',
    description: 'Terrain plat et viabilisé de 600m², idéalement situé en zone résidentielle. COS favorable, possibilité de construire jusqu\'à 200m² de surface habitable.',
    category: 'immo', subcategory: 'vente', location: 'Boucau',
    price: 180000, surface: 600, rooms: null, bedrooms: null, property_type: 'terrain', dpe: null,
    ownerName: 'François Dubois',
  },
  {
    title: 'T3 proche plage Anglet',
    description: 'T3 au dernier étage avec vue dégagée, à 5 minutes à pied de la plage des Cavaliers. Séjour lumineux, deux chambres, balcon filant.',
    category: 'immo', subcategory: 'vente', location: 'Anglet',
    price: 310000, surface: 65, rooms: 3, bedrooms: 2, property_type: 'appartement', dpe: 'C',
    ownerName: 'Olivier Faure',
  },
  {
    title: 'Loft atypique Bayonne',
    description: 'Ancien atelier transformé en loft contemporain. Volumes exceptionnels avec 4m de hauteur sous plafond, mezzanine, verrière industrielle.',
    category: 'immo', subcategory: 'vente', location: 'Bayonne',
    price: 275000, surface: 80, rooms: 3, bedrooms: 1, property_type: 'appartement', dpe: 'D',
    ownerName: 'Sophie Durand',
  },
  {
    title: 'T1 étudiant Bayonne',
    description: 'Studio fonctionnel en résidence étudiante. Kitchenette, salle d\'eau, rangements. Proche université et transports en commun.',
    category: 'immo', subcategory: 'location', location: 'Bayonne',
    price: 420, surface: 18, rooms: 1, bedrooms: 0, property_type: 'appartement', dpe: 'F',
    ownerName: 'Thomas Bernard',
  },
  {
    title: 'Maison de ville Biarritz',
    description: 'Maison de ville d\'exception au cœur de Biarritz. Jardin privatif, garage, cave voûtée. Rénovation intégrale en 2023, matériaux nobles.',
    category: 'immo', subcategory: 'vente', location: 'Biarritz',
    price: 650000, surface: 150, rooms: 6, bedrooms: 4, property_type: 'maison', dpe: 'C',
    ownerName: 'Marc Lefèvre',
  },
  {
    title: 'T4 familial Bayonne',
    description: 'Grand T4 familial avec trois chambres, double séjour et cuisine séparée. Résidence avec espaces verts, place de parking privative.',
    category: 'immo', subcategory: 'location', location: 'Bayonne',
    price: 1100, surface: 90, rooms: 4, bedrooms: 3, property_type: 'appartement', dpe: 'C',
    ownerName: 'Élodie Fournier',
  },
  {
    title: 'Penthouse Biarritz',
    description: 'Penthouse d\'exception avec terrasse panoramique de 60m². Vue 360° océan et montagne. Prestations luxe, domotique, climatisation réversible.',
    category: 'immo', subcategory: 'vente', location: 'Biarritz',
    price: 890000, surface: 130, rooms: 4, bedrooms: 3, property_type: 'appartement', dpe: 'B',
    is_boosted: true, boost_expires_at: futureDate(21),
    ownerName: 'Marc Lefèvre',
  },
  {
    title: 'Local commercial Bayonne',
    description: 'Local commercial de 75m² en rez-de-chaussée, emplacement n°1 rue piétonne. Vitrine double, arrière-boutique et sanitaires.',
    category: 'immo', subcategory: 'vente', location: 'Bayonne',
    price: 195000, surface: 75, rooms: null, bedrooms: null, property_type: 'local_commercial', dpe: null,
    ownerName: 'François Dubois',
  },
  {
    title: 'Parking couvert centre Bayonne',
    description: 'Place de parking en sous-sol sécurisé, au cœur de Bayonne. Accès par badge, vidéosurveillance 24h/24. Rare à la vente.',
    category: 'immo', subcategory: 'vente', location: 'Bayonne',
    price: 22000, surface: null, rooms: null, bedrooms: null, property_type: 'parking', dpe: null,
    ownerName: 'Pierre Moreau',
  },
  {
    title: 'T3 neuf programme Anglet',
    description: 'Appartement neuf dans résidence standing. Livraison T4 2026, normes RT2020, terrasse de 12m², deux places de parking.',
    category: 'immo', subcategory: 'vente', location: 'Anglet',
    price: 340000, surface: 68, rooms: 3, bedrooms: 2, property_type: 'appartement', dpe: 'A',
    ownerName: 'François Dubois',
  },
  {
    title: 'Maison mitoyenne Tarnos',
    description: 'Maison mitoyenne de plain-pied, 4 pièces avec jardin de 200m². Quartier familial, proche écoles maternelle et primaire.',
    category: 'immo', subcategory: 'vente', location: 'Tarnos',
    price: 265000, surface: 95, rooms: 4, bedrooms: 3, property_type: 'maison', dpe: 'D',
    ownerName: 'Sandrine Petit',
  },
  {
    title: 'T2 résidence seniors Biarritz',
    description: 'Appartement T2 en résidence services seniors. Services inclus : restaurant, animations, aide à domicile. Environnement sécurisé et convivial.',
    category: 'immo', subcategory: 'vente', location: 'Biarritz',
    price: 210000, surface: 45, rooms: 2, bedrooms: 1, property_type: 'appartement', dpe: 'C',
    ownerName: 'Amélie Bonnet',
  },
  // --- Recherches ---
  {
    title: 'Recherche T3 Bayonne max 250K',
    description: 'Couple primo-accédant recherche T3 à Bayonne, budget maximum 250 000€. Quartier calme souhaité, proche transports.',
    category: 'immo', subcategory: 'recherche_achat', location: 'Bayonne',
    price: 250000, surface: null, rooms: 3, bedrooms: null, property_type: 'appartement', dpe: null,
    ownerName: 'Camille Petit',
  },
  {
    title: 'Recherche location T2 Anglet max 700€',
    description: 'Jeune actif recherche T2 en location à Anglet, budget max 700€ charges comprises. Proximité bus ou vélo souhaitée.',
    category: 'immo', subcategory: 'recherche_location', location: 'Anglet',
    price: 700, surface: null, rooms: 2, bedrooms: null, property_type: 'appartement', dpe: null,
    ownerName: 'Lucas Garcia',
  },
  {
    title: 'Recherche maison Pays Basque 300-400K',
    description: 'Famille avec 2 enfants recherche maison avec jardin au Pays Basque. Budget 300 000 à 400 000€, minimum 4 chambres.',
    category: 'immo', subcategory: 'recherche_achat', location: 'Pays Basque',
    price: 400000, surface: null, rooms: 5, bedrooms: 4, property_type: 'maison', dpe: null,
    ownerName: 'Hugo Durand',
  },
  {
    title: 'Recherche studio étudiant Bayonne',
    description: 'Étudiant recherche studio ou T1 à Bayonne pour la rentrée. Budget max 500€/mois, meublé de préférence.',
    category: 'immo', subcategory: 'recherche_location', location: 'Bayonne',
    price: 500, surface: null, rooms: 1, bedrooms: null, property_type: 'appartement', dpe: null,
    ownerName: 'Léa Simon',
  },
  {
    title: 'Recherche terrain Boucau/Tarnos',
    description: 'Recherche terrain constructible à Boucau ou Tarnos, minimum 500m². Budget max 200 000€, viabilisé de préférence.',
    category: 'immo', subcategory: 'recherche_achat', location: 'Boucau',
    price: 200000, surface: 500, rooms: null, bedrooms: null, property_type: 'terrain', dpe: null,
    ownerName: 'Antoine Laurent',
  },
  {
    title: 'Recherche T4+ Biarritz ou Anglet',
    description: 'Recherche grand appartement T4 ou plus à Biarritz ou Anglet. Budget confortable, vue mer appréciée. Parking indispensable.',
    category: 'immo', subcategory: 'recherche_achat', location: 'Biarritz',
    price: 500000, surface: null, rooms: 4, bedrooms: 3, property_type: 'appartement', dpe: null,
    ownerName: 'Chloé Lefebvre',
  },
  {
    title: 'Recherche local commercial Bayonne',
    description: 'Entrepreneur recherche local commercial à Bayonne centre. Surface 50 à 100m², rez-de-chaussée avec vitrine.',
    category: 'immo', subcategory: 'recherche_achat', location: 'Bayonne',
    price: 200000, surface: null, rooms: null, bedrooms: null, property_type: 'local_commercial', dpe: null,
    ownerName: 'Maxime Roux',
  },
  {
    title: 'Recherche colocation Bayonne',
    description: 'Recherche colocation à Bayonne, budget 400-500€ charges comprises. Ambiance conviviale, non-fumeur, disponible dès avril.',
    category: 'immo', subcategory: 'recherche_location', location: 'Bayonne',
    price: 500, surface: null, rooms: null, bedrooms: null, property_type: null, dpe: null,
    ownerName: 'Emma Robert',
  },
  {
    title: 'Recherche maison avec piscine Anglet',
    description: 'Recherche maison avec piscine à Anglet ou environs. Minimum 4 pièces, jardin clos. Budget jusqu\'à 550 000€.',
    category: 'immo', subcategory: 'recherche_achat', location: 'Anglet',
    price: 550000, surface: null, rooms: 4, bedrooms: 3, property_type: 'maison', dpe: null,
    ownerName: 'Sophie Michel',
  },
  {
    title: 'Recherche T2/T3 Hendaye ou St-Jean-de-Luz',
    description: 'Recherche T2 ou T3 à Hendaye ou Saint-Jean-de-Luz pour résidence secondaire. Budget max 300 000€, proche mer.',
    category: 'immo', subcategory: 'recherche_achat', location: 'Hendaye',
    price: 300000, surface: null, rooms: 3, bedrooms: null, property_type: 'appartement', dpe: null,
    ownerName: 'Julien Bertrand',
  },
]

const serviceListings: SeedListing[] = [
  {
    title: 'Plombier certifié RGE — Pays Basque',
    description: 'Plombier certifié RGE, intervention rapide sur tout le Pays Basque. Dépannage, installation, rénovation de salles de bain. Devis gratuit sous 24h.',
    category: 'service', subcategory: 'offre_service', location: 'Pays Basque',
    price: null, surface: null, rooms: null, property_type: null, dpe: null,
    ownerName: 'Jean-Marc Laporte',
  },
  {
    title: 'Électricien agréé — BAB',
    description: 'Électricien agréé, mise aux normes et installations neuves. Intervention sur Bayonne, Anglet, Biarritz. Certification Consuel, devis gratuit.',
    category: 'service', subcategory: 'offre_service', location: 'BAB',
    price: null, surface: null, rooms: null, property_type: null, dpe: null,
    ownerName: 'Patrick Souza',
  },
  {
    title: 'Peintre décorateur — Pays Basque',
    description: 'Artisan peintre décorateur, travaux intérieurs et extérieurs. Enduits décoratifs, papier peint, ravalement. Plus de 15 ans d\'expérience.',
    category: 'service', subcategory: 'offre_service', location: 'Pays Basque',
    price: null, surface: null, rooms: null, property_type: null, dpe: null,
    ownerName: 'Stéphane Blanc',
  },
  {
    title: 'Maçon rénovation — Pays Basque',
    description: 'Maçon spécialisé en rénovation du bâti ancien et extensions. Travaux de gros œuvre, pierre de taille, enduits à la chaux.',
    category: 'service', subcategory: 'offre_service', location: 'Pays Basque',
    price: null, surface: null, rooms: null, property_type: null, dpe: null,
    ownerName: 'Yannick Le Goff',
  },
  {
    title: 'Carreleur salle de bain/cuisine — BAB',
    description: 'Carreleur expérimenté, spécialisé salles de bain et cuisines. Pose de carrelage, faïence, mosaïque. Travail soigné et finitions impeccables.',
    category: 'service', subcategory: 'offre_service', location: 'BAB',
    price: null, surface: null, rooms: null, property_type: null, dpe: null,
    ownerName: 'Karim Benali',
  },
  {
    title: 'Menuisier sur mesure — Pays Basque',
    description: 'Menuisier ébéniste, fabrication et pose de cuisines, placards, escaliers sur mesure. Bois massif et dérivés. Atelier à Hasparren.',
    category: 'service', subcategory: 'offre_service', location: 'Pays Basque',
    price: null, surface: null, rooms: null, property_type: null, dpe: null,
    ownerName: 'Christophe Dumas',
  },
  {
    title: 'Couvreur/Zingueur — Pays Basque',
    description: 'Couvreur zingueur, réparation et réfection de toitures. Tuiles, ardoises, zinguerie, isolation. Intervention rapide en cas d\'urgence.',
    category: 'service', subcategory: 'offre_service', location: 'Pays Basque',
    price: null, surface: null, rooms: null, property_type: null, dpe: null,
    ownerName: 'Bruno Garcia',
  },
  {
    title: 'Architecte d\'intérieur — Côte Basque',
    description: 'Architecte d\'intérieur, conception et suivi de projets de rénovation. Optimisation d\'espace, choix de matériaux, coordination des corps de métier.',
    category: 'service', subcategory: 'offre_service', location: 'Côte Basque',
    price: null, surface: null, rooms: null, property_type: null, dpe: null,
    ownerName: 'Isabelle Moreau',
  },
  {
    title: 'Diagnostiqueur immobilier — BAB',
    description: 'Diagnostiqueur certifié, tous diagnostics immobiliers obligatoires : DPE, amiante, plomb, électricité, gaz. Rapport sous 48h.',
    category: 'service', subcategory: 'offre_service', location: 'BAB',
    price: null, surface: null, rooms: null, property_type: null, dpe: null,
    ownerName: 'Caroline Vidal',
  },
  {
    title: 'Déménagement local et national — BAB',
    description: 'Entreprise de déménagement, particuliers et professionnels. Devis gratuit, emballage, montage/démontage de meubles. Garde-meubles disponible.',
    category: 'service', subcategory: 'offre_service', location: 'BAB',
    price: null, surface: null, rooms: null, property_type: null, dpe: null,
    ownerName: 'Romain Duval',
  },
]

const demandeListings: SeedListing[] = [
  {
    title: 'Cherche plombier urgent fuite',
    description: 'Fuite d\'eau dans la salle de bain, besoin d\'un plombier en urgence. Disponible toute la semaine, merci de me contacter rapidement.',
    category: 'demande', subcategory: 'recherche_service', location: 'Bayonne',
    price: null, surface: null, rooms: null, property_type: null, dpe: null,
    ownerName: 'Marie Dupont',
  },
  {
    title: 'Cherche courtier premier achat',
    description: 'Premier achat immobilier, recherche un courtier pour m\'accompagner dans le montage du dossier de prêt. Budget achat : 250 000€.',
    category: 'demande', subcategory: 'recherche_service', location: 'Biarritz',
    price: null, surface: null, rooms: null, property_type: null, dpe: null,
    ownerName: 'Camille Petit',
  },
  {
    title: 'Cherche électricien mise aux normes',
    description: 'Appartement des années 70, besoin de mise aux normes électriques complète. Surface 65m², 3 pièces. Devis souhaité.',
    category: 'demande', subcategory: 'recherche_service', location: 'Anglet',
    price: null, surface: null, rooms: null, property_type: null, dpe: null,
    ownerName: 'Hugo Durand',
  },
  {
    title: 'Cherche peintre appartement 60m²',
    description: 'Recherche peintre pour rafraîchissement complet d\'un appartement de 60m². Murs et plafonds, 4 pièces. Disponibilité avril.',
    category: 'demande', subcategory: 'recherche_service', location: 'Bayonne',
    price: null, surface: null, rooms: null, property_type: null, dpe: null,
    ownerName: 'Léa Simon',
  },
  {
    title: 'Cherche architecte rénovation maison',
    description: 'Projet de rénovation complète d\'une maison de 120m². Recherche architecte pour conception, plans et suivi de chantier.',
    category: 'demande', subcategory: 'recherche_service', location: 'Biarritz',
    price: null, surface: null, rooms: null, property_type: null, dpe: null,
    ownerName: 'Antoine Laurent',
  },
  {
    title: 'Cherche déménageur fin mars',
    description: 'Déménagement prévu fin mars, T3 au 2ème étage sans ascenseur. Destination : Bayonne vers Anglet. Besoin d\'emballage.',
    category: 'demande', subcategory: 'recherche_service', location: 'Bayonne',
    price: null, surface: null, rooms: null, property_type: null, dpe: null,
    ownerName: 'Chloé Lefebvre',
  },
  {
    title: 'Cherche diagnostiqueur DPE',
    description: 'Vente d\'un appartement T2, besoin de DPE et diagnostics obligatoires. Disponible en semaine, appartement situé au centre d\'Anglet.',
    category: 'demande', subcategory: 'recherche_service', location: 'Anglet',
    price: null, surface: null, rooms: null, property_type: null, dpe: null,
    ownerName: 'Maxime Roux',
  },
  {
    title: 'Cherche carreleur salle de bain',
    description: 'Rénovation salle de bain, recherche carreleur pour pose de carrelage sol et mur. Surface environ 8m². Matériaux déjà achetés.',
    category: 'demande', subcategory: 'recherche_service', location: 'Boucau',
    price: null, surface: null, rooms: null, property_type: null, dpe: null,
    ownerName: 'Manon Giraud',
  },
  {
    title: 'Cherche maçon extension maison',
    description: 'Projet d\'extension de 30m² sur maison existante. Recherche maçon qualifié pour gros œuvre. Permis de construire obtenu.',
    category: 'demande', subcategory: 'recherche_service', location: 'Tarnos',
    price: null, surface: null, rooms: null, property_type: null, dpe: null,
    ownerName: 'Julien Bertrand',
  },
  {
    title: 'Cherche couvreur réparation toiture',
    description: 'Infiltrations après les dernières tempêtes, besoin d\'un couvreur pour inspection et réparation de la toiture. Maison individuelle.',
    category: 'demande', subcategory: 'recherche_service', location: 'Espelette',
    price: null, surface: null, rooms: null, property_type: null, dpe: null,
    ownerName: 'Sophie Michel',
  },
]

const allListings = [...immoListings, ...serviceListings, ...demandeListings]

// =============================================================================
// REVIEW DATA
// =============================================================================

interface SeedReview {
  reviewerName: string
  reviewedName: string
  rating: number
  comment: string
}

const reviewsData: SeedReview[] = [
  // Sophie Durand (agent) — 5 reviews
  { reviewerName: 'Marie Dupont', reviewedName: 'Sophie Durand', rating: 5, comment: 'Très professionnelle, accompagnement parfait du début à la fin. Je recommande vivement.' },
  { reviewerName: 'Thomas Bernard', reviewedName: 'Sophie Durand', rating: 5, comment: 'Sophie a trouvé notre appartement en moins de 2 semaines. Efficace et à l\'écoute.' },
  { reviewerName: 'Camille Petit', reviewedName: 'Sophie Durand', rating: 4, comment: 'Bon suivi du dossier, quelques délais mais résultat impeccable.' },
  { reviewerName: 'Hugo Durand', reviewedName: 'Sophie Durand', rating: 5, comment: 'Excellente connaissance du marché bayonnais. Négociation au top.' },
  { reviewerName: 'Léa Simon', reviewedName: 'Sophie Durand', rating: 4, comment: 'Réactive et disponible, même le week-end. Merci Sophie !' },

  // Jean-Marc Laporte (plombier) — 4 reviews
  { reviewerName: 'Pierre Moreau', reviewedName: 'Jean-Marc Laporte', rating: 5, comment: 'Intervention rapide pour une fuite urgente. Travail propre et soigné, tarif raisonnable.' },
  { reviewerName: 'Emma Robert', reviewedName: 'Jean-Marc Laporte', rating: 5, comment: 'Rénovation complète de la salle de bain, résultat magnifique. Artisan de confiance.' },
  { reviewerName: 'Lucas Garcia', reviewedName: 'Jean-Marc Laporte', rating: 4, comment: 'Bon travail, ponctuel et professionnel. Je referai appel à lui.' },
  { reviewerName: 'Antoine Laurent', reviewedName: 'Jean-Marc Laporte', rating: 5, comment: 'Excellent plombier, conseils pertinents et prix corrects. Recommandé par un voisin, pas déçu.' },

  // Nadia Kessler (courtier) — 4 reviews
  { reviewerName: 'Julie Martin', reviewedName: 'Nadia Kessler', rating: 5, comment: 'Nadia nous a obtenu un taux incroyable. Dossier monté en un temps record.' },
  { reviewerName: 'Manon Giraud', reviewedName: 'Nadia Kessler', rating: 5, comment: 'Accompagnement exceptionnel pour notre premier achat. Patiente et pédagogue.' },
  { reviewerName: 'Maxime Roux', reviewedName: 'Nadia Kessler', rating: 4, comment: 'Très bon courtier, a su négocier les meilleures conditions pour notre prêt.' },
  { reviewerName: 'Sophie Michel', reviewedName: 'Nadia Kessler', rating: 5, comment: 'Professionnelle et rassurante. Elle a géré tout le dossier de A à Z.' },

  // Stéphane Blanc (peintre) — 2 reviews
  { reviewerName: 'Chloé Lefebvre', reviewedName: 'Stéphane Blanc', rating: 5, comment: 'Travail impeccable, finitions soignées. Notre appartement est transformé.' },
  { reviewerName: 'Julien Bertrand', reviewedName: 'Stéphane Blanc', rating: 4, comment: 'Bon artisan, respecte les délais. Résultat conforme à nos attentes.' },

  // Isabelle Moreau (architecte) — 2 reviews
  { reviewerName: 'Hugo Durand', reviewedName: 'Isabelle Moreau', rating: 5, comment: 'Isabelle a complètement repensé notre intérieur. Créative et à l\'écoute de nos envies.' },
  { reviewerName: 'Camille Petit', reviewedName: 'Isabelle Moreau', rating: 5, comment: 'Projet de rénovation mené de main de maître. Budget respecté, résultat bluffant.' },

  // Caroline Vidal (diagnostiqueur) — 2 reviews
  { reviewerName: 'Marie Dupont', reviewedName: 'Caroline Vidal', rating: 5, comment: 'Diagnostics complets livrés en 48h. Rapport clair et détaillé.' },
  { reviewerName: 'Pierre Moreau', reviewedName: 'Caroline Vidal', rating: 4, comment: 'Professionnelle et ponctuelle. Bon rapport qualité-prix.' },

  // Yannick Le Goff (maçon) — 2 reviews
  { reviewerName: 'Antoine Laurent', reviewedName: 'Yannick Le Goff', rating: 5, comment: 'Extension de maison réalisée dans les règles de l\'art. Chantier propre et bien organisé.' },
  { reviewerName: 'Julien Bertrand', reviewedName: 'Yannick Le Goff', rating: 4, comment: 'Bon maçon, travail solide. Petit retard sur le planning mais résultat nickel.' },

  // Karim Benali (carreleur) — 1 review
  { reviewerName: 'Manon Giraud', reviewedName: 'Karim Benali', rating: 5, comment: 'Carrelage posé avec une précision millimétrique. Salle de bain sublime.' },

  // Christophe Dumas (menuisier) — 1 review
  { reviewerName: 'Emma Robert', reviewedName: 'Christophe Dumas', rating: 5, comment: 'Placards sur mesure parfaits. Bois de qualité et finitions irréprochables.' },

  // Marc Lefèvre (agent) — 1 review
  { reviewerName: 'Chloé Lefebvre', reviewedName: 'Marc Lefèvre', rating: 4, comment: 'Bonne connaissance du marché biarrot. Accompagnement sérieux.' },

  // Aurélie Martin (courtier) — 1 review
  { reviewerName: 'Lucas Garcia', reviewedName: 'Aurélie Martin', rating: 5, comment: 'Aurélie a trouvé le meilleur taux pour notre investissement locatif. Très réactive.' },

  // Romain Duval (déménageur) — 1 review
  { reviewerName: 'Thomas Bernard', reviewedName: 'Romain Duval', rating: 4, comment: 'Déménagement efficace, équipe sympathique. Rien de cassé, c\'est l\'essentiel !' },

  // Bruno Garcia (couvreur) — 1 review
  { reviewerName: 'Sophie Michel', reviewedName: 'Bruno Garcia', rating: 5, comment: 'Réparation de toiture après tempête, intervention rapide et efficace. Merci !' },

  // Sylvie Arnaud (notaire) — 1 review
  { reviewerName: 'Maxime Roux', reviewedName: 'Sylvie Arnaud', rating: 5, comment: 'Maître Arnaud est d\'une rigueur exemplaire. Signature chez le notaire sans aucun stress.' },
]

// =============================================================================
// POSTS DATA
// =============================================================================

interface SeedPost {
  authorName: string
  type: string
  content: string
  likes_count: number
  comments_count: number
}

const postsData: SeedPost[] = [
  // Milestones (3)
  { authorName: 'Sophie Durand', type: 'milestone', content: 'Vente signée ! T4 vue mer Biarritz — 380 000€. Félicitations aux nouveaux propriétaires ! Un projet mené en seulement 3 semaines, de la première visite à la signature.', likes_count: 23, comments_count: 7 },
  { authorName: 'Nadia Kessler', type: 'milestone', content: '100ème dossier traité cette année ! Merci à tous mes clients pour leur confiance. Le Pays Basque a la cote et les taux restent attractifs en ce début 2026.', likes_count: 18, comments_count: 5 },
  { authorName: 'François Dubois', type: 'milestone', content: 'Nouveau programme Anglet — 12 lots disponibles. Résidence "Les Jardins de Chiberta", livraison T4 2026. Du T2 au T4, à partir de 280 000€.', likes_count: 15, comments_count: 4 },

  // Updates (4)
  { authorName: 'Marc Lefèvre', type: 'update', content: 'Nouvelle annonce : maison avec jardin Anglet. 5 pièces, 120m², jardin arboré. Quartier résidentiel prisé, à deux pas des plages. Venez la découvrir !', likes_count: 12, comments_count: 3 },
  { authorName: 'Stéphane Blanc', type: 'update', content: 'Rénovation complète salle de bain — avant/après. Transformation totale en 10 jours : douche italienne, meuble vasque sur mesure, carrelage grand format.', likes_count: 21, comments_count: 6 },
  { authorName: 'Amélie Bonnet', type: 'update', content: 'Notre équipe s\'agrandit ! Bienvenue à Claire qui rejoint l\'agence pour couvrir le secteur de Saint-Jean-de-Luz et Ciboure. On est maintenant 4 !', likes_count: 9, comments_count: 2 },
  { authorName: 'Guillaume Mercier', type: 'update', content: 'Nouveau partenariat avec un constructeur local. Ensemble, nous proposons des projets clé en main : terrain + maison sur mesure à Anglet et environs.', likes_count: 7, comments_count: 1 },

  // Tips (4)
  { authorName: 'Aurélie Martin', type: 'tip', content: 'Taux immobiliers mars 2026 : le bon moment ? Les taux se stabilisent autour de 3,2% sur 20 ans. Pour les primo-accédants, le PTZ est renforcé dans les zones tendues comme le BAB.', likes_count: 25, comments_count: 8 },
  { authorName: 'Élodie Fournier', type: 'tip', content: '5 erreurs à éviter lors d\'un achat immo : 1) Ne pas faire de contre-visite 2) Négliger les charges de copro 3) Oublier les frais de notaire 4) Sous-estimer les travaux 5) Ne pas comparer les offres de prêt.', likes_count: 19, comments_count: 5 },
  { authorName: 'Nadia Kessler', type: 'tip', content: 'Comment bien préparer son dossier locataire : CDI ou 3 derniers bilans, 3 dernières fiches de paie, avis d\'imposition, pièce d\'identité, quittances actuelles. Anticipez !', likes_count: 14, comments_count: 3 },
  { authorName: 'Caroline Vidal', type: 'tip', content: 'DPE : ce qui change en 2026. Les logements classés G sont désormais interdits à la location. Le nouveau calcul prend mieux en compte les petites surfaces. Pensez à faire re-diagnostiquer.', likes_count: 22, comments_count: 6 },

  // Stories (4)
  { authorName: 'Camille Petit', type: 'story', content: 'On cherche notre premier appart à Bayonne ! Budget serré mais motivés. Si vous avez des bons plans T2/T3, on est preneurs. Le Petit Bayonne, ce serait le rêve.', likes_count: 11, comments_count: 4 },
  { authorName: 'Antoine Laurent', type: 'story', content: 'Visite d\'un terrain à Boucau ce matin. 600m², plat, bien orienté. On se projette déjà avec la maison dessus. Croisons les doigts pour l\'offre !', likes_count: 8, comments_count: 2 },
  { authorName: 'Léa Simon', type: 'story', content: 'Premier jour chez Howner — hâte de voir ! L\'appli a l\'air top pour trouver un studio étudiant. Si des propriétaires à Bayonne passent par là...', likes_count: 6, comments_count: 1 },
  { authorName: 'Manon Giraud', type: 'story', content: 'Recherche artisan pour rénovation cuisine. Notre cuisine date des années 80, on veut tout refaire : plomberie, électricité, meubles. Budget prévu : 15 000€.', likes_count: 5, comments_count: 3 },
]

// =============================================================================
// RESERVATION DATA
// =============================================================================

interface SeedReservation {
  listingTitle: string
  userName: string
  status: string
}

const reservationsData: SeedReservation[] = [
  // T3 vue mer Biarritz — 4 reservations
  { listingTitle: 'T3 vue mer Biarritz', userName: 'Camille Petit', status: 'active' },
  { listingTitle: 'T3 vue mer Biarritz', userName: 'Hugo Durand', status: 'active' },
  { listingTitle: 'T3 vue mer Biarritz', userName: 'Chloé Lefebvre', status: 'contacted' },
  { listingTitle: 'T3 vue mer Biarritz', userName: 'Antoine Laurent', status: 'active' },

  // T4 rénové Anglet — 3 reservations
  { listingTitle: 'T4 rénové Anglet', userName: 'Marie Dupont', status: 'active' },
  { listingTitle: 'T4 rénové Anglet', userName: 'Thomas Bernard', status: 'contacted' },
  { listingTitle: 'T4 rénové Anglet', userName: 'Julien Bertrand', status: 'active' },

  // Villa contemporaine Boucau — 2 reservations
  { listingTitle: 'Villa contemporaine Boucau', userName: 'Sophie Michel', status: 'active' },
  { listingTitle: 'Villa contemporaine Boucau', userName: 'Maxime Roux', status: 'active' },

  // Service reservations (RDV artisans) — 6
  { listingTitle: 'Plombier certifié RGE — Pays Basque', userName: 'Marie Dupont', status: 'active' },
  { listingTitle: 'Électricien agréé — BAB', userName: 'Hugo Durand', status: 'contacted' },
  { listingTitle: 'Peintre décorateur — Pays Basque', userName: 'Léa Simon', status: 'active' },
  { listingTitle: 'Carreleur salle de bain/cuisine — BAB', userName: 'Manon Giraud', status: 'active' },
  { listingTitle: 'Architecte d\'intérieur — Côte Basque', userName: 'Antoine Laurent', status: 'contacted' },
  { listingTitle: 'Déménagement local et national — BAB', userName: 'Chloé Lefebvre', status: 'active' },
]

// =============================================================================
// SEED ENDPOINT
// =============================================================================

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('key') !== SEED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // ─── Step 0: Clean existing seed data ───────────────────────────────
    // Delete in order respecting foreign keys
    // We identify seed data by phone numbers starting with +336100
    const { data: existingUsers } = await supabase
      .from('users')
      .select('id')
      .like('phone', '+336%')

    if (existingUsers && existingUsers.length > 0) {
      const userIds = existingUsers.map((u: { id: string }) => u.id)

      // Delete child records first
      // post_comments and post_likes for posts by these users
      const { data: existingPosts } = await supabase
        .from('posts')
        .select('id')
        .in('user_id', userIds)
      if (existingPosts && existingPosts.length > 0) {
        const postIds = existingPosts.map((p: { id: string }) => p.id)
        await supabase.from('post_comments').delete().in('post_id', postIds)
        await supabase.from('post_likes').delete().in('post_id', postIds)
      }

      // Messages in conversations involving these users
      const { data: existingConvA } = await supabase
        .from('conversations')
        .select('id')
        .in('user_a', userIds)
      const { data: existingConvB } = await supabase
        .from('conversations')
        .select('id')
        .in('user_b', userIds)
      const convIds = [
        ...(existingConvA || []).map((c: { id: string }) => c.id),
        ...(existingConvB || []).map((c: { id: string }) => c.id),
      ]
      if (convIds.length > 0) {
        await supabase.from('messages').delete().in('conversation_id', convIds)
      }
      await supabase.from('conversations').delete().in('user_a', userIds)
      await supabase.from('conversations').delete().in('user_b', userIds)

      // Listings by these users — need to clean reservations, credit_usage first
      const { data: existingListings } = await supabase
        .from('listings')
        .select('id')
        .in('user_id', userIds)
      if (existingListings && existingListings.length > 0) {
        const listingIds = existingListings.map((l: { id: string }) => l.id)
        await supabase.from('reservations').delete().in('listing_id', listingIds)
        await supabase.from('credit_usage').delete().in('listing_id', listingIds)
        await supabase.from('reviews').delete().in('listing_id', listingIds)
      }

      // Remaining child records
      await supabase.from('reservations').delete().in('user_id', userIds)
      await supabase.from('reviews').delete().in('reviewer_id', userIds)
      await supabase.from('reviews').delete().in('reviewed_id', userIds)
      await supabase.from('posts').delete().in('user_id', userIds)
      await supabase.from('credit_usage').delete().in('user_id', userIds)
      await supabase.from('credit_purchases').delete().in('user_id', userIds)
      await supabase.from('alerts').delete().in('user_id', userIds)
      await supabase.from('swipes').delete().in('swiper_id', userIds)
      await supabase.from('swipes').delete().in('swiped_id', userIds)
      await supabase.from('matches').delete().in('user_a', userIds)
      await supabase.from('matches').delete().in('user_b', userIds)
      await supabase.from('activity_log').delete().in('user_id', userIds)
      await supabase.from('listings').delete().in('user_id', userIds)
      await supabase.from('users').delete().in('id', userIds)
    }

    // ─── Step 1: Insert users ───────────────────────────────────────────
    const userRows = allUsers.map((u) => ({
      phone: u.phone,
      name: u.name,
      type: u.type,
      pro_category: u.pro_category || null,
      pro_specialty: u.pro_specialty || null,
      pro_zone: u.pro_zone || null,
      pro_rating: u.pro_rating || null,
      pro_transactions: u.pro_transactions || 0,
      tickets: u.tickets,
      credits: u.credits,
      referral_code: u.referral_code,
      free_listing_used: false,
      is_admin: false,
    }))

    const { data: insertedUsers, error: usersError } = await supabase
      .from('users')
      .upsert(userRows, { onConflict: 'phone' })
      .select('id, name, phone')

    if (usersError) throw new Error(`Users insert failed: ${usersError.message}`)
    if (!insertedUsers) throw new Error('No users returned after insert')

    // Build lookup maps
    const userByName = new Map<string, string>()
    for (const u of insertedUsers) {
      userByName.set(u.name, u.id)
    }

    // ─── Step 2: Insert listings ────────────────────────────────────────
    const listingRows = allListings.map((l) => {
      const userId = userByName.get(l.ownerName)
      if (!userId) throw new Error(`User not found for listing owner: ${l.ownerName}`)
      return {
        user_id: userId,
        category: l.category,
        subcategory: l.subcategory,
        title: l.title,
        description: l.description,
        location: l.location,
        price: l.price,
        surface: l.surface,
        rooms: l.rooms,
        is_boosted: l.is_boosted || false,
        boost_expires_at: l.boost_expires_at || null,
        alert_active: false,
        reservation_window_hours: 24,
        max_reservations: 5,
      }
    })

    const { data: insertedListings, error: listingsError } = await supabase
      .from('listings')
      .insert(listingRows)
      .select('id, title, user_id')

    if (listingsError) throw new Error(`Listings insert failed: ${listingsError.message}`)
    if (!insertedListings) throw new Error('No listings returned after insert')

    // Build listing lookup by title
    const listingByTitle = new Map<string, string>()
    for (const l of insertedListings) {
      listingByTitle.set(l.title, l.id)
    }

    // ─── Step 3: Insert reviews ─────────────────────────────────────────
    const reviewRows = reviewsData.map((r) => {
      const reviewerId = userByName.get(r.reviewerName)
      const reviewedId = userByName.get(r.reviewedName)
      if (!reviewerId) throw new Error(`Reviewer not found: ${r.reviewerName}`)
      if (!reviewedId) throw new Error(`Reviewed not found: ${r.reviewedName}`)
      return {
        reviewer_id: reviewerId,
        reviewed_id: reviewedId,
        rating: r.rating,
        comment: r.comment,
        created_at: pastDate(randomInt(1, 90)),
      }
    })

    const { data: insertedReviews, error: reviewsError } = await supabase
      .from('reviews')
      .insert(reviewRows)
      .select('id')

    if (reviewsError) throw new Error(`Reviews insert failed: ${reviewsError.message}`)

    // ─── Step 4: Insert posts ───────────────────────────────────────────
    const postRows = postsData.map((p) => {
      const userId = userByName.get(p.authorName)
      if (!userId) throw new Error(`Post author not found: ${p.authorName}`)
      return {
        user_id: userId,
        type: p.type,
        content: p.content,
        likes_count: p.likes_count,
        comments_count: p.comments_count,
        is_sponsored: false,
        created_at: pastDate(randomInt(0, 30)),
      }
    })

    const { data: insertedPosts, error: postsError } = await supabase
      .from('posts')
      .insert(postRows)
      .select('id')

    if (postsError) throw new Error(`Posts insert failed: ${postsError.message}`)

    // ─── Step 5: Insert reservations ────────────────────────────────────
    const reservationRows = reservationsData.map((r) => {
      const listingId = listingByTitle.get(r.listingTitle)
      const userId = userByName.get(r.userName)
      if (!listingId) throw new Error(`Listing not found for reservation: ${r.listingTitle}`)
      if (!userId) throw new Error(`User not found for reservation: ${r.userName}`)
      return {
        listing_id: listingId,
        user_id: userId,
        status: r.status,
        created_at: pastDate(randomInt(0, 14)),
      }
    })

    const { data: insertedReservations, error: reservationsError } = await supabase
      .from('reservations')
      .insert(reservationRows)
      .select('id')

    if (reservationsError) throw new Error(`Reservations insert failed: ${reservationsError.message}`)

    // ─── Step 6: Return stats ───────────────────────────────────────────
    return NextResponse.json({
      success: true,
      stats: {
        users: insertedUsers.length,
        listings: insertedListings.length,
        reviews: insertedReviews?.length || 0,
        posts: insertedPosts?.length || 0,
        reservations: insertedReservations?.length || 0,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Seed error:', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
