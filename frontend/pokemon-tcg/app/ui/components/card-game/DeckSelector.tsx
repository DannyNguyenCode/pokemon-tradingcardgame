'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Deck } from '@/lib/definitions'

interface DeckSelectorProps {
    decks: Deck[]
    onDeckSelect: (deck: Deck) => void
    isLoading?: boolean
}

export default function DeckSelector({ decks, onDeckSelect, isLoading = false }: DeckSelectorProps) {
    const router = useRouter()

    if (isLoading) {
        return (
            <div className="mt-8 flex justify-center">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        )
    }

    if (decks.length === 0) {
        return (
            <div className="mt-10 text-center space-y-6">
                <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                    🧩 No Decks Found
                </h2>
                <p className="text-lg text-white/80">
                    Looks like you haven&apos;t built a deck yet. Head to your collection and start building your ultimate Pokémon team!
                </p>
                <button
                    onClick={() => router.push('/collection')}
                    className="btn btn-accent btn-lg hover:scale-105 transition-transform shadow-md"
                >
                    ➕ Build Your First Deck
                </button>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {decks.map((deck) => (
                <motion.div
                    key={deck.id}
                    className="card bg-gradient-to-r from-[#A8A77A] via-[#EE8130] to-[#6390F0] shadow-xl hover:scale-105 transition-transform"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="card-body items-center text-center">
                        <h2 className="card-title text-xl font-bold uppercase tracking-wider">{deck.name}</h2>
                        <p className="text-sm opacity-90">{deck.cards.length} cards in this deck</p>
                        <div className="card-actions mt-4">
                            <button
                                onClick={() => onDeckSelect(deck)}
                                className="btn btn-outline border-white text-white hover:bg-white hover:text-black"
                            >
                                🔥 Choose
                            </button>
                            <button
                                onClick={() => router.push(`/collection`)}
                                className="btn btn-ghost text-sm text-white hover:text-yellow-200"
                            >
                                ✏️ Edit
                            </button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
} 