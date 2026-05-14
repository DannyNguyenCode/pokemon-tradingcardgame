import React from 'react';
import { Pokemon } from '@/lib/definitions';

import NoCards from './NoCards';
import { HoloCard } from './HoloCard';

const columnMap: Record<string, string> = {
    "2": "md:grid-cols-2",
    "3": "md:grid-cols-3",
    "4": "md:grid-cols-4",
    "5": "md:grid-cols-5",
    "6": "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
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
                <div
                    className={`grid w-full grid-cols-1 ${columnClass} items-stretch px-4`}
                >
                    {data.map((pokemon) => (
                        <div key={pokemon.id} className="flex min-h-0 min-w-0 h-full justify-center mx-auto w-full max-w-[14rem] flex-col items-stretch gap-2 py-2">
                            <HoloCard pokemon={pokemon} className="min-h-0 flex-1" />
                        </div>

                    ))}
                </div>
            ) : (
                <NoCards />
            )}
        </>
    );
}
