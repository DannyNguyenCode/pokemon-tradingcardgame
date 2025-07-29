'use client'
import React from 'react'
import { Deck, DeckCardsResponse } from '@/lib/definitions'
const DeckSelect = ({ onDeckSelect, selectDeck, deckCardResponse }: { onDeckSelect: (deckId: string) => void, selectDeck: Deck | null, deckCardResponse: DeckCardsResponse }) => {
    return (
        <div>
            <div className="flex flex-wrap filter mb-4">
                <input
                    className="btn filter-reset"
                    onChange={() => onDeckSelect('')}
                    type="radio"
                    name="deckSelect"
                    aria-label="All"
                    checked={!selectDeck}
                />
                {deckCardResponse.data.length > 0 && deckCardResponse.data.map(deck => (
                    <input
                        key={deck.id}
                        onChange={() => onDeckSelect(deck.id)}
                        className="btn"
                        value={deck.name}
                        type="radio"
                        name="deckSelect"
                        aria-label={deck.name}
                        checked={selectDeck?.id === deck.id}
                    />
                ))}



            </div></div>
    )
}

export default DeckSelect