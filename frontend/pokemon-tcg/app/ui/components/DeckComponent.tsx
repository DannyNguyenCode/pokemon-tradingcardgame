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
import DeckSelect from './DeckSelect'

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
            pageSize: 0
        },
        status: 0
    });


    const fetchDecks = useCallback(async () => {
        try {

            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/decks/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`
                }
            })
            if (!response.ok) throw new Error("Failed to fetch decks")
            const res = await response.json()
            console.log("Decks Fetched in function", res)
            setDeckCardResponse(res)

        } catch (error) {
            console.error("Deck fetch error:", error)
        }
    }, [session])
    useEffect(() => {
        const loadData = async () => {
            if (status === 'authenticated') {
                console.log("useEffect triggers per interactions/visit")
                setIsLoading(true);
                setAvailable(allPokemonList)
                await fetchDecks();
                setIsLoading(false);
            }
        };
        loadData();
    }, [status, allPokemonList, fetchDecks]);




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
                    const pokemons = selectedDeck.data.cards
                    console.log("pokemons", pokemons)
                    setAvailable(
                        Array.isArray(allPokemonList)
                            ? allPokemonList.filter(p => !pokemons.some((d: Cards) => d.card_id === p.id))
                            : []
                    );
                    console.log("allPokemonList", allPokemonList.filter(p => !pokemons.some((d: Cards) => d.card_id === p.id)))
                    setDeckPokemon(pokemons.map((p: Cards) => { return p.card }))
                    setSelected(pokemons.map((p: Cards) => { return p.card }))
                    console.log("pokemons.map((p: Cards) => { return p.card })", pokemons.map((p: Cards) => { return p.card }))
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
        }).then((data) => {
            console.log('update deck success:', data);
            dispatch(loadToastifyState(data.message))
            fetchDecks()
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
            {status === 'loading' || deckCardResponse.data.length === 0 ? (
                <DeckComponentSkeleton />
            ) : (
                <>
                    <div className='flex flex-row gap-2'>
                        <DeckSelect selectDeck={selectDeck} onDeckSelect={onDeckSelect} deckCardResponse={deckCardResponse} />
                        <CreateDeckModal onCreate={onCreate} />
                    </div>
                    {/* Transfer List Skeleton while switching decks */}
                    {isLoading ? (
                        <TransferListSkeleton />
                    ) : (
                        <TransferList
                            key={selectDeck?.id}
                            available={available}
                            selected={selected}
                            setAvailable={setAvailable}
                            setSelected={setSelected}
                            deck={selectDeck}
                            onSave={onSave}
                            onCancel={onCancel}
                            fetchDecks={fetchDecks}
                            onDelete={onDelete}
                        />
                    )}
                </>
            )}
        </>
    )
}

export default DeckComponent