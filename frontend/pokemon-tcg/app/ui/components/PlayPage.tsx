'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

import { useSession } from 'next-auth/react'
import { useDecks } from '@/lib/hooks/useDecks'
import { Cards, Deck } from '@/lib/definitions'
import { useGameSocket } from '@/lib/hooks/useGameSocket'
import DeckSelector from './card-game/DeckSelector'
import GameBoard from './card-game/GameBoard'
import GameErrorBoundary from './card-game/GameErrorBoundary'
import WinnerModal from './card-game/WinnerModal'

function PlayPageContent() {

    const { data: session } = useSession()
    const { decks, selectedDeck, isLoading, setSelectedDeck } = useDecks()
    const {
        connected,
        waitingForOpponent,
        playerHand,
        opponentHandSize,
        activePokemon,
        opponentActive,
        turn,
        socketStatus,
        joinGame,
        playCard,
        selectActiveCard,
        endTurn,
        leaveGame,
        isAttackPhase,
        hasAttacked,
        attack,
        lastAttack,
        resolveKO,
        koCue,
        opponentOut,
        iAmOut,
        error,
        clearError
    } = useGameSocket()
    const [showWinner, setShowWinner] = useState(false)
    const [winner, setWinner] = useState<'me' | 'opponent' | null>(null)


    useEffect(() => {
        // Only react to opponent being KO'd
        if (koCue?.side !== 'opponent') return

        // Wait for faint animation + their chance to promote a new active
        const t = setTimeout(() => {
            if (!opponentActive) {
                console.log('[WINCHECK] Opponent failed to promote a new active → YOU WIN')
                setWinner('me')
                setShowWinner(true)
            }
        }, 2200) // 0.28s animation + buffer

        return () => clearTimeout(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [koCue?.nonce]) // fire once per KO event

    useEffect(() => {
        if (opponentOut) {
            setWinner('me')
            setShowWinner(true)
        }
    }, [opponentOut])

    useEffect(() => {
        if (iAmOut) {
            setWinner('opponent')
            setShowWinner(true)
        }
    }, [iAmOut])

    useEffect(() => {
        if (!connected) {
            prevFlags.current = {
                myAlive: true,
                oppAlive: true,
            }
        }
    }, [connected])

    // win/lose effect
    // helper lives outside effects so it runs each render
    const isAlive = (c: Cards | null | undefined) =>
        !!c && ((c?.currentHp ?? c?.card?.hp ?? 0) > 0) && c?.status !== 'ko'

    // Derived each render
    const myAliveFromHand = playerHand.some(isAlive)
    const myActiveAlive = isAlive(activePokemon)
    const myAlive = myAliveFromHand || myActiveAlive

    // Opponent: we only know active + hand size
    const oppActiveAlive = isAlive(opponentActive)
    const oppAlive = oppActiveAlive || opponentHandSize > 0


    // Open modal only when we *enter* a terminal state
    const prevFlags = React.useRef<{ myAlive: boolean; oppAlive: boolean } | null>(null)
    useEffect(() => {
        const prev = prevFlags.current
        prevFlags.current = { myAlive, oppAlive }

        // on first render, don't trigger
        if (!prev) return

        const justLost = prev.myAlive && !myAlive && oppAlive
        const justWon = prev.oppAlive && !oppAlive && myAlive

        if (justLost) {
            console.log('[WINCHECK] -> YOU LOSE (transition detected)')
            setWinner('opponent')
            setShowWinner(true)
        } else if (justWon) {
            console.log('[WINCHECK] -> YOU WIN (transition detected)')
            setWinner('me')
            setShowWinner(true)
        }
    }, [myAlive, oppAlive])

    const handleDeckSelect = (deck: Deck) => {
        setSelectedDeck(deck)
    }

    const handleJoinGame = () => {
        console.log("hanle join game triggered", selectedDeck)
        if (selectedDeck) {
            joinGame(selectedDeck)
        }
    }
    const handlePlayAgain = () => {
        // Clear winner modal first
        setShowWinner(false)
        setWinner(null)
        prevFlags.current = {
            myAlive: true,
            oppAlive: true,
        }
        // Delay leave + redirect so state resets before unmount
        setTimeout(() => {
            leaveGame()  // will reset useSocket state
            window.location.href = '/play'
        }, 100)
    }

    return (
        <section className="min-h-[calc(100vh-105px)] text-base-content flex flex-col justify-center items-center p-8">
            <div className="text-center max-w-3xl">
                <div className='flex flex-row gap-4'>
                    {/* Connection Status */}
                    <div className="absolute top-4 left-4 mt-16 text-sm opacity-80 px-3 py-1.5 rounded-md bg-base-200 dark:bg-base-300 shadow">
                        WebSocket: {socketStatus}
                    </div>

                    {/* Leave Game Button */}
                    {connected && (
                        <button
                            onClick={() => leaveGame()}
                            className="absolute top-4 left-80 mt-16 z-50 btn btn-sm btn-error"
                        >
                            Leave Match
                        </button>
                    )}
                </div>
                {/* Welcome Screen */}
                {!connected && (
                    <>
                        <motion.h1
                            className="text-4xl dark:text-white md:text-6xl font-bold mb-4 drop-shadow-lg"
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                        >
                            It&apos;s Time to Duel!
                        </motion.h1>

                        <motion.p
                            className="text-lg md:text-xl mb-6 dark:text-white"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 1 }}
                        >
                            Ready to test your deck? Connect to the battle server and face off against another trainer in real-time!
                        </motion.p>
                    </>
                )}

                {/* Deck Selection */}
                {!selectedDeck && !connected && (
                    <DeckSelector
                        decks={decks}
                        onDeckSelect={handleDeckSelect}
                        isLoading={isLoading}
                    />
                )}

                {/* Selected Deck Confirmation */}
                {selectedDeck && !connected && (
                    <div className="mt-6 flex flex-col items-center">
                        <h3 className="text-lg font-semibold">
                            Ready to battle with &quot;{selectedDeck.name}&quot;?
                        </h3>
                        <div className='flex flex-row gap-4'>
                            <button
                                className="btn btn-success mt-2"
                                onClick={handleJoinGame}
                            >
                                🎮 Start Match
                            </button>
                            <button
                                className="btn btn-outline mt-2"
                                onClick={() => setSelectedDeck(null)}
                            >
                                🔄 Choose Another Deck
                            </button>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="text-black-500 text-lg p-2">
                        <h3 className="text-lg font-semibold">
                            {error}
                        </h3>

                        <button
                            className="btn btn-outline mt-2"
                            onClick={() => { setSelectedDeck(null); clearError(); leaveGame() }}
                        >
                            🔄 Choose Another Deck
                        </button>
                    </div>
                )}

                {/* Waiting for Opponent */}
                {connected && waitingForOpponent && (
                    <div className="mt-10 text-center space-y-4">
                        <h2 className="text-2xl font-semibold text-white">
                            ⏳ Waiting for opponent...
                        </h2>
                        <p className="text-white/70">
                            Sit tight! We&apos;ll start the duel once another trainer joins.
                        </p>
                    </div>
                )}

                {/* Game Board */}
                {connected && playerHand.length > 0 && (
                    <GameBoard
                        playerHand={playerHand}
                        opponentHandSize={opponentHandSize}
                        activePokemon={activePokemon}
                        opponentActive={opponentActive}
                        turn={turn}
                        onPlayCard={playCard}
                        onSelectActiveCard={selectActiveCard}
                        onEndTurn={endTurn}
                        isAttackPhase={isAttackPhase}
                        hasAttacked={hasAttacked}
                        attack={attack}
                        lastAttack={lastAttack}
                        resolveKO={resolveKO}
                        koCue={koCue}
                    />
                )}
            </div>
            <WinnerModal
                show={showWinner}
                winner={winner ?? 'me'}
                winningPokemon={winner === 'me' ? activePokemon : opponentActive}
                onPlayAgain={() => {

                    handlePlayAgain()
                }}
            />

        </section>
    )
}

export default function PlayPage() {
    return (
        <GameErrorBoundary>
            <PlayPageContent />
        </GameErrorBoundary>
    )
}
