'use client'

import { CREDIT_PACKS } from '@/lib/stripe'

export default function TicketShop() {
  const handleBuy = async (packId: string) => {
    const res = await fetch('/api/credits/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packId }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {CREDIT_PACKS.map((pack) => (
        <div
          key={pack.id}
          className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition"
        >
          <h3 className="font-bold text-lg mb-1">{pack.name}</h3>
          <p className="text-3xl font-bold text-blue-600 mb-2">{pack.priceLabel}</p>
          <p className="text-sm text-gray-500 mb-4">
            {pack.credits} crédit{pack.credits > 1 ? 's' : ''} + {pack.tickets} ticket{pack.tickets > 1 ? 's' : ''} bonus
          </p>
          <button
            onClick={() => handleBuy(pack.id)}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Acheter
          </button>
        </div>
      ))}
    </div>
  )
}
