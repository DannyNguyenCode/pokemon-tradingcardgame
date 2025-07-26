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

const DeckComponent = ({ allPokemonList }: { allPokemonList: Pokemon[] }) => {
    const dispatch = useAppDispatch()
    const [selectDeck, setSelectDeck] = useState<string>('')
    const [deckPokemon, setDeckPokemon] = useState<Pokemon[]>([])
    const { data: session, status } = useSession()
    const [available, setAvailable] = useState<Pokemon[]>(
        allPokemonList.filter(p => !deckPokemon.some(d => d.id === p.id))
    )
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

    useEffect(() => {
        if (status === 'authenticated') {
            setSelected(deckPokemon)
            setAvailable(
                allPokemonList.filter(p => !deckPokemon.some(d => d.id === p.id))
            )
            fetchDecks()
        }


    }, [deckPokemon, allPokemonList, status])


    const fetchDecks = async () => {
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
    }
    const onDeckSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const deck_id = e.target.value
        setSelectDeck(deck_id)
        const selectedDeck = deckCardResponse.data.find(deck => deck.id === deck_id)
        if (selectedDeck) {
            const pokemons = selectedDeck.cards.map((pokemonCard => pokemonCard.card))
            setDeckPokemon(pokemons)
        } else {
            setDeckPokemon([])
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
                {deckCardResponse.data.map(deck => (
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
                    deckName={deckCardResponse.data.find(deck => deck.id === selectDeck)?.name}
                    onSave={onSave}
                    onCancel={onCancel} />
            }

        </>
    )
}

export default DeckComponent