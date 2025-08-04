import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Deck } from '@/lib/definitions'
import { GAME_CONSTANTS } from '@/lib/constants/game'

interface UseDecksReturn {
    decks: Deck[]
    selectedDeck: Deck | null
    isLoading: boolean
    error: string | null
    setSelectedDeck: (deck: Deck | null) => void
    refetchDecks: () => Promise<void>
    clearError: () => void
}

export function useDecks(): UseDecksReturn {
    const { data: session } = useSession()
    const [decks, setDecks] = useState<Deck[]>([])
    const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const clearError = () => setError(null)

    const fetchDecks = useCallback(async () => {
        if (!session?.user?.id) return

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`${GAME_CONSTANTS.API_BASE_URL}/api/decks/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`
                }
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch decks: ${response.status}`)
            }

            const json = await response.json()
            setDecks(Array.isArray(json.data) ? json.data : [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch decks')
        } finally {
            setIsLoading(false)
        }
    }, [session?.user?.id, session?.accessToken]) // ✅ stable dependency list

    useEffect(() => {
        fetchDecks()
    }, [session, fetchDecks])

    return {
        decks,
        selectedDeck,
        isLoading,
        error,
        setSelectedDeck,
        refetchDecks: fetchDecks,
        clearError
    }
} 