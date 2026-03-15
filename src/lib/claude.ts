import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const AI_SERVICES = [
  { id: 'search_buy', name: 'Recherche de biens IA', description: 'L\'IA analyse vos critères et sélectionne les meilleures opportunités' },
  { id: 'search_rent', name: 'Recherche location IA', description: 'Sélectionne les meilleurs biens locatifs selon vos critères' },
  { id: 'search_artisan', name: 'Recherche artisan IA', description: 'Trouve le bon artisan selon votre projet, zone et avis' },
  { id: 'bank_file', name: 'Dossier bancaire IA', description: 'Monte un dossier de financement complet' },
  { id: 'quote_analysis', name: 'Analyse de devis', description: 'Compare chaque ligne de votre devis aux prix du marché' },
  { id: 'property_analysis', name: 'Analyse de bien', description: 'Estimation DVF, quartier, rentabilité, plus-value' },
] as const
