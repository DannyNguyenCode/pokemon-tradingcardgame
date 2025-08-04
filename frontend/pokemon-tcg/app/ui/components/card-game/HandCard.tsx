'use client'

import React from 'react'
import { Cards } from '@/lib/definitions'
import GameCard from './GameCard'

interface HandCardProps {
    card: Cards
    onClick?: (card: Cards) => void
    selectActiveCard?: (card: Cards) => void
    isOpponent?: boolean
    isDisabled?: boolean
    isActivePokemon?: boolean
}

const HandCard = ({
    card,
    onClick,
    selectActiveCard,
    isOpponent = false,
    isDisabled = false,
    isActivePokemon = false,
}: HandCardProps) => {
    const handleClick = () => {
        console.log(`🎯 HandCard clicked: ${card.card.name}, isOpponent: ${isOpponent}, isDisabled: ${isDisabled}`)
        if (!isOpponent && !isDisabled) {
            if (selectActiveCard) {
                console.log(`🎯 Calling selectActiveCard for: ${card.card.name}`)
                selectActiveCard(card)
            } else if (onClick) {
                console.log(`🎯 Calling onClick for: ${card.card.name}`)
                onClick(card)
            }
        }
    }

    return (
        <div
            className={`transition-transform transform relative
                ${!isOpponent && !isDisabled ? 'hover:scale-110 hover:-translate-y-2 cursor-pointer' : ''}
                ${isActivePokemon ? 'ring-4 ring-yellow-400 ring-opacity-75' : ''}
            `}
            onClick={handleClick}
        >
            {isActivePokemon && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-1 py-0.5 rounded-full font-bold z-20">
                    ACTIVE
                </div>
            )}
            <GameCard
                card={card}
                isDisabled={isDisabled}
                isActive={!isOpponent}
                size='md'

            />
        </div>
    )
}

export default HandCard
