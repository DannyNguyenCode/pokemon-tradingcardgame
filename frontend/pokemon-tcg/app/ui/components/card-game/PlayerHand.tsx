'use client'

import React from 'react'
import { Cards } from '@/lib/definitions'
import HandCard from './HandCard'
import { motion } from 'framer-motion'
type PlayerHandProps = {
    playerHand: Cards[]
    playCard?: (card: Cards) => void
    selectActiveCard?: (card: Cards) => void
    isOpponent?: boolean
    activePokemon?: Cards | null
    hasAttacked: boolean
}

const PlayerHand = ({
    playerHand,
    playCard,
    selectActiveCard,
    isOpponent = false,
    activePokemon = null,
    hasAttacked
}: PlayerHandProps) => {
    return (
        <div className="flex flex-col items-center gap-2">
            <p>{isOpponent ? "Opponent's Hand" : 'Your Hand'}</p>
            <div className="flex flex-row gap-2">
                {playerHand.map((card) => {
                    const hp = (card.currentHp ?? card.card?.hp) ?? 0
                    const isKo = card.status === 'ko' || hp <= 0

                    const handlePlay = (c: Cards) => {
                        if (isKo) return
                        playCard?.(c)
                    }
                    const handleSelect = (c: Cards) => {
                        if (isKo) return
                        selectActiveCard?.(c)
                    }

                    return (
                        <motion.div
                            key={card.card_id}
                            layoutId={`me-${card.card_id}`}
                            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                            className={`relative ${isKo ? 'grayscale opacity-60 pointer-events-none' : ''}`}
                        >
                            <HandCard
                                key={card.card_id}
                                card={card}
                                onClick={handlePlay}
                                selectActiveCard={handleSelect}
                                isOpponent={isOpponent}
                                isActivePokemon={activePokemon?.card_id === card.card_id}
                                isDisabled={hasAttacked}
                            />
                            {isKo && (
                                <span className="absolute -top-1 -right-1 bg-gray-800/90 text-gray-200 text-[10px] px-1.5 py-0.5 rounded">
                                    KO
                                </span>
                            )}
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}

export default PlayerHand
