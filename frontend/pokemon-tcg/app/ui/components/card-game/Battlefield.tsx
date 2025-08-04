'use client'
import React, { useEffect, useState } from 'react'
import GameCard from './GameCard'
import { Cards } from '@/lib/definitions'
import { motion, useAnimation } from 'framer-motion'

type AttackCue = {
    by: 'me' | 'opponent';
    damage: number;
    nonce: number
    koCue?: KOCue                 // NEW
    onKOComplete?: (side: 'me' | 'opponent') => void // NEW
}
type KOCue = { side: 'me' | 'opponent'; cardId: string; nonce: number }
interface BattlefieldProps {
    activePokemon: Cards | null
    opponentActive: Cards | null
    onSelectActive?: (card: Cards) => void
    isPlayerTurn?: boolean
    turn: 'me' | 'opponent' | null
    attackCue?: AttackCue
    koCue?: KOCue
    onKOComplete?: (side: 'me' | 'opponent') => void

}

export default function Battlefield({
    activePokemon,
    opponentActive,
    turn,
    attackCue,
    onKOComplete,
    koCue
}: BattlefieldProps) {
    const isMyTurn = turn === 'me'

    // Anim controllers
    const meCtrl = useAnimation()
    const oppCtrl = useAnimation()
    const isKo = (c?: Cards | null) => !!c && ((c.currentHp ?? c.card.hp) <= 0 || c.status === 'ko')
    const activeKo = isKo(activePokemon)
    const opponentKo = isKo(opponentActive)

    // Damage pop
    const [popKey, setPopKey] = useState(0)
    const [popText, setPopText] = useState<string | null>(null)

    // Run attack animation on cue
    useEffect(() => {
        if (!attackCue) return
        const fromMe = attackCue.by === 'me'
        const attacker = fromMe ? meCtrl : oppCtrl
        const defender = fromMe ? oppCtrl : meCtrl

            ; (async () => {
                // Attacker lunges horizontally toward center (you: +x, opponent: -x)
                await attacker.start({
                    scale: 1.06,
                    x: fromMe ? 10 : -10,
                    transition: { duration: 0.12 }
                })
                await attacker.start({ scale: 1, x: 0, transition: { duration: 0.12 } })

                // Show damage pop on impact
                setPopText(`-${attackCue.damage}`)
                setPopKey(k => k + 1)

                // Defender flash + horizontal shake
                await defender.start({
                    filter: ['brightness(1)', 'brightness(1.8)', 'brightness(1)'],
                    x: [0, -6, 6, -4, 4, 0],
                    transition: { duration: 0.28 }
                })

                // Clear pop shortly after
                setTimeout(() => setPopText(null), 360)
            })()
    }, [attackCue, meCtrl, oppCtrl])
    useEffect(() => {
        if (!koCue) return
        const forMe = koCue.side === 'me'
        const ctrl = forMe ? meCtrl : oppCtrl;

        (async () => {
            // Faint: quick dim + drop + slight rotate
            await ctrl.start({
                opacity: [1, 0.7, 0.6],
                y: [0, 10, 12],
                rotate: [0, forMe ? -2 : 2, 0],
                transition: { duration: 0.28, ease: 'easeOut' }
            })
            // Let the visual settle a hair
            await new Promise(r => setTimeout(r, 60))
            onKOComplete?.(koCue.side) // triggers the move (BF → hand)
            // Reset controller so next time starts clean
            ctrl.start({ opacity: 1, y: 0, rotate: 0, transition: { duration: 0.01 } })
        })()
    }, [koCue, meCtrl, oppCtrl, onKOComplete])
    useEffect(() => {
        // Clear any lingering damage pop when active Pokémon changes
        setPopText(null)
    }, [activePokemon?.card_id, opponentActive?.card_id])
    return (
        <div className="relative w-full rounded-xl shadow-lg border border-gray-700 overflow-hidden mb-4">
            {/* Arena background: left (you) → right (opponent) */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 via-gray-900 to-rose-900" />
            {/* Optional subtle pattern */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: "url('/pokeball-pattern.svg')",
                    backgroundSize: '80px 80px',
                    backgroundRepeat: 'repeat'
                }}
            />
            {/* Diagonal divider */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-1/2 top-0 w-[2px] h-full bg-gradient-to-b from-emerald-300/50 via-yellow-300/60 to-rose-300/50 rotate-6 origin-top" />
            </div>

            <div className="relative p-6">
                <div className="grid grid-cols-2 gap-4 items-center">
                    {/* Left: You */}
                    <div className="flex flex-col items-start">
                        <p className={`text-lg font-bold mb-3 ${isMyTurn ? 'text-emerald-300' : 'text-gray-400'}`}>
                            You {isMyTurn ? '🟢' : ''}
                        </p>

                        {activePokemon ? (
                            <motion.div
                                key={activePokemon.card_id}
                                layoutId={`me-${activePokemon.card_id}`}
                                transition={{ type: 'spring', damping: 22, stiffness: 260 }}
                                initial={false}
                                animate={meCtrl}
                                style={activeKo ? { filter: 'grayscale(100%)', opacity: 0.6, pointerEvents: 'none' } : undefined}

                                className={`relative scale-90 ${isMyTurn ? 'ring-4 ring-yellow-400 ring-opacity-80 rounded-lg' : ''}`}
                            >
                                {/* Soft base glow on your turn */}
                                {isMyTurn && (
                                    <span className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-2 rounded-full bg-yellow-300/30 blur-sm" />
                                )}
                                <GameCard card={activePokemon} isDisabled isActive={false} />

                                {/* Damage pop when opponent hits you */}
                                {popText && attackCue?.by === 'opponent' && (
                                    <motion.div
                                        key={`me-pop-${popKey}`}
                                        initial={{ y: 8, opacity: 0 }}
                                        animate={{ y: -18, opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className="absolute -top-2 left-1/2 -translate-x-1/2 text-rose-300 font-bold drop-shadow"
                                    >
                                        {popText}
                                    </motion.div>
                                )}
                            </motion.div>
                        ) : (
                            <EmptySlot label={isMyTurn ? 'Select from hand' : 'Waiting...'} color="emerald" align="left" />
                        )}
                    </div>

                    {/* Right: Opponent */}
                    <div className="flex flex-col items-end">
                        <p className={`text-lg font-bold mb-3 ${!isMyTurn ? 'text-rose-300' : 'text-gray-400'}`}>
                            Opponent {!isMyTurn ? '🎯' : ''}
                        </p>

                        {opponentActive ? (
                            <motion.div
                                key={opponentActive.card_id}
                                layoutId={`opponent-${opponentActive.card_id}`}
                                transition={{ type: 'spring', damping: 22, stiffness: 260 }}
                                initial={false}
                                animate={oppCtrl}
                                style={opponentKo ? { filter: 'grayscale(100%)', opacity: 0.6, pointerEvents: 'none' } : undefined}

                                className="relative scale-90"
                            >
                                <GameCard card={opponentActive} isDisabled isActive={false} />

                                {/* Damage pop when you hit opponent */}
                                {popText && attackCue?.by === 'me' && (
                                    <motion.div
                                        key={`opp-pop-${popKey}`}
                                        initial={{ y: 8, opacity: 0 }}
                                        animate={{ y: -18, opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className="absolute -top-2 left-1/2 -translate-x-1/2 text-rose-300 font-bold drop-shadow"
                                    >
                                        {popText}
                                    </motion.div>
                                )}
                            </motion.div>
                        ) : (
                            <EmptySlot label="Waiting..." color="rose" align="right" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function EmptySlot({
    label,
    color,
    align
}: {
    label: string
    color: 'emerald' | 'rose'
    align: 'left' | 'right'
}) {
    const border =
        color === 'emerald' ? 'border-emerald-400 text-emerald-300' : 'border-rose-400 text-rose-300'
    const justify = align === 'left' ? 'justify-start' : 'justify-end'
    return (
        <div className={`w-full flex ${justify}`}>
            <div
                className={`w-24 h-36 flex items-center justify-center border-2 border-dashed rounded-lg text-xs ${border} bg-black/20 backdrop-blur-sm`}
            >
                {label}
            </div>
        </div>
    )
}
