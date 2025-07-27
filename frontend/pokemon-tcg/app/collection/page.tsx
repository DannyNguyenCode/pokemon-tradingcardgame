import React from 'react'
import DeckComponent from '@/ui/components/DeckComponent'
import { auth } from 'auth'

const CollectionPage = async ({ searchParams }: {
    searchParams: Promise<{ page?: string, type_filter?: string, pokemon_name?: string, count_per_page?: string }>
}) => {
    const params = await searchParams;
    const session = await auth();

    const pageNumber = Math.max(1, Number(params.page ?? '1'));
    const count_per_page = '151';

    // Build query string
    const queryParams = new URLSearchParams({
        page: pageNumber.toString(),
        count_per_page
    });

    if (params.type_filter) queryParams.append('type_filter', params.type_filter);
    if (params.pokemon_name) queryParams.append('pokemon_name', params.pokemon_name);

    let cardsData = { data: [] };
    try {
        const cardsResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/cards/?${queryParams.toString()}`,
            { cache: 'no-store' }
        );

        if (!cardsResponse.ok) throw new Error(`Cards API error ${cardsResponse.status}`);
        cardsData = await cardsResponse.json();
    } catch (error) {
        console.error('Error fetching cards:', error);
    }

    let deckData;
    try {
        const deckResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/decks/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.accessToken}`
            },
            cache: 'no-store'
        });

        if (!deckResponse.ok) throw new Error(`Decks API error ${deckResponse.status}`);
        deckData = await deckResponse.json();
    } catch (error) {
        console.error('Error fetching decks:', error);
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-start md:justify-between min-h-0 pt-4 m-4">
            <DeckComponent allPokemonList={cardsData.data} deckCardResponse={deckData} />
        </div>
    );
};

export default CollectionPage;
