'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { io, Socket } from 'socket.io-client'
import { Deck, Cards } from '@/lib/definitions'
import { useSession } from 'next-auth/react'
export default function PlayPage() {
    const [decks, setDecks] = useState<Deck[]>([])
    const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
    const { data: session } = useSession()
    const router = useRouter()
    const socketRef = useRef<Socket | null>(null)
    const [socketStatus, setSocketStatus] = useState('🔴 Not connected')
    const [connected, setConnected] = useState(false)
    const [playerHand, setPlayerHand] = useState<Cards[]>([])
    const [opponentHandSize, setOpponentHandSize] = useState(0)
    const [board, setBoard] = useState<{ player: Cards[]; opponent: Cards[] }>({
        player: [],
        opponent: [],
    })
    const [turn, setTurn] = useState<'me' | 'opponent' | null>(null)
    useEffect(() => {
        const fetchDecks = async () => {
            if (!session?.user?.id) return
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/decks/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`
                }
            })
            const json = await response.json()
            setDecks(json.data)
        }
        fetchDecks()
    }, [session])
    useEffect(() => {
        if (!socketRef.current) return

        socketRef.current.on('match_end', ({ matchId, message }) => {
            console.log(`🛑 Match ${matchId} ended: ${message}`)
            // Maybe route to history or show toast
        })

        return () => {
            socketRef.current?.off('match_end')
        }
    }, [])

    const playCard = (card: Cards) => {
        if (turn !== 'me') return

        socketRef.current?.emit('play_card', { cardId: card.card_id })

        setPlayerHand((prev) => prev.filter(c => c.card_id !== card.card_id))
        setBoard((prev) => ({
            ...prev,
            player: [...prev.player, card],
        }))
        setTurn('opponent')
    }

    const joinGame = () => {
        if (!connected) {
            const socket = io('http://localhost:3001')
            socketRef.current = socket

            // Setup listeners ONCE
            socket.on('match_ready', (data) => {
                setOpponentHandSize(data.opponentHandSize)
                setPlayerHand(data.yourHand)
                setBoard({ player: [], opponent: [] })
                setTurn(data.firstTurn === 'you' ? 'me' : 'opponent')
            })


            socket.on('card_played', ({ card }) => {
                setBoard((prev) => ({
                    ...prev,
                    opponent: [...prev.opponent, card],
                }))
                setTurn('me')
            })
            socket.on('opponent_draw_card', () => {
                setOpponentHandSize((prev) => prev + 1)
            })
            socket.on('opponent_card_played', (card) => {
                setOpponentHandSize((prev) => Math.max(0, prev - 1))
                setBoard((prev) => ({
                    ...prev,
                    opponent: [...prev.opponent, card],
                }))
            })

            socket.on('match_event', (data) => {
                console.log('🎮 Server event:', data)
            })

            socket.on('disconnect', () => {
                setConnected(false)
                setSocketStatus('🔴 Disconnected from server')
            })

            socket.on('connect_error', () => {
                setSocketStatus('⚠️ Connection error')
            })

            // Only emit after connection established
            socket.on('connect', () => {
                setConnected(true)
                setSocketStatus('🟢 Connected to game server')
                socket.emit('join_match', {
                    userId: session?.user?.id,
                    deck: selectedDeck,
                })
                console.log("board", board)
            })
        }
    }



    return (
        <section className="min-h-[calc(100vh-105px)] bg-gradient-to-br from-[#6390F0] via-[#EE8130] to-[#F7D02C] text-base-content  flex flex-col justify-center items-center p-8">
            <div className="text-center max-w-3xl">
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

                <motion.div
                    className="flex gap-4 justify-center mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 1 }}
                >
                </motion.div>
                <div className="absolute top-4 left-4 mt-16 text-sm opacity-80 px-3 py-1 rounded-md bg-base-200 dark:bg-base-300 shadow">
                    WebSocket: {socketStatus}
                </div>

                {!selectedDeck && !connected && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        {decks.map((deck) => (
                            <div
                                key={deck.id}
                                className="card bg-gradient-to-r from-[#A8A77A] via-[#EE8130] to-[#6390F0] shadow-xl hover:scale-105 transition-transform"
                            >
                                <div className="card-body items-center text-center">
                                    <h2 className="card-title text-xl font-bold uppercase tracking-wider">{deck.name}</h2>
                                    <p className="text-sm opacity-90">{deck.cards.length} cards in this deck</p>
                                    <div className="card-actions mt-4">
                                        <button
                                            onClick={() => setSelectedDeck(deck)}
                                            className="btn btn-outline border-white text-white hover:bg-white hover:text-black"
                                        >
                                            🔥 Choose
                                        </button>
                                        <button
                                            onClick={() => router.push(`/collection`)}
                                            className="btn btn-ghost text-sm text-white hover:text-yellow-200"
                                        >
                                            ✏️ Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                )}
                {selectedDeck && !connected && (
                    <div className="mt-6 flex flex-col items-center">
                        <h3 className="text-lg font-semibold">Ready to battle with &quot;{selectedDeck.name}&quot;?</h3>
                        <div className='flex flex-row gap-4'>
                            <button className="btn btn-success mt-2" onClick={joinGame}>
                                🎮 Start Match
                            </button>
                            <button className="btn btn-outline mt-2" onClick={() => setSelectedDeck(null)}>
                                🔄 Choose Another Deck
                            </button>
                        </div>
                    </div>
                )}

                {connected && playerHand.length > 0 && (
                    <div className="mt-8 w-full flex flex-col gap-4 items-center">
                        <h2 className="text-xl font-semibold">
                            {turn === 'me' ? '🟢 Your Turn' : '🕓 Opponent Turn'}
                        </h2>

                        <div className="flex flex-col items-center gap-2">
                            <p>Opponent&apos;s Hand</p>
                            <div className="flex gap-2">
                                {Array.from({ length: opponentHandSize }).map((_, idx) => (
                                    <div key={idx} className="card w-16 h-24 bg-neutral text-neutral-content flex items-center justify-center">
                                        🎴
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="divider">VS</div>

                        {/* Player hand */}
                        <div className="flex flex-col items-center gap-2">
                            <p>Your Hand</p>
                            <div className="flex gap-2">
                                {playerHand.map((card, idx) => (
                                    <button
                                        key={idx}
                                        className="card w-24 h-36 bg-base-200 text-xs hover:scale-105 transition"
                                        onClick={() => playCard(card)}
                                    >
                                        {card.card.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
