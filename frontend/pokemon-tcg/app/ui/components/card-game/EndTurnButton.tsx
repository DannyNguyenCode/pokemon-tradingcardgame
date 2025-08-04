'use client'

import React from 'react'

interface EndTurnButtonProps {
    onEndTurn: () => void
    isMyTurn: boolean
    hasActivePokemon: boolean
    disabled?: boolean
}

export default function EndTurnButton({
    onEndTurn,
    isMyTurn,
    hasActivePokemon,
    disabled = false
}: EndTurnButtonProps) {
    const canEndTurn = isMyTurn && hasActivePokemon && !disabled

    return (
        <div className="flex justify-center mt-4">
            <button
                onClick={onEndTurn}
                disabled={!canEndTurn}
                className={`btn btn-lg transition-all duration-300 ${canEndTurn
                    ? 'btn-primary hover:btn-secondary'
                    : 'btn-disabled opacity-50'
                    }`}
            >
                {isMyTurn ? (
                    hasActivePokemon ? (
                        <>
                            🔄 End Turn
                            <span className="ml-2 text-sm opacity-75">
                                (Pass to opponent)
                            </span>
                        </>
                    ) : (
                        <>
                            ⏳ Select Active Pokémon
                            <span className="ml-2 text-sm opacity-75">
                                (Choose a card first)
                            </span>
                        </>
                    )
                ) : (
                    <>
                        🕓 Opponent&apos;s Turn
                        <span className="ml-2 text-sm opacity-75">
                            (Waiting...)
                        </span>
                    </>
                )}
            </button>
        </div>
    )
} 