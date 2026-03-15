import { Listing } from '@/types'

export default function ListingCard({ listing }: { listing: Listing }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-400">
        <span className="text-4xl">🏠</span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">
            {listing.type}
          </span>
          {listing.is_native && (
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-600 text-white">
              HOWNER PRO
            </span>
          )}
          {!listing.is_native && (
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500 capitalize">
              {listing.source}
            </span>
          )}
        </div>
        <h3 className="font-bold text-lg mb-1 line-clamp-1">{listing.title}</h3>
        <p className="text-gray-500 text-sm mb-2">{listing.location}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">
            {listing.price.toLocaleString('fr-FR')} €
          </span>
          <span className="text-sm text-gray-500">
            {listing.surface} m² · {listing.rooms} pièce{listing.rooms > 1 ? 's' : ''}
          </span>
        </div>
        {listing.external_url && (
          <a
            href={listing.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-center text-sm text-blue-600 hover:underline"
          >
            Voir sur {listing.source} →
          </a>
        )}
      </div>
    </div>
  )
}
