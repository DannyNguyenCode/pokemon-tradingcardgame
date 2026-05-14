import React from 'react'
import { Lexend } from 'next/font/google'
import { normalizeTypeFilterParam } from '@/lib/pokemon'
import { mapApiCardsToPokemon } from '@/lib/mappers/apiCardMapper'
import DeckComponent from '@/ui/components/DeckComponent'
import { auth } from 'auth'
import { redirect } from 'next/navigation'

const lexend = Lexend({
    subsets: ['latin'],
    display: 'swap',
})
const CollectionPage = async ({ searchParams }: { searchParams: Promise<{ page?: string, type_filter?: string, pokemon_name?: string, count_per_page?: string }> }) => {
    const session = await auth()

    if (!session || !session.user) {
        redirect('/login') // Or to a custom login page
    }
    const params = await searchParams
    const pageNumber = Math.max(1, Number(params.page ?? '1'));
    const count_per_page = '151'


    // Build query string with all filters
    const queryParams = new URLSearchParams();
    queryParams.append('page', pageNumber.toString());
    queryParams.append('count_per_page', count_per_page);

    if (params.type_filter) {
        queryParams.append('type_filter', normalizeTypeFilterParam(params.type_filter))
    }

    if (params.pokemon_name) {
        queryParams.append('pokemon_name', params.pokemon_name);
    }
    let data = null;
    try {

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/cards/?${queryParams.toString()}`);
        if (!response.ok) throw new Error(`Fetch error: ${response.status}`);
        data = await response.json();
    } catch (error) {
        console.log("error collection route fetch cards", error)
    }





    return (
        <div
            className={`${lexend.className} hq-collection flex min-h-0 w-full max-w-none flex-1 flex-col bg-hq-background px-0 pt-0 pb-0 text-hq-on-background antialiased md:justify-between`}
        >
            <DeckComponent allPokemonList={mapApiCardsToPokemon(data?.data)} />
        </div>
    )
}

export default CollectionPage