
import React from 'react'
import DeckComponent from '@/ui/components/DeckComponent'



const CollectionPage = async ({ searchParams }: { searchParams: Promise<{ page?: string, type_filter?: string, pokemon_name?: string, count_per_page?: string }> }) => {
    const params = await searchParams
    const pageNumber = Math.max(1, Number(params.page ?? '1'));
    const count_per_page = '151'


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




    return (
        <div className="flex-1 flex flex-col items-center justify-start md:justify-between min-h-0 pt-4 m-4">
            <DeckComponent allPokemonList={response.data} />

        </div>

    )
}

export default CollectionPage