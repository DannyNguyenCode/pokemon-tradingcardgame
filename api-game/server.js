import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import { randomUUID } from 'crypto'

dotenv.config()

const app = express()
app.use(cors({
    origin: "https://pokemon-tradingcardgame.vercel.app", // Match exactly
    credentials: true
}))


const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "https://pokemon-tradingcardgame.vercel.app", // Exact frontend domain
        methods: ['GET', 'POST'],
        credentials: true,
    },
})


// Game constants
const INITIAL_HAND_SIZE = 5
const MAX_PLAYERS_PER_MATCH = 2

// In-memory store with better structure
const matches = new Map() // matchId -> Match
const socketToMatch = new Map() // socket.id -> matchId
const socketToUser = new Map()  // socket.id -> userId

// Types
class Match {
    constructor(id, player1) {
        this.id = id
        this.players = [player1]
        this.createdAt = Date.now()
        this.status = 'waiting' // waiting, active, finished
        this.activeCards = new Map()
        this.phase = 'select'//select,attack
    }

    addPlayer(player) {
        if (this.players.length >= MAX_PLAYERS_PER_MATCH) {
            throw new Error('Match is full')
        }
        this.players.push(player)
        if (this.players.length === MAX_PLAYERS_PER_MATCH) {
            this.status = 'active'
        }
    }

    removePlayer(socketId) {
        this.players = this.players.filter(p => p.socketId !== socketId)
        if (this.players.length === 0) {
            this.status = 'finished'
        }
    }

    getOpponent(socketId) {
        return this.players.find(p => p.socketId !== socketId)
    }

    getPlayer(socketId) {
        return this.players.find(p => p.socketId === socketId)
    }
    setActiveCard(userId, card) {
        this.activeCards.set(userId, card)
    }

    getActiveCard(userId) {
        return this.activeCards.get(userId)
    }
}

// Utility functions
function validateDeck(deck) {
    if (!deck || !deck.cards || !Array.isArray(deck.cards)) {
        throw new Error('Invalid deck structure')
    }
    if (deck.cards.length < INITIAL_HAND_SIZE) {
        throw new Error('Deck must have at least 5 cards')
    }
    return true
}

function getInitialHand(deck) {
    return deck.cards.slice(0, INITIAL_HAND_SIZE)
}

function cleanupMatch(matchId) {
    const match = matches.get(matchId)
    if (match && match.players.length === 0) {
        matches.delete(matchId)
        console.log(`🗑️ Cleaned up empty match: ${matchId}`)
    }
}

function handlePlayerDisconnect(socketId) {
    const matchId = socketToMatch.get(socketId)
    const userId = socketToUser.get(socketId)

    if (matchId && matches.has(matchId)) {
        const match = matches.get(matchId)
        if (match) {
            match.removePlayer(socketId)

            const remainingPlayers = match.players.length
            if (remainingPlayers === 1) {
                const opponent = match.players[0]
                io.to(opponent.socketId).emit('match_end', {
                    matchId,
                    message: `🏆 You win! Your opponent (${userId}) left the match.`,
                })
            } else if (remainingPlayers === 0) {
                cleanupMatch(matchId)
            }
        }
    }

    socketToMatch.delete(socketId)
    socketToUser.delete(socketId)
    console.log(`❌ Client disconnected: ${socketId}`)
}

// Socket connection handler
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`)

    socket.on('join_match', ({ userId, deck }) => {
        console.log('Server received join_match:', { userId, deck })

        try {
            // Validate input
            if (!userId) {
                socket.emit('error', { message: 'User ID is required' })
                return
            }

            validateDeck(deck)

            if (!deck || deck.length < 5) {
                socket.emit('match_error', { message: 'Deck must contain at least 5 Pokémon to start a match.' })
                return
            }

            socketToUser.set(socket.id, userId)

            // Look for an available match with 1 player
            const waitingMatch = Array.from(matches.values()).find(m =>
                m.players.length === 1 && m.status === 'waiting'
            )

            if (waitingMatch) {
                const matchId = waitingMatch.id
                const player2 = { userId, socketId: socket.id, deck }

                waitingMatch.addPlayer(player2)
                socketToMatch.set(socket.id, matchId)
                socket.join(matchId)

                const player1 = waitingMatch.players[0]

                console.log(`✅ Match ready: ${matchId}`)
                console.log(`   Player 1: ${player1.userId} (${player1.socketId})`)
                console.log(`   Player 2: ${player2.userId} (${player2.socketId})`)
                console.log(`   First turn: ${Math.random() < 0.5 ? 'Player 1' : 'Player 2'}`)

                const player1Hand = getInitialHand(player1.deck)
                const player2Hand = getInitialHand(player2.deck)
                const firstTurn = Math.random() < 0.5 ? 'you' : 'opponent'

                // Send to player1
                io.to(player1.socketId).emit('match_ready', {
                    matchId,
                    players: [player1.userId, player2.userId],
                    yourHand: player1Hand,
                    opponentHandSize: player2Hand.length,
                    firstTurn: firstTurn === 'you' ? 'you' : 'opponent',
                    board: {
                        player: player1Hand.map(card => ({
                            ...card,
                            currentHp: card.hp,
                            status: null
                        })),
                        opponent: player2Hand.map(card => ({
                            card_id: card.card_id,
                            currentHp: card.hp
                        }))
                    }
                })

                // Send to player2
                io.to(player2.socketId).emit('match_ready', {
                    matchId,
                    players: [player1.userId, player2.userId],
                    yourHand: player2Hand,
                    opponentHandSize: player1Hand.length,
                    firstTurn: firstTurn === 'opponent' ? 'you' : 'opponent',
                    board: {
                        player: player2Hand.map(card => ({
                            ...card,
                            currentHp: card.hp,
                            status: null
                        })),
                        opponent: player1Hand.map(card => ({
                            card_id: card.card_id,
                            currentHp: card.hp
                        }))
                    }
                })



            } else {
                // Create new match
                const matchId = randomUUID()
                const player1 = { userId, socketId: socket.id, deck }
                const newMatch = new Match(matchId, player1)

                matches.set(matchId, newMatch)
                socketToMatch.set(socket.id, matchId)
                socket.join(matchId)

                console.log(`⏳ Waiting for opponent in match ${matchId}`)
                socket.emit('joined_match', { success: true, matchId })
            }
        } catch (error) {
            console.error('❌ Error joining match:', error.message)
            socket.emit('error', { message: error.message })
        }
    })
    socket.on('active_card_chosen', ({ userId, card }) => {
        const matchId = socketToMatch.get(socket.id)
        const match = matches.get(matchId)
        if (!match) return

        // Ensure top-level currentHp exists (not nested in card.card)
        card.currentHp = card.currentHp ?? card.card?.hp

        // Persist this as the user's current active on the server
        match.setActiveCard(userId, card)

        const [player1, player2] = match.players

        io.to(matchId).emit('active_card_chosen', {
            activeCards: {
                [player1.userId]: match.getActiveCard(player1.userId),
                [player2.userId]: match.getActiveCard(player2.userId)
            }
        })
    })

    socket.on('choose_active_card', ({ userId, card }) => {
        try {
            const matchId = socketToMatch.get(socket.id)
            if (!matchId || !matches.has(matchId)) {
                socket.emit('error', { message: 'Not in a valid match' })
                return
            }

            console.log(`🎯 ${userId} chose active card: ${card.card.name} (${card.card_id})`)
            console.log(`🎯 Broadcasting to match: ${matchId}`)
            console.log(`🎯 Players in match: ${matches.get(matchId)?.players.map(p => p.userId).join(', ')}`)

            // Notify both players about active card selection
            io.to(matchId).emit('active_card_chosen', { card })

            // If both players have active Pokémon, the game can proceed
            const match = matches.get(matchId)
            if (match) {
                const player1 = match.players[0]
                const player2 = match.players[1]

                // Check if both players have selected active Pokémon
                // This could trigger the next phase of the game
                console.log(`📊 Match ${matchId} status: Both players have active Pokémon`)
            }
        } catch (error) {
            console.error('❌ Error choosing active card:', error.message)
            socket.emit('error', { message: error.message })
        }
    })

    socket.on('play_card', ({ cardId }) => {
        try {
            const matchId = socketToMatch.get(socket.id)
            const userId = socketToUser.get(socket.id)

            if (!matchId || !userId || !matches.has(matchId)) {
                socket.emit('error', { message: 'Not in a valid match' })
                return
            }

            const match = matches.get(matchId)
            if (!match) {
                socket.emit('error', { message: 'Match not found' })
                return
            }

            const player = match.getPlayer(socket.id)
            const opponent = match.getOpponent(socket.id)

            if (!player || !opponent) {
                socket.emit('error', { message: 'Player or opponent not found' })
                return
            }

            const playedCard = player.deck?.cards?.find((c) => c.card_id === cardId)
            if (!playedCard) {
                socket.emit('error', { message: 'Card not found in deck' })
                return
            }

            console.log(`🃏 ${userId} played card ${cardId} in match ${matchId}`)

            // Send full card to both players
            io.to(opponent.socketId).emit('opponent_card_played', playedCard)
            socket.emit('opponent_draw_card')
        } catch (error) {
            console.error('❌ Error playing card:', error.message)
            socket.emit('error', { message: error.message })
        }
    })
    socket.on('active_card_chosen', ({ userId, card }) => {
        const matchId = socketToMatch.get(socket.id)
        const match = matches.get(matchId)
        if (!match) return

        // Ensure top-level currentHp exists (not nested in card.card)
        card.currentHp = card.currentHp ?? card.card?.hp

        // Persist this as the user's current active on the server
        match.setActiveCard(userId, card)

        const [player1, player2] = match.players

        io.to(matchId).emit('active_card_chosen', {
            activeCards: {
                [player1.userId]: match.getActiveCard(player1.userId),
                [player2.userId]: match.getActiveCard(player2.userId)
            }
        })
    })
    socket.on('attack', ({ userId, playerPokemon, opponentPokemon }) => {
        const matchId = socketToMatch.get(socket.id)
        const match = matches.get(matchId)
        if (!match) return

        const attacker = match.getPlayer(socket.id)
        const defender = match.getOpponent(socket.id)
        if (!attacker || !defender) return

        // Work on copies we can mutate safely
        const newAttackerPokemon = playerPokemon
        const newDefenderPokemon = opponentPokemon

        // Ensure top-level currentHp exists on both
        newAttackerPokemon.currentHp = newAttackerPokemon.currentHp ?? newAttackerPokemon.card.hp
        newDefenderPokemon.currentHp = newDefenderPokemon.currentHp ?? newDefenderPokemon.card.hp

        // Apply damage
        const damage = newAttackerPokemon.card?.attacks?.[0]?.damage || 0
        newDefenderPokemon.currentHp = Math.max(0, newDefenderPokemon.currentHp - damage)

        // ✅ Persist updated HPs back into the match's activeCards
        match.setActiveCard(attacker.userId, newAttackerPokemon)
        match.setActiveCard(defender.userId, newDefenderPokemon)

        // Deep clone before emitting (new references for React on client)
        const updatedAttacker = JSON.parse(JSON.stringify(newAttackerPokemon))
        const updatedDefender = JSON.parse(JSON.stringify(newDefenderPokemon))

        console.log("🧠 Emitting attack cards with:", {
            attacker: newAttackerPokemon.currentHp,
            defender: newDefenderPokemon.currentHp
        })

        // Include attacker identity + damage so clients animate deterministically
        io.to(attacker.socketId).emit('attack', {
            player1Card: updatedAttacker,   // their view
            player2Card: updatedDefender,
            attackerUserId: attacker.userId,
            damage,
        })

        io.to(defender.socketId).emit('attack', {
            player1Card: updatedDefender,   // their view
            player2Card: updatedAttacker,
            attackerUserId: attacker.userId,
            damage,
        })
    })

    socket.on('no_battlers', () => {
        const matchId = socketToMatch.get(socket.id)
        const match = matches.get(matchId)
        if (!match) return

        const loser = match.getPlayer(socket.id)
        const winner = match.getOpponent(socket.id)
        if (!loser || !winner) return

        // Notify both sides deterministically
        io.to(winner.socketId).emit('opponent_no_battlers', { winner: winner.userId, loser: loser.userId })
        io.to(loser.socketId).emit('you_have_no_battlers', { winner: winner.userId, loser: loser.userId })

        // (Optional) also end the match room-side if you want:
        // io.to(matchId).emit('match_end', { matchId, message: `${loser.userId} has no battlers left` })
    })
    socket.on('end_turn', ({ userId }) => {
        try {
            const matchId = socketToMatch.get(socket.id)
            const currentUserId = socketToUser.get(socket.id)

            if (!matchId || !currentUserId || !matches.has(matchId)) {
                socket.emit('error', { message: 'Not in a valid match' })
                return
            }

            const match = matches.get(matchId)
            if (!match) {
                socket.emit('error', { message: 'Match not found' })
                return
            }

            const player = match.getPlayer(socket.id)
            const opponent = match.getOpponent(socket.id)

            if (!player || !opponent) {
                socket.emit('error', { message: 'Player or opponent not found' })
                return
            }

            console.log(`🔄 ${currentUserId} ended their turn in match ${matchId}`)

            // Determine which player should get the turn next
            const nextTurnPlayer = opponent.userId

            console.log(`📊 Turn change details:`)
            console.log(`   Current player: ${currentUserId}`)
            console.log(`   Next player: ${nextTurnPlayer}`)
            console.log(`   Match ID: ${matchId}`)
            console.log(`   activeCards length: ${Object.keys(match.activeCards).length}`)
            // Notify both players about turn change
            io.to(matchId).emit('turn_changed', {
                nextTurn: 'opponent',
                endedBy: currentUserId,
                nextTurnPlayer: nextTurnPlayer,
                message: `${currentUserId} ended their turn, ${nextTurnPlayer} is next`,
                phase: `${match.activeCards.size === 2 ? 'attack' : 'select'}`

            })
        } catch (error) {
            console.error('❌ Error ending turn:', error.message)
            socket.emit('error', { message: error.message })
        }
    })

    socket.on('force_disconnect', (_, ack) => {
        console.log('🧨 force_disconnect received from:', socket.id)
        handlePlayerDisconnect(socket.id)
        if (ack) ack()
    })

    socket.on('disconnect', () => {
        handlePlayerDisconnect(socket.id)
    })

    socket.on('error', (error) => {
        console.error('❌ Socket error:', error)
    })
})

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        matches: matches.size,
        connections: io.engine.clientsCount
    })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
    console.log(`🚀 Game server running on http://localhost:${PORT}`)
    console.log(`📊 Health check available at http://localhost:${PORT}/health`)
})
