import express from 'express'
import http from 'http'
import { Server } from "socket.io";
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
})
const matches = {} // matchId -> Set of userIds
const socketToMatch = {} // socket.id -> matchId
const socketToUser = {}  // socket.id -> userId

io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`)
    socket.on('join_match', ({ matchId, userId }) => {
        console.log(`📥 ${userId} joined match: ${matchId}`)
        socketToMatch[socket.id] = matchId
        socketToUser[socket.id] = userId
        if (!matches[matchId]) {
            matches[matchId] = new Set()
        }
        matches[matchId].add(userId)
        socket.join(matchId)
        socket.to(matchId).emit('player_joined', { userId })
        socket.emit('joined_match', { success: true, matchId })
    })
    socket.on('play_card', ({ matchId, userId, card }) => {
        console.log(`🃏 ${userId} played card ${card.cardId} in match ${matchId}`)

        // Optional: Validate user belongs to this match
        if (!matches[matchId] || !matches[matchId].has(userId)) {
            console.warn(`⚠️ Invalid play_card from ${userId} — not in match ${matchId}`)
            return
        }

        // Broadcast to others in the match
        socket.to(matchId).emit('card_played', {
            userId,
            card
        })
    })

    socket.on('disconnect', () => {

        const matchId = socketToMatch[socket.id]
        const userId = socketToUser[socket.id]

        if (matchId && userId) {
            console.log(`🚪 ${userId} disconnected from match ${matchId}`)

            // Remove from match
            matches[matchId]?.delete(userId)

            // If no one left, clean up match
            if (matches[matchId]?.size === 0) {
                delete matches[matchId]
            }

            // Notify others
            socket.to(matchId).emit('player_left', { userId })
        }

        // Cleanup mappings
        delete socketToMatch[socket.id]
        delete socketToUser[socket.id]
        console.log(`❌ Client disconnected: ${socket.id}`)
    })
})
const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
    console.log(`🚀 Game server running on http://localhost:${PORT}`)
})