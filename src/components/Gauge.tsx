'use client'

const TOTAL_TICKETS = 200_000

export default function Gauge({ current }: { current: number }) {
  const percentage = Math.min((current / TOTAL_TICKETS) * 100, 100)

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-semibold">{current.toLocaleString('fr-FR')} tickets</span>
        <span className="text-gray-500">{TOTAL_TICKETS.toLocaleString('fr-FR')}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1 text-center">
        {percentage.toFixed(1)}% — Tirage au sort quand la jauge est pleine !
      </p>
    </div>
  )
}
