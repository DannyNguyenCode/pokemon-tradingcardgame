import { useRef, useState, useEffect, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'
import { Cards, Deck } from '@/lib/definitions'
import { GAME_CONSTANTS, SOCKET_EVENTS, CONNECTION_STATUS, TURN_STATES } from '@/lib/constants/game'

interface PlayingCards extends Cards {
    currentHp: number,
    status: string | null
}
type KOSide = 'me' | 'opponent';
interface GameState {
    connected: boolean
    waitingForOpponent: boolean
    playerHand: Cards[]
    opponentHandSize: number
    activePokemon: Cards | null | PlayingCards
    opponentActive: Cards | null | PlayingCards
    board: { player: Cards[] | PlayingCards[]; opponent: Cards[] | PlayingCards[] }
    turn: 'me' | 'opponent' | null
    socketStatus: string
    error: string | null
    isAttackPhase: boolean
    hasAttacked: boolean
    lastAttack?: { by: 'me' | 'opponent'; damage: number; nonce: number };
    koCue?: { side: KOSide; cardId: string; nonce: number };
    opponentOut?: boolean
    iAmOut?: boolean
}

interface UseGameSocketReturn extends GameState {
    joinGame: (deck: Deck) => void
    playCard: (card: Cards) => void
    selectActiveCard: (card: Cards) => void
    endTurn: () => void
    attack: (activePokemon: PlayingCards | Cards | null, opponentActive: PlayingCards | Cards | null) => void
    leaveGame: () => void
    resetGame: () => void
    clearError: () => void
    testSetOpponentActive?: (card: Cards) => void
    resolveKO: (side: 'me' | 'opponent') => void
}

export function useGameSocket(): UseGameSocketReturn {
    const { data: session } = useSession()
    const socketRef = useRef<Socket | null>(null)
    const userIdRef = useRef<string | undefined>(session?.user?.id)
    const isAlive = (c?: Cards | null) =>
        !!c && ((c.currentHp ?? c.card?.hp ?? 0) > 0) && c.status !== 'ko'
    const sentNoBattlers = useRef(false)

    useEffect(() => {
        userIdRef.current = session?.user?.id
    }, [session?.user?.id])

    const [gameState, setGameState] = useState<GameState>({
        connected: false,
        waitingForOpponent: false,
        playerHand: [],
        opponentHandSize: 0,
        activePokemon: null,
        opponentActive: null,
        board: { player: [], opponent: [] },
        turn: null,
        socketStatus: CONNECTION_STATUS.NOT_CONNECTED,
        error: null,
        isAttackPhase: false,
        hasAttacked: false
    })

    const resetGame = useCallback(() => {
        setGameState({
            connected: false,
            waitingForOpponent: false,
            playerHand: [],
            opponentHandSize: 0,
            activePokemon: null,
            opponentActive: null,
            board: { player: [], opponent: [] },
            turn: null,
            socketStatus: CONNECTION_STATUS.NOT_CONNECTED,
            error: null,
            isAttackPhase: false,
            hasAttacked: false,
            opponentOut: false,
            iAmOut: false,
        })
    }, [])

    const clearError = useCallback(() => {
        setGameState(prev => ({ ...prev, error: null }))
    }, [])

    const leaveGame = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.emit(SOCKET_EVENTS.FORCE_DISCONNECT, {}, () => {
                socketRef.current?.disconnect();
                resetGame();
            });

            // In case no ack is received
            setTimeout(() => {
                socketRef.current?.disconnect();
                resetGame();
            }, 1000);
        }
    }, [resetGame]);


    const joinGame = useCallback((deck: Deck) => {
        if (gameState.connected) return


        try {
            const socket = io(GAME_CONSTANTS.SOCKET_URL)
            socketRef.current = socket

            // Setup event listeners
            socket.on('connect', () => {
                setGameState(prev => ({
                    ...prev,
                    connected: true,
                    socketStatus: CONNECTION_STATUS.CONNECTED,
                    error: null
                }))

                socket.emit(SOCKET_EVENTS.JOIN_MATCH, {
                    userId: session?.user?.id,
                    deck,
                })
            })
            socket.on('match_error', (err) => {
                console.error('Match error:', err.message)
                setGameState(prev => ({
                    ...prev,
                    error: err.message
                }))
            })

            socket.on(SOCKET_EVENTS.JOINED_MATCH, ({ success, matchId }) => {
                if (success) {
                    setGameState(prev => ({
                        ...prev,
                        waitingForOpponent: true,
                        error: null
                    }))
                    console.log(`⏳ Joined match ${matchId}, waiting for opponent...`)
                }
            })

            socket.on(SOCKET_EVENTS.MATCH_READY, (data) => {
                setGameState(prev => ({
                    ...prev,
                    waitingForOpponent: false,
                    opponentHandSize: data.opponentHandSize,
                    playerHand: data.yourHand,
                    board: { player: [], opponent: [] },
                    turn: data.firstTurn === 'you' ? TURN_STATES.ME : TURN_STATES.OPPONENT,
                    error: null
                }))
            })
            socket.on('opponent_no_battlers', () => {
                setGameState(prev => ({ ...prev, opponentOut: true }))
            })
            socket.on('you_have_no_battlers', () => {
                setGameState(prev => ({ ...prev, iAmOut: true }))
            })


            socket.on(SOCKET_EVENTS.ACTIVE_CARD_CHOSEN, ({ activeCards }) => {
                const myId = session?.user?.id
                if (!myId) return

                const myCard = activeCards[myId] ?? null
                const opponentId = Object.keys(activeCards).find(id => id !== myId)
                const opponentCard = opponentId ? activeCards[opponentId] : null

                setGameState(prev => {
                    const hadOppActive = !!prev.opponentActive
                    const hasOppActive = !!opponentCard

                    // Only replace opponentActive if:
                    //  - they had none before and now they do (first promotion), or
                    //  - they actually switched (card_id changed).
                    const shouldReplaceOpp =
                        (!hadOppActive && hasOppActive) ||
                        (hasOppActive && prev.opponentActive?.card_id !== opponentCard!.card_id)

                    let nextOppHandSize = prev.opponentHandSize
                    if (!hadOppActive && hasOppActive) {
                        nextOppHandSize = Math.max(0, prev.opponentHandSize - 1)
                    }

                    return {
                        ...prev,
                        activePokemon: myCard ?? prev.activePokemon,
                        opponentActive: shouldReplaceOpp ? opponentCard : prev.opponentActive,
                        opponentHandSize: nextOppHandSize,
                    }
                })
            })



            socket.on(SOCKET_EVENTS.OPPONENT_CARD_PLAYED, (card) => {
                setGameState(prev => ({
                    ...prev,
                    opponentHandSize: Math.max(0, prev.opponentHandSize - 1),
                    board: {
                        ...prev.board,
                        opponent: [...prev.board.opponent, card]
                    },
                    opponentActive: card
                }))
            })

            socket.on('card_played', ({ card }) => {
                setGameState(prev => ({
                    ...prev,
                    board: {
                        ...prev.board,
                        opponent: [...prev.board.opponent, card]
                    },
                    turn: TURN_STATES.ME
                }))
            })

            // useGameSocket.ts — inside joinGame effect, replace your ATTACK handler with:
            socket.on(SOCKET_EVENTS.ATTACK, ({ player1Card, player2Card, attackerUserId, damage }) => {
                setGameState(prev => {
                    const myId = session?.user?.id
                    const by: 'me' | 'opponent' =
                        attackerUserId && myId && attackerUserId === myId ? 'me' : 'opponent'


                    const newMy = player1Card as Cards
                    const newOpp = player2Card as Cards


                    // New HPs
                    const myHpNow = (newMy?.currentHp ?? newMy?.card?.hp) ?? 0
                    const oppHpNow = (newOpp?.currentHp ?? newOpp?.card?.hp) ?? 0
                    const next = {
                        ...prev,
                        activePokemon: newMy,
                        opponentActive: newOpp,
                        lastAttack: { by, damage: (damage ?? 0), nonce: Date.now() },
                        koCue: undefined as GameState['koCue'],
                    }


                    if (myHpNow === 0 && prev.activePokemon) {
                        next.koCue = { side: 'me', cardId: newMy.card_id, nonce: Date.now() }
                    }
                    if (oppHpNow === 0 && prev.opponentActive) {
                        next.koCue = { side: 'opponent', cardId: newOpp.card_id, nonce: Date.now() }
                    }


                    return next
                })
            })


            socket.on(SOCKET_EVENTS.TURN_CHANGED, ({ nextTurn, endedBy, nextTurnPlayer }) => {
                console.log(`🔄 Turn changed to: ${nextTurn}, ended by: ${endedBy}, next player: ${nextTurnPlayer}`)

                // Determine if this player should have the turn
                const shouldBeMyTurn = nextTurnPlayer === session?.user?.id


                setGameState(prev => ({
                    ...prev,
                    turn: shouldBeMyTurn ? TURN_STATES.ME : TURN_STATES.OPPONENT,
                    isAttackPhase: prev.activePokemon && prev.opponentActive ? true : false,
                    hasAttacked: shouldBeMyTurn ? false : prev.hasAttacked
                }))
            })

            socket.on(SOCKET_EVENTS.MATCH_END, ({ matchId, message }) => {
                console.log(`🛑 Match ${matchId} ended: ${message}`)
                resetGame()
                socket.disconnect()
            })

            socket.on('disconnect', () => {
                setGameState(prev => ({
                    ...prev,
                    socketStatus: CONNECTION_STATUS.DISCONNECTED
                }))
                resetGame()
            })

            socket.on('connect_error', () => {
                setGameState(prev => ({
                    ...prev,
                    socketStatus: CONNECTION_STATUS.CONNECTION_ERROR,
                    error: 'Failed to connect to game server'
                }))
            })

            socket.on(SOCKET_EVENTS.ERROR, ({ message }) => {
                setGameState(prev => ({
                    ...prev,
                    error: message
                }))
            })

        } catch (error) {
            setGameState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to join game'
            }))
        }
    }, [session?.user?.id, resetGame, gameState.connected])

    const playCard = useCallback((card: Cards) => {
        if (gameState.turn !== TURN_STATES.ME) return

        socketRef.current?.emit(SOCKET_EVENTS.PLAY_CARD, { cardId: card.card_id })

        setGameState(prev => ({
            ...prev,
            playerHand: prev.playerHand.filter(c => c.card_id !== card.card_id),
            board: {
                ...prev.board,
                player: [...prev.board.player, card]
            },
            turn: TURN_STATES.OPPONENT
        }))
    }, [gameState.turn])

    const selectActiveCard = useCallback((card: Cards) => {
        if (gameState.turn !== TURN_STATES.ME) return
        const hp = (card.currentHp ?? card.card.hp) ?? 0
        if (card.status === 'ko' || hp <= 0) return
        console.log(`🎯 Selecting active card: ${card.card.name} (${card.card_id})`)

        // Allow changing active Pokémon
        setGameState(prev => {
            if (prev.activePokemon?.card_id === card.card_id) return prev;
            const handWithOldActive =
                prev.activePokemon
                    ? [prev.activePokemon, ...prev.playerHand]   // return old active to hand (front)
                    : prev.playerHand;
            const nextHand = handWithOldActive.filter(c => c.card_id !== card.card_id);
            return {
                ...prev,
                activePokemon: card,
                playerHand: nextHand
            }
        }
        )

        socketRef.current?.emit(SOCKET_EVENTS.ACTIVE_CARD_CHOSEN, {
            userId: session?.user?.id,
            card
        })
    }, [gameState.turn, session?.user?.id])

    const attack = useCallback((activePokemon: Cards | null, opponentActive: Cards | null) => {
        if (gameState.turn !== TURN_STATES.ME) return
        console.log("Attack commencing....")
        console.log("attack function states", {
            activePokemon: activePokemon,
            opponentActive: opponentActive
        })
        socketRef.current?.emit(SOCKET_EVENTS.ATTACK, {
            userId: session?.user.id,
            playerPokemon: activePokemon,
            opponentPokemon: opponentActive
        })
        setGameState(prev => ({
            ...prev,
            hasAttacked: true // ✅ mark that we've attacked
        }))
    }, [gameState.turn, session?.user?.id])
    const resolveKO = useCallback((side: 'me' | 'opponent') => {
        setGameState(prev => {
            if (side === 'me' && prev.activePokemon) {
                const koCard = { ...prev.activePokemon, currentHp: 0, status: 'ko' }
                const inHand = prev.playerHand.some(c => c.card_id === koCard.card_id)
                return {
                    ...prev,
                    playerHand: inHand ? prev.playerHand : [...prev.playerHand, koCard],
                    activePokemon: null,
                    koCue: undefined,
                    damageCue: undefined,
                }
            }
            if (side === 'opponent' && prev.opponentActive) {
                return {
                    ...prev,
                    opponentActive: null,
                    opponentHandSize: prev.opponentHandSize + 1,
                    koCue: undefined,
                    damageCue: undefined,
                }
            }
            return { ...prev, koCue: undefined, damageCue: undefined, }
        })
    }, [])

    const endTurn = useCallback(() => {
        if (gameState.turn !== TURN_STATES.ME) return

        console.log(`🔄 Ending turn for player`)

        socketRef.current?.emit(SOCKET_EVENTS.END_TURN, {
            userId: session?.user?.id
        })
        setGameState(prev => ({
            ...prev,
            turn: TURN_STATES.OPPONENT,

        }))
    }, [gameState.turn, session?.user?.id])

    const testSetOpponentActive = useCallback((card: Cards) => {
        console.log('🧪 Test: Setting opponent active card to:', card.card.name)
        setGameState(prev => ({ ...prev, opponentActive: card }))
    }, [])
    useEffect(() => {
        const iHaveAlive = isAlive(gameState.activePokemon) || gameState.playerHand.some(isAlive)
        if (!iHaveAlive && !sentNoBattlers.current && socketRef.current) {
            sentNoBattlers.current = true
            socketRef.current.emit('no_battlers')
            console.log('[HOOK] emitted no_battlers')
        }
    }, [gameState.activePokemon, gameState.playerHand])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect()
            }
        }
    }, [])

    return {
        ...gameState,
        joinGame,
        playCard,
        selectActiveCard,
        endTurn,
        attack,
        leaveGame,
        resetGame,
        clearError,
        testSetOpponentActive,
        resolveKO
    }
} 