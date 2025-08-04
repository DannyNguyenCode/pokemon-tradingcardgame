'use client'
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Cards } from '@/lib/definitions'
import { Options } from 'canvas-confetti'

interface WinnerModalProps {
    show: boolean
    winner: 'me' | 'opponent'
    winningPokemon?: Cards | null
    onPlayAgain: () => void
}

export default function WinnerModal({ show, winner, winningPokemon, onPlayAgain }: WinnerModalProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    // Fire confetti on open (win only)
    useEffect(() => {
        let dispose = () => { }
        let rafId: number | null = null

        const run = async () => {
            if (!show) return
            // dynamic import to avoid SSR issues
            const confetti = (await import('canvas-confetti')).default

            const canvas = canvasRef.current
            if (!canvas) return

            const myConfetti = confetti.create(canvas, { resize: true, useWorker: true })
            dispose = () => {
                // no explicit dispose API; just clear animation frames
                if (rafId) cancelAnimationFrame(rafId)
            }
            if (winner === 'me') {
                // A couple of quick celebratory bursts
                const burst = (originX: number) =>
                    myConfetti({
                        particleCount: 80,
                        startVelocity: 45,
                        spread: 70,
                        ticks: 200,
                        origin: { x: originX, y: 0.6 },
                        scalar: 0.9,
                    })

                burst(0.3)
                burst(0.7)

                // trailing gentle stream for ~1s
                const end = Date.now() + 1000
                const frame = () => {
                    myConfetti({
                        particleCount: 6,
                        startVelocity: 35,
                        spread: 60,
                        origin: { x: Math.random() * 0.6 + 0.2, y: 0.3 },
                        scalar: 0.8,
                    })
                    if (Date.now() < end) rafId = requestAnimationFrame(frame)
                }
                rafId = requestAnimationFrame(frame)
            } else {
                // Subtle loss drizzle: sparse, slow, grey, light gravity
                const end = Date.now() + 1500
                const frame = () => {
                    myConfetti({
                        particleCount: 3,
                        startVelocity: 12,
                        spread: 35,
                        gravity: 0.9,
                        ticks: 250,
                        origin: { x: Math.random() * 0.6 + 0.2, y: 0 },
                        scalar: 0.7,
                        colors: ['#999999', '#bbbbbb', '#cccccc', '#dddddd'],
                    } satisfies Options)
                    if (Date.now() < end) rafId = requestAnimationFrame(frame)
                }
                rafId = requestAnimationFrame(frame)
            }

        }

        run()
        return () => dispose()
    }, [show, winner])

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Confetti canvas (positioned behind card content) */}
                    <div className="absolute inset-0 pointer-events-none">
                        <canvas ref={canvasRef} className="w-full h-full" />
                    </div>

                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="relative bg-gradient-to-b from-yellow-200 to-yellow-500 border-4 border-yellow-300 rounded-xl p-8 shadow-2xl text-center max-w-lg w-full"
                    >
                        <h2 className={`text-4xl font-bold mb-4 ${winner === 'me' ? 'text-green-700' : 'text-red-700'}`}>
                            {winner === 'me' ? '🏆 You Win!' : '💀 You Lose...'}
                        </h2>

                        {winningPokemon && (
                            <div className="mb-4 flex justify-center">
                                <Image
                                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${winningPokemon.card.collector_number}.png`}
                                    alt={winningPokemon.card.name}
                                    width={200}
                                    height={200}
                                    className={`${winner !== 'me' ? 'grayscale opacity-50' : ''}`}
                                />
                            </div>
                        )}

                        <p className="mb-6 text-lg font-medium text-gray-800">
                            {winner === 'me'
                                ? 'Your Pokémon fought bravely and emerged victorious!'
                                : 'All your Pokémon have fainted... better luck next time!'}
                        </p>

                        <button
                            onClick={() => {
                                onPlayAgain()
                            }}
                            className="btn btn-lg btn-primary"
                        >
                            🔄 Play Again
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
