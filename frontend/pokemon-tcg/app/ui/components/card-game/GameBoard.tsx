'use client'
import React from 'react'
import { Cards } from '@/lib/definitions'
import Battlefield from './Battlefield'
import PlayerHand from './PlayerHand'
import EndTurnButton from './EndTurnButton'
import AttackBtn from './AttackBtn'
import { LayoutGroup } from 'framer-motion'

type KOCue = { side: 'me' | 'opponent'; cardId: string; nonce: number }
interface GameBoardProps {
    playerHand: Cards[]
    opponentHandSize: number
    activePokemon: Cards | null
    opponentActive: Cards | null
    turn: 'me' | 'opponent' | null
    onPlayCard: (card: Cards) => void
    onSelectActiveCard: (card: Cards) => void
    onEndTurn: () => void
    isAttackPhase: boolean
    hasAttacked: boolean
    attack: (activePokemon: Cards | null, opponentActive: Cards | null) => void
    lastAttack?: { by: 'me' | 'opponent'; damage: number; nonce: number };
    onKnockout?: (card: Cards) => void
    koCue?: KOCue                 // NEW
    onKOComplete?: (side: 'me' | 'opponent') => void // NEW
    resolveKO: (side: 'me' | 'opponent') => void
}

export default function GameBoard({
    playerHand,
    activePokemon,
    opponentActive,
    turn,
    onPlayCard,
    onSelectActiveCard,
    onEndTurn,
    isAttackPhase,
    hasAttacked,
    attack,
    lastAttack,
    koCue,
    resolveKO
}: GameBoardProps) {
    const isMyTurn = turn === 'me'
    const hasActivePokemon = !!activePokemon
    const [koOverlay, setKoOverlay] = React.useState<Cards[]>([])

    React.useEffect(() => {
        if (!activePokemon) return
        const hp = (activePokemon.currentHp ?? activePokemon.card.hp)
        if (hp > 0 && activePokemon.status !== 'ko') return

        // Prevent duplicate pushes if parent hasn’t re-rendered yet
        const alreadyAdded = koOverlay.some(k => k.card_id === activePokemon.card_id)
        if (!alreadyAdded) {
            setKoOverlay(prev => [{ ...activePokemon, currentHp: 0, status: 'ko' }, ...prev])

        }
    }, [activePokemon?.card_id, activePokemon?.currentHp, activePokemon?.status, activePokemon, koOverlay])
    return (
        <LayoutGroup id="battle-layout">
            <div className="mt-8 w-full flex flex-col gap-4 items-center">
                <h2 className="text-lg font-semibold">
                    {turn === 'me' ? '🟢 Your Turn' : '🕓 Opponent Turn'} - {isAttackPhase ? 'Attack Phase' : 'Select Phase'}
                </h2>

                {/* <OpponentHand opponentHandSize={opponentHandSize} /> */}

                <Battlefield
                    activePokemon={activePokemon}
                    opponentActive={opponentActive}
                    turn={turn}
                    attackCue={lastAttack}
                    koCue={koCue}
                    onKOComplete={resolveKO}
                />

                <PlayerHand
                    playerHand={playerHand}
                    playCard={onPlayCard}
                    selectActiveCard={onSelectActiveCard}
                    activePokemon={activePokemon}
                    hasAttacked={hasAttacked}
                />
                <div className='flex flex-row justify-center w-full gap-8'>
                    <EndTurnButton
                        onEndTurn={onEndTurn}
                        isMyTurn={isMyTurn}
                        hasActivePokemon={hasActivePokemon}
                    />
                    <AttackBtn
                        attack={attack}
                        hasAttacked={hasAttacked}
                        opponentActive={opponentActive}
                        activePokemon={activePokemon}
                        isMyTurn={isMyTurn}
                        hasActivePokemon={hasActivePokemon}
                        isAttackPhase={isAttackPhase}
                    />

                </div>
            </div>
        </LayoutGroup>
    )
} 