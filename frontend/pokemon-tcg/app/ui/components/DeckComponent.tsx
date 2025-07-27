'use client'
import React, { useEffect, useState } from 'react'
import { Pagination as PaginationType, Pokemon } from '@/lib/definitions'
import TransferList from './TransferList'
import { useSession } from 'next-auth/react'
import { useAppDispatch } from '@/lib/hooks'
import { loadToastifyState } from '@/lib/features/toastify/toastifySlice'
import TransferListSkeleton from './TransferListSkeleton'
type Cards = {
    card: Pokemon
    card_id: string
    deck_id: string
}
type Data = {
    cards: Cards[]
    created_at: Date
    id: string
    name: string
}
type DeckCardsResponse = {
    data: Data[]
    message: string
    pagination: PaginationType
    status: number
}

const DeckComponent = ({ allPokemonList, deckCardResponse }: { allPokemonList: Pokemon[], deckCardResponse: DeckCardsResponse }) => {
    const dispatch = useAppDispatch()
    const [selectDeck, setSelectDeck] = useState<string>('')
    const [deckPokemon, setDeckPokemon] = useState<Pokemon[]>([])
    const { data: session, status } = useSession()
    const [available, setAvailable] = useState<Pokemon[]>(
        allPokemonList.filter(p => !deckPokemon.some(d => d.id === p.id))
    )
    const [selected, setSelected] = useState<Pokemon[]>(deckPokemon)
    // const [deckCardResponse, setDeckCardResponse] = useState<DeckCardsResponse>({
    //     data: [],
    //     message: '',
    //     pagination: {
    //         page: 0,
    //         total_pages: 0,
    //         has_next: false,
    //         has_prev: false,
    //         total_count: 0,
    //         pageSize: 0
    //     },
    //     status: 0
    // });

    useEffect(() => {
        console.log("deckCardResponse", deckCardResponse)
        if (status === 'authenticated') {
            // const fetchDecks = async () => {
            //     try {
            //         console.log("session?.accessToken", session?.accessToken)
            //         console.log("session.user.id", session.user.id)
            //         const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/decks/`, {
            //             method: 'GET',
            //             headers: {
            //                 'Content-Type': 'application/json',
            //                 'Authorization': `Bearer ${session?.accessToken}`
            //             }
            //         })
            //         console.log("response", response)
            //         if (!response.ok) throw new Error("Failed to fetch decks")
            //         const res = await response.json()
            //         console.log("Decks Fetched in function", res)
            //         setDeckCardResponse(res)
            //     } catch (error) {
            //         console.error("Deck fetch error:", error)
            //     }
            // }
            console.log("allpokemon", allPokemonList)
            setSelected(deckPokemon)
            setAvailable(
                allPokemonList.filter(p => !deckPokemon.some(d => d.id === p.id))
            )
            // fetchDecks()
        }


    }, [deckPokemon, allPokemonList, status, session, deckCardResponse])



    const onDeckSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const deck_id = e.target.value
        setSelectDeck(deck_id)
        if (Array.isArray(deckCardResponse?.data)) {
            const selectedDeck = deckCardResponse.data.find(deck => deck.id === deck_id)
            if (selectedDeck) {
                const pokemons = selectedDeck.cards.map((pokemonCard => pokemonCard.card))
                setDeckPokemon(pokemons)
            } else {
                setDeckPokemon([])
            }
        }


    }
    const onSave = async () => {
        const savedPokemonId = selected.map(pokemon => pokemon.id)
        await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/deck-cards/${selectDeck}/replace`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`
            },
            body: JSON.stringify({ card_ids: savedPokemonId })
        }).then((res) => {
            if (!res.ok) throw new Error(`API ${res.status} ${`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/deck-cards/${selectDeck}/replace`}`);
            return res.json()
        }).then((data) => {
            console.log('update deck success:', data);
            dispatch(loadToastifyState(data.message))
            return data
        }).catch((error) => {
            console.error('Error updating decks decks:', error);
        });

    }
    const onCancel = () => {
        setAvailable(allPokemonList.filter(p => !deckPokemon.some(d => d.id === p.id)))
        setSelected(deckPokemon)
    }

    return (
        <>
            {status === 'loading' ? <div className="w-4/12 m-2 md:m-0">
                <div className="skeleton h-10 w-full rounded"></div>
            </div> : <select
                className="select select-sm w-4/12 m-2 md:m-0"
                value={selectDeck}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onDeckSelect(e)}
            >
                <option disabled value="">
                    Select Deck
                </option>
                {Array.isArray(deckCardResponse?.data) && deckCardResponse.data.map(deck => (
                    <option key={deck.id} value={deck.id}>
                        {deck.name}
                    </option>
                ))}
            </select>
            }

            {status === 'loading' ?
                <TransferListSkeleton /> : <TransferList
                    key={selectDeck}
                    available={available}
                    selected={selected}
                    setAvailable={setAvailable}
                    setSelected={setSelected}
                    deckName={
                        Array.isArray(deckCardResponse?.data)
                            ? deckCardResponse.data.find(deck => deck.id === selectDeck)?.name
                            : undefined
                    }
                    onSave={onSave}
                    onCancel={onCancel} />
            }

        </>
    )
}

export default DeckComponent