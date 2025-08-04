// Game Configuration
export const GAME_CONSTANTS = {
    INITIAL_HAND_SIZE: 5,
    MAX_PLAYERS_PER_MATCH: 2,
    SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
    API_BASE_URL: process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:8000',
} as const

// Socket Event Names
export const SOCKET_EVENTS = {
    JOIN_MATCH: 'join_match',
    JOINED_MATCH: 'joined_match',
    MATCH_READY: 'match_ready',
    ACTIVE_CARD_CHOSEN: 'active_card_chosen',
    PLAY_CARD: 'play_card',
    OPPONENT_CARD_PLAYED: 'opponent_card_played',
    OPPONENT_DRAW_CARD: 'opponent_draw_card',
    END_TURN: 'end_turn',
    TURN_CHANGED: 'turn_changed',
    MATCH_END: 'match_end',
    FORCE_DISCONNECT: 'force_disconnect',
    ERROR: 'error',
    CHOOSE_ACTIVE_CARD: "choose_active_card",
    ATTACK: 'attack'
} as const

// Game States
export const GAME_STATES = {
    WAITING: 'waiting',
    ACTIVE: 'active',
    FINISHED: 'finished',
} as const

// Turn States
export const TURN_STATES = {
    ME: 'me',
    OPPONENT: 'opponent',
} as const

// Connection Status
export const CONNECTION_STATUS = {
    NOT_CONNECTED: '🔴 Not connected',
    CONNECTED: '🟢 Connected to game server',
    CONNECTION_ERROR: '⚠️ Connection error',
    DISCONNECTED: '🔴 Disconnected from server',
} as const 