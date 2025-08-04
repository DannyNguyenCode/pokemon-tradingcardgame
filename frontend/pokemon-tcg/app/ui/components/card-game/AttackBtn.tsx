
'use client'
import React from 'react'
import { Cards } from '@/lib/definitions'

interface AttackBtnProps {
    attack: (activePokemon: Cards | null, opponentActive: Cards | null) => void
    isMyTurn: boolean
    hasActivePokemon: boolean
    disabled?: boolean
    isAttackPhase: boolean
    opponentActive: Cards | null
    activePokemon: Cards | null
    hasAttacked: boolean
}

const AttackBtn = ({
    attack,
    isMyTurn,
    hasActivePokemon,
    disabled = false,
    isAttackPhase,
    opponentActive,
    activePokemon,
    hasAttacked
}: AttackBtnProps) => {
    // Defensive HP check — rely on HP, not status strings that might be undefined
    const hp =
        (activePokemon?.currentHp ??
            activePokemon?.card?.hp ??
            0)

    // Keep the predicate clear and forgiving. If your rules require an opponent target, leave the "!!opponentActive" in.
    const canAttack =
        isMyTurn &&
        isAttackPhase &&
        !hasAttacked &&
        !!activePokemon &&
        hp > 0 &&
        !!opponentActive && // remove this if attacking with no target is allowed
        !disabled &&
        hasActivePokemon // keep this as the high-level gate passed from GameBoard

    const handleClick = () => {
        if (!canAttack) return
        attack(activePokemon, opponentActive)
    }

    return (
        <div className="flex justify-center mt-4">
            <button
                onClick={handleClick}
                disabled={!canAttack}
                className={`btn btn-lg transition-all duration-300 ${canAttack ? 'btn-primary hover:btn-secondary' : 'btn-disabled opacity-50'
                    }`}
            >
                ⚔ Attack
            </button>
        </div>
    )
}

export default AttackBtn
