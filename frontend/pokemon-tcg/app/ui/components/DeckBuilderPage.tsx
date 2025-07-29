'use client'

import { useState, useEffect } from 'react'
import { Deck, Pokemon, Cards } from '@/lib/definitions'
import { useSession } from 'next-auth/react'
import CreateDeckModal from '../components/CreateDeckModal'
import FlipCard from '../components/FlipCard'
import { useAppDispatch } from '@/lib/hooks'
import { loadToastifyState } from '@/lib/features/toastify/toastifySlice'

export default function DeckBuilderPage({ allPokemonList }: { allPokemonList: Pokemon[] }) {
    const { data: session, status } = useSession()
    const dispatch = useAppDispatch()
    const [decks, setDecks] = useState<Deck[]>([])
    const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
    const [available, setAvailable] = useState<Pokemon[]>([])
    const [deckCards, setDeckCards] = useState<Pokemon[]>([])
    const [loading, setLoading] = useState(false)

    // 🧩 Fetch user's decks
    useEffect(() => {
        const fetchDecks = async () => {
            if (status !== 'authenticated') return
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/decks/`, {
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`
                }
            })
            const data = await res.json()
            setDecks(data.data || [])
        }

        fetchDecks()
    }, [status])

    // 🧩 When deck selected, load its cards
    const handleDeckSelect = async (deck: Deck) => {
        setSelectedDeck(deck)
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/decks/${deck.id}`, {
            headers: {
                'Authorization': `Bearer ${session?.accessToken}`
            }
        })
        const data = await res.json()
        const selected = data.data.cards.map((c: Cards) => c.card)
        setDeckCards(selected)
        setAvailable(allPokemonList.filter(p => !selected.some((s: { id: string }) => s.id === p.id)))
    }

    const handleAdd = (poke: Pokemon) => {
        setDeckCards(prev => [...prev, poke])
        setAvailable(prev => prev.filter(p => p.id !== poke.id))
    }

    const handleRemove = (poke: Pokemon) => {
        setDeckCards(prev => prev.filter(p => p.id !== poke.id))
        setAvailable(prev => [...prev, poke])
    }

    const handleSave = async () => {
        const ids = deckCards.map(p => p.id)
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/deck-cards/${selectedDeck?.id}/replace`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`
            },
            body: JSON.stringify({ card_ids: ids })
        })
        const data = await res.json()
        dispatch(loadToastifyState(data.message))
    }

    const handleCancel = () => {
        handleDeckSelect(selectedDeck!)
    }

    const handleCreate = () => {
        setSelectedDeck(null)
        setDeckCards([])
        setAvailable(allPokemonList)
    }

    return (
        <div className="p-4 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">🎴 Deck Builder</h1>
                <CreateDeckModal onCreate={handleCreate} />
            </div>

            {/* 🧠 Deck List */}
            {decks.length === 0 ? (
                <div className="text-center text-lg mt-10">
                    <p>No decks yet. Start building your Pokémon dream team!</p>
                </div>
            ) : (
                <div className="flex gap-4 flex-wrap">
                    {decks.map(deck => (
                        <div
                            key={deck.id}
                            className={`card w-64 bg-base-200 shadow-xl ${selectedDeck?.id === deck.id ? 'border-2 border-accent' : ''}`}
                        >
                            <div className="card-body">
                                <h2 className="card-title">{deck.name}</h2>
                                <p>{deck.cards.length} cards</p>
                                <div className="card-actions justify-end">
                                    <button onClick={() => handleDeckSelect(deck)} className="btn btn-outline btn-sm">
                                        Select
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedDeck && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    {/* 🧩 Available Pokémon */}
                    <div className="space-y-2">
                        <h2 className="text-lg font-bold">Available Pokémon</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[500px] overflow-y-auto">
                            {available.map(p => (
                                <FlipCard
                                    key={p.id}
                                    pokemon={p}
                                    isInteractive
                                    isAvailable
                                    handleAdd={handleAdd}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 🧩 Deck Pokémon */}
                    <div className="space-y-2 col-span-1 md:col-span-2">
                        <h2 className="text-lg font-bold">Deck Pokémon</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[500px] overflow-y-auto">
                            {deckCards.map(p => (
                                <FlipCard
                                    key={p.id}
                                    pokemon={p}
                                    isInteractive
                                    isAvailable={false}
                                    handleRemove={handleRemove}
                                />
                            ))}
                        </div>

                        {/* 🧩 Save + Cancel */}
                        <div className="mt-4 flex gap-4">
                            <button className="btn btn-accent" onClick={handleSave}>
                                💾 Save Deck
                            </button>
                            <button className="btn btn-outline" onClick={handleCancel}>
                                ↩️ Cancel Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
