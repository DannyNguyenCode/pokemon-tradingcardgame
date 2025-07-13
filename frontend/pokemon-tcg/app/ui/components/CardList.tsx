import React from 'react';
import { Pokemon } from '@/lib/definitions';
import PokemonCard from './PokemonCard';
import NoCards from './NoCards';

export default function CardList({ data }: { data: Pokemon[] }) {
    return (
        <>
            {data && data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4">
                    {data.map((pokemon) => (
                        <PokemonCard key={pokemon.id} pokemon={pokemon} />
                    ))}
                </div>
            ) : (
                <NoCards />
            )}
        </>
    );
}
