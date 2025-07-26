import React from 'react';
import { Pokemon } from '@/lib/definitions';

import NoCards from './NoCards';
import FlipCard from './FlipCard';

const columnMap: Record<string, string> = {
    "2": "md:grid-cols-2",
    "3": "md:grid-cols-3",
    "4": "md:grid-cols-4",
    "5": "md:grid-cols-5",
    "6": "md:grid-cols-6",
    "8": "md:grid-cols-8",
    "9": "md:grid-cols-9",
    "10": "md:grid-cols-10",
    "11": "md:grid-cols-11",
    "12": "md:grid-cols-12",
}

export default function CardList({ data, columns }: { data: Pokemon[], columns: string }) {
    const columnClass = columnMap[columns]
    return (
        <>
            {data && data.length > 0 ? (
                <div className={`max-h-3/4 min-h-3/4 grid grid-cols-1 ${columnClass} gap-4 px-4`}>
                    {data.map((pokemon) => (
                        <FlipCard key={pokemon.id} pokemon={pokemon} />

                    ))}
                </div>
            ) : (
                <NoCards />
            )}
        </>
    );
}
