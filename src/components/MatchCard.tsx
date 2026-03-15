'use client'

import { User } from '@/types'

interface MatchCardProps {
  user: User
  onSwipe: (direction: 'left' | 'right') => void
}

export default function MatchCard({ user, onSwipe }: MatchCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
        {user.name.charAt(0).toUpperCase()}
      </div>
      <h3 className="text-xl font-bold text-center">{user.name}</h3>
      <p className="text-gray-500 text-center capitalize mb-6">{user.type}</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => onSwipe('left')}
          className="w-14 h-14 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-2xl hover:bg-red-200 transition"
        >
          ✕
        </button>
        <button
          onClick={() => onSwipe('right')}
          className="w-14 h-14 rounded-full bg-green-100 text-green-500 flex items-center justify-center text-2xl hover:bg-green-200 transition"
        >
          ♥
        </button>
      </div>
    </div>
  )
}
