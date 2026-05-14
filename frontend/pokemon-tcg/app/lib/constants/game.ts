/**
 * Socket URL for the Node game server (Render, Fly, local Docker, etc.).
 *
 * - `next dev`: defaults to `http://localhost:3001` so a Render URL in `.env`
 *   does not send every click (including Battle Computer) to production.
 * - To hit your hosted socket from local dev: set `NEXT_PUBLIC_SOCKET_FORCE_REMOTE=true`
 *   (then `NEXT_PUBLIC_SOCKET_URL` is used), or set `NEXT_PUBLIC_SOCKET_URL_DEV` to any URL.
 * - `next build` / production: uses `NEXT_PUBLIC_SOCKET_URL` when set, else localhost.
 */
export function getGameSocketUrl(): string {
    const remoteUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SOCKET_FORCE_REMOTE !== 'true') {
        return process.env.NEXT_PUBLIC_SOCKET_URL_DEV || 'http://localhost:3001'
    }
    return remoteUrl
}

// Game Configuration
export const GAME_CONSTANTS = {
    INITIAL_HAND_SIZE: 5,
    MAX_PLAYERS_PER_MATCH: 2,
    API_BASE_URL: process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:8000',
    /** Team builder (collection): max Pokémon per saved team (UI + save payload). */
    TEAM_BUILDER_MAX_CARDS: 5,
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