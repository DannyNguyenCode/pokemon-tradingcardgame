
import React from 'react'
import DeckComponent from '@/ui/components/DeckComponent'
import { auth } from 'auth'
// import { Pagination } from '@/lib/definitions'
// import { Pokemon } from '@/lib/definitions'
// type Cards = {
//     card: Pokemon
//     card_id: string
//     deck_id: string
// }
// type Data = {
//     cards: Cards[]
//     created_at: Date
//     id: string
//     name: string
// }
// type DeckCardsResponse = {
//     data: Data[]
//     message: string
//     pagination: Pagination
//     status: number
// }

const CollectionPage = async ({ searchParams }: { searchParams: Promise<{ page?: string, type_filter?: string, pokemon_name?: string, count_per_page?: string }> }) => {
    const params = await searchParams
    const pageNumber = Math.max(1, Number(params.page ?? '1'));
    const count_per_page = '151'
    const session = await auth()

    // Build query string with all filters
    const queryParams = new URLSearchParams();
    queryParams.append('page', pageNumber.toString());
    queryParams.append('count_per_page', count_per_page);

    if (params.type_filter) {
        queryParams.append('type_filter', params.type_filter);
    }

    if (params.pokemon_name) {
        queryParams.append('pokemon_name', params.pokemon_name);
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/cards/?${queryParams.toString()}`).then((res) => {
        if (!res.ok) throw new Error(`API ${res.status} ${`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/cards/?${queryParams.toString()}`}`);
        return res.json()
    }).then((data) => {
        return data
    }).catch((error) => {
        console.error('Error fetching cards:', error);
    });

    const deckResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/decks/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.accessToken}`
        }
    })
    console.log("deckResponse", deckResponse)
    const res = await deckResponse.json()
    console.log("res", res)






    return (
        <div className="flex-1 flex flex-col items-center justify-start md:justify-between min-h-0 pt-4 m-4">
            <DeckComponent allPokemonList={response.data} deckCardResponse={res} />

        </div>

    )
}

export default CollectionPage