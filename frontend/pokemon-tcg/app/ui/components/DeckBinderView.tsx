'use client'
import React from 'react'
import { Pokemon } from '@/lib/definitions'
import PopCard from './PopCard'

type Props = {
    decks: { id: string; name: string }[]
    selectedDeckId: string
    onDeckChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    available: Pokemon[]
    selected: Pokemon[]
    setAvailable: (pokemon: Pokemon[]) => void
    setSelected: (pokemon: Pokemon[]) => void
    onSave: () => void
    onCancel: () => void
    maxCards?: number
}

const DeckBinderView = ({
    decks,
    selectedDeckId,
    onDeckChange,
    available,
    selected,
    setAvailable,
    setSelected,
    onSave,
    onCancel,
    maxCards = 20,
}: Props) => {
    const isSelected = (poke: Pokemon) =>
        selected.some(p => p.id === poke.id)

    const handleToggle = (poke: Pokemon) => {
        if (isSelected(poke)) {
            setSelected(selected.filter(p => p.id !== poke.id))
            setAvailable([...available, poke])
        } else {
            if (selected.length < maxCards) {
                setSelected([...selected, poke])
                setAvailable(available.filter(p => p.id !== poke.id))
            }
        }
    }

    return (
        <div className="flex w-full gap-4">
            {/* Sidebar */}
            <div className="w-64 bg-base-200 p-4 rounded shadow flex flex-col gap-4">
                <select
                    className="select select-sm w-full"
                    value={selectedDeckId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onDeckChange(e)}
                >
                    <option disabled value="">
                        Select Deck
                    </option>
                    {decks.map(deck => (
                        <option key={deck.id} value={deck.id}>
                            {deck.name}
                        </option>
                    ))}
                </select>

                <button className="btn btn-primary btn-sm" onClick={onSave}>
                    Save ({selected.length}/{maxCards})
                </button>
                <button className="btn btn-secondary btn-sm" onClick={onCancel}>
                    Cancel
                </button>
                {selected.map((pokemon => {
                    return (
                        <PopCard key={pokemon.id} pokemon={pokemon} isAvailable={false} onToggle={handleToggle} />
                    )
                }))}
            </div>

            {/* Binder grid */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-7 gap-2">
                {available.map(poke => {

                    return (
                        <PopCard key={poke.id} pokemon={poke} isAvailable={true} onToggle={handleToggle} />
                    )
                })}
            </div>
        </div>
    )
}

export default DeckBinderView
