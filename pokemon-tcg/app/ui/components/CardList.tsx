import React from 'react';
import { Pokemon } from '@app/lib/definitions';
import PokemonCard from './PokemonCard';

export default function CardList({ data }: { data: Pokemon[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4">
            {data.map((pokemon) => (
                <PokemonCard key={pokemon.id} pokemon={pokemon} />
            ))}
        </div>
    );
}
