'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { Deck, Pokemon, Cards } from '@/lib/definitions'
import TransferList from './TransferList'
import { useSession } from 'next-auth/react'
import { useAppDispatch } from '@/lib/hooks'
import { loadToastifyState } from '@/lib/features/toastify/toastifySlice'
import TransferListSkeleton from './TransferListSkeleton'
import DeckComponentSkeleton from './DeckComponentSkeleton'
import CreateDeckModal from './CreateDeckModal'
import { DeckCardsResponse } from '@/lib/definitions'
import { mapApiDeckCardRowToCards } from '@/lib/mappers/apiCardMapper'

const DeckComponent = ({ allPokemonList }: { allPokemonList: Pokemon[] }) => {
    const dispatch = useAppDispatch()
    const [selectDeck, setSelectDeck] = useState<Deck | null>({
        cards: [],
        created_at: new Date,
        id: '',
        name: ''
    })
    const [deckPokemon, setDeckPokemon] = useState<Pokemon[]>([])
    const { data: session, status } = useSession()
    const [available, setAvailable] = useState<Pokemon[]>(allPokemonList)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [selected, setSelected] = useState<Pokemon[]>(deckPokemon)
    const [deckCardResponse, setDeckCardResponse] = useState<DeckCardsResponse>({
        data: [],
        message: '',
        pagination: {
            page: 0,
            total_pages: 0,
            has_next: false,
            has_prev: false,
            total_count: 0,
            page_size: 0
        },
        status: 0
    });


    const fetchDecks = useCallback(async () => {
        try {
            const qs = new URLSearchParams({ page: '1', count_per_page: '100' })
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/decks/?${qs.toString()}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session?.accessToken}`,
                    },
                }
            )
            console.log('Response inside fetch decks', response)
            const res = await response.json()
            if (!response.ok) {
                const msg =
                    (typeof res?.message === 'string' && res.message) ||
                    (typeof res?.error === 'string' && res.error) ||
                    `Could not load teams (${response.status})`
                throw new Error(msg)
            }
            console.log('Decks Fetched in function', res)
            setDeckCardResponse({
                data: Array.isArray(res?.data) ? res.data : [],
                message: typeof res?.message === 'string' ? res.message : '',
                pagination:
                    res?.pagination && typeof res.pagination === 'object'
                        ? res.pagination
                        : {
                              page: 0,
                              total_pages: 0,
                              has_next: false,
                              has_prev: false,
                              total_count: 0,
                              page_size: 0,
                          },
                status: typeof res?.status === 'number' ? res.status : 0,
            })
        } catch (error) {
            console.error('Deck fetch error:', error)
            dispatch(
                loadToastifyState(
                    error instanceof Error ? error.message : 'Could not load teams. Check that you are signed in.'
                )
            )
        }
    }, [session, dispatch])

    // Deck list: refresh when auth is ready (not when catalog filters change).
    useEffect(() => {
        if (status !== 'authenticated') return
        let cancelled = false
        setIsLoading(true)
        void (async () => {
            await fetchDecks()
            if (!cancelled) setIsLoading(false)
        })()
        return () => {
            cancelled = true
        }
    }, [status, fetchDecks])

    // Catalog pool: server `allPokemonList` reflects URL filters — always omit Pokémon currently in the team editor.
    useEffect(() => {
        setAvailable(allPokemonList.filter(p => !selected.some(s => s.id === p.id)))
    }, [allPokemonList, selected])




    const onDeckSelect = async (deck_id: string) => {
        if (!deck_id) {
            console.log("empty string hit")
            setDeckPokemon([])
            setSelected([])
            setSelectDeck(null)
            setAvailable(allPokemonList)
        } else {
            try {
                setIsLoading(true)
                const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/decks/${deck_id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.accessToken}`
                    },
                })
                if (!response.ok) throw new Error(`API ${response.status} ${`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/decks/${deck_id}`}`);

                console.log("Response deckcomponenet", response)
                const selectedDeck = await response.json()
                console.log("selectedDeck", selectedDeck)
                if (selectedDeck) {
                    setSelectDeck(selectedDeck.data)
                    const pokemons = Array.isArray(selectedDeck.data.cards)
                        ? selectedDeck.data.cards.map(mapApiDeckCardRowToCards)
                        : []
                    console.log("pokemons", pokemons)
                    setAvailable(
                        Array.isArray(allPokemonList)
                            ? allPokemonList.filter(p => !pokemons.some((d: Cards) => d.card_id === p.id))
                            : []
                    );
                    console.log("allPokemonList", allPokemonList.filter(p => !pokemons.some((d: Cards) => d.card_id === p.id)))
                    setDeckPokemon(pokemons.map((p: Cards) => p.card))
                    setSelected(pokemons.map((p: Cards) => p.card))
                    console.log("pokemons mapped cards", pokemons.map((p: Cards) => p.card))
                    console.log("selectedDeck.data.id", selectedDeck.data.id)
                }
                setIsLoading(false)
            } catch (error) {
                console.log("error in fetch deck by id", error)
            }
        }




    }
    const onSave = async () => {
        const savedPokemonId = selected.map(pokemon => pokemon.id)
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/deck-cards/${selectDeck?.id}/replace`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`
            },
            body: JSON.stringify({ card_ids: savedPokemonId })
        }).then((res) => {
            if (!res.ok) throw new Error(`API ${res.status} ${`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/deck-cards/${selectDeck?.id}/replace`}`);
            return res.json()
        }).then(async (data) => {
            console.log('update deck success:', data);
            dispatch(loadToastifyState(data.message))
            await fetchDecks()
            await onDeckSelect('')
            return data
        }).catch((error) => {
            console.error('Error updating decks decks:', error);
        });

    }
    const onCancel = () => {
        setAvailable(allPokemonList.filter(p => !deckPokemon.some(d => d.id === p.id)))
        setSelected(deckPokemon)
    }
    const onDelete = () => {
        setAvailable(allPokemonList)
        setSelected([])
        setSelectDeck(null)
    }
    const onCreate = () => {
        setAvailable(allPokemonList)
        setSelected([])
        setSelectDeck(null)
    }

    return (
        <>
            {status === 'loading' ? (
                <DeckComponentSkeleton />
            ) : (
                <>
                    {isLoading ? (
                        <TransferListSkeleton />
                    ) : (
                        <TransferList
                            key={selectDeck?.id ?? 'none'}
                            available={available}
                            selected={selected}
                            setAvailable={setAvailable}
                            setSelected={setSelected}
                            deck={selectDeck?.id ? selectDeck : null}
                            onSave={onSave}
                            onCancel={onCancel}
                            onDelete={onDelete}
                            decks={deckCardResponse.data}
                            activeDeckId={selectDeck?.id && selectDeck.id !== '' ? selectDeck.id : null}
                            onDeckSelect={onDeckSelect}
                            createDeckSlot={<CreateDeckModal onCreate={onCreate} />}
                        />
                    )}
                </>
            )}
        </>
    )
}

export default DeckComponent