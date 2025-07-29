import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import { randomUUID } from 'crypto' // Built-in for UUID generation

dotenv.config()

const app = express()
app.use(cors())

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
})

// In-memory store
const matches = new Map() // matchId -> { id, players: [ { userId, socketId } ] }
const socketToMatch = new Map() // socket.id -> matchId
const socketToUser = new Map()  // socket.id -> userId

io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`)

    socket.on('join_match', ({ userId, deck }) => {
        socketToUser.set(socket.id, userId)

        // Check for any waiting match
        const waitingMatch = Array.from(matches.values()).find(m => m.players.length === 1)

        if (waitingMatch) {
            // Join existing match
            const matchId = waitingMatch.id
            waitingMatch.players.push({ userId, socketId: socket.id })
            socketToMatch.set(socket.id, matchId)
            socket.join(matchId)

            const player1 = waitingMatch.players[0]
            const player2 = waitingMatch.players[1]

            console.log(`✅ Match ready: ${matchId} (${player1.userId} vs ${player2.userId})`)

            // Notify both players
            io.to(matchId).emit('match_ready', {
                matchId,
                players: [player1.userId, player2.userId],
                firstTurn: Math.random() < 0.5 ? 'you' : 'opponent',
                yourHand: deck?.cards?.slice(0, 5) || [],
                opponentHandSize: 5,
            })
        } else {
            // Create new match and wait
            const matchId = randomUUID()
            const newMatch = {
                id: matchId,
                players: [{ userId, socketId: socket.id }],
            }
            matches.set(matchId, newMatch)
            socketToMatch.set(socket.id, matchId)
            socket.join(matchId)
            console.log(`⏳ Waiting for opponent in match ${matchId}`)

            socket.emit('joined_match', { success: true, matchId })
        }
    })

    socket.on('play_card', ({ cardId }) => {
        const matchId = socketToMatch.get(socket.id)
        const userId = socketToUser.get(socket.id)
        if (!matchId || !userId || !matches.has(matchId)) return

        console.log(`🃏 ${userId} played card ${cardId} in match ${matchId}`)

        // Notify opponent
        socket.to(matchId).emit('card_played', {
            userId,
            card: { cardId }, // Add other card props if needed
        })

        socket.emit('opponent_draw_card')
    })

    socket.on('disconnect', () => {
        const matchId = socketToMatch.get(socket.id)
        const userId = socketToUser.get(socket.id)

        if (matchId && matches.has(matchId)) {
            const match = matches.get(matchId)
            if (match) {
                match.players = match.players.filter(p => p.socketId !== socket.id)

                if (match.players.length === 0) {
                    matches.delete(matchId)
                } else {
                    io.to(matchId).emit('player_left', { userId })
                }
            }
        }

        socketToMatch.delete(socket.id)
        socketToUser.delete(socket.id)
        console.log(`❌ Client disconnected: ${socket.id}`)
    })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
    console.log(`🚀 Game server running on http://localhost:${PORT}`)
})
