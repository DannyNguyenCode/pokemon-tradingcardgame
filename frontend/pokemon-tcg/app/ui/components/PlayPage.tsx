'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { io, Socket } from 'socket.io-client'
export default function PlayPage() {
    const router = useRouter()
    const socketRef = useRef<Socket | null>(null)
    const [socketStatus, setSocketStatus] = useState('🔴 Not connected')
    const [connected, setConnected] = useState(false)

    const joinGame = () => {
        if (!connected) {
            const socket = io('http://localhost:3001') // <-- Your Socket.IO server URL
            socketRef.current = socket

            socket.on('connect', () => {
                setConnected(true)
                setSocketStatus('🟢 Connected to game server')
                socket.emit('join_match', { userId: 'example_user' })
            })

            socket.on('disconnect', () => {
                setConnected(false)
                setSocketStatus('🔴 Disconnected from server')
            })

            socket.on('connect_error', () => {
                setSocketStatus('⚠️ Connection error')
            })

            socket.on('match_event', (data) => {
                console.log('🎮 Server event:', data)
            })
        }
    }

    return (
        <section className="min-h-[calc(100vh-105px)] bg-gradient-to-br from-[#6390F0] via-[#EE8130] to-[#F7D02C] text-base-content dark:text-white flex flex-col justify-center items-center p-8">
            <div className="text-center max-w-3xl">
                <motion.h1
                    className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    It&apos;s Time to Duel!
                </motion.h1>

                <motion.p
                    className="text-lg md:text-xl mb-6"
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
                    <button
                        onClick={joinGame}
                        disabled={connected}
                        className="btn btn-success"
                    >
                        {connected ? '🟢 In Match' : '🎮 Join Match'}
                    </button>
                    <button
                        onClick={() => router.push('/collection')}
                        className="btn btn-outline btn-accent"
                    >
                        🧵 Edit Deck
                    </button>
                </motion.div>

                <div className="text-sm opacity-80">
                    WebSocket Status: {socketStatus}
                </div>
            </div>
        </section>
    )
}
