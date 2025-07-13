import React from 'react'
import { Pokemon } from '@/lib/definitions'
import typeMap from '@/lib/data/typeMap.json';
import Image from 'next/image';
import PokemonAddBtn from './PokemonAddBtn'
import OpenModalBtn from './OpenModalBtn'
import PokemonDetails from './PokemonDetails';
type TypeMeta = (typeof typeMap)[keyof typeof typeMap];

const COLORLESS_META: TypeMeta = {
    color: '#A8A77A',
    icon: '/icons/colorless.png',
};
const colorTypes: Record<string, string> = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD',
};
const TYPE_ICON_INDEX: Record<string, number> = {
    normal: 1, fighting: 2, flying: 3, poison: 4, ground: 5, rock: 6,
    bug: 7, ghost: 8, steel: 9, fire: 10, water: 11, grass: 12,
    electric: 13, psychic: 14, ice: 15, dragon: 16, dark: 17, fairy: 18
};
const PokemonCard = ({ pokemon }: { pokemon: Pokemon }) => {
    const owned = true

    const getMatchingIcon = (key: string) => {
        const response = (typeMap as Record<string, typeof COLORLESS_META>)[key.toLowerCase()] ?? COLORLESS_META;
        return response

    }
    const costToSymbolWithMultiplier = (cost: string, attribute: string) => {
        if (!cost) return { symbol: null, multiplier: 0 };
        const tokens = cost.replace(/^\{|\}$/g, '').split(/[,\s]+/).filter(Boolean).map((t) => t.toLowerCase());
        const filtered = attribute === 'attack' ? tokens : tokens.filter((t) => t !== 'colorless');

        if (filtered.length === 0) return { symbol: null, multiplier: 0 };

        // Count occurrences of each symbol type
        const symbolCounts: Record<string, number> = {};
        filtered.forEach(token => {
            symbolCounts[token] = (symbolCounts[token] || 0) + 1;
        });

        // Get the most common symbol (or first if all equal)
        const mostCommonSymbol = Object.keys(symbolCounts).reduce((a, b) =>
            symbolCounts[a] > symbolCounts[b] ? a : b
        );

        const multiplier = symbolCounts[mostCommonSymbol];
        const symbol = getMatchingIcon(mostCommonSymbol);

        return { symbol, multiplier };
    }
    const pokemonTypeIconUrl = (type: string) => {
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-vi/x-y/${TYPE_ICON_INDEX[type.toLowerCase()]}.png`;
    }
    const pokemonRetreatCostToSymbol = (cost: number) => {
        return Array.from({ length: cost }, (_, i) => <span key={i}><Image width={20} height={20} src={`/icons/colorless.png`} alt={COLORLESS_META.color} /></span>)
    }
    const firstAttack = pokemon.attacks[0];
    const costInfo = costToSymbolWithMultiplier(firstAttack.cost, "attack");

    return (
        <div className='flex'>
            <div className={`card bg-base-100 w-200 max-h-200 shadow-lg hover:shadow-xl transition-shadow duration-300`} style={{ backgroundColor: colorTypes[`${pokemon.type.toLowerCase()}`] }}>
                <div className="card-body">
                    <h2 className="card-title justify-between">
                        <span >{pokemon.name}</span>
                        <span>{pokemon.hp} HP</span>
                        <div>
                            <figure><Image loading='lazy' width={50} height={20} style={{ borderRadius: '50%', width: '50px', height: '20px' }} src={pokemonTypeIconUrl(pokemon.type.toLowerCase())} alt={pokemon.type.toLowerCase()} /></figure>

                        </div>
                    </h2>
                    <p className='flex-grow-0'>{pokemon.rarity}</p>
                    <figure>
                        <Image
                            src={pokemon.image_url}
                            alt={pokemon.name}
                            width={110} height={110}
                            priority
                            style={{ width: '110px', height: '110px' }}
                        />
                    </figure>

                    <div className="flex justify-between items-center h-11">
                        <span className="flex items-center gap-1">
                            <div className='flex gap-1'>
                                <div className='grid grid-cols-4 gap-1'>
                                    {firstAttack.cost && (
                                        <>
                                            {firstAttack.cost.replace(/^\{|\}$/g, '').split(/[,\s]+/).filter(Boolean).map((token, index) => {
                                                const cleanToken = token.toLowerCase();
                                                const symbol = getMatchingIcon(cleanToken);
                                                return (
                                                    <Image
                                                        key={index}
                                                        loading='lazy'
                                                        src={symbol.icon}
                                                        alt={cleanToken}
                                                        width={20}
                                                        height={20}
                                                        style={{ borderRadius: '50%', width: '20px', height: '20px' }}
                                                    />
                                                );
                                            })}
                                        </>
                                    )}
                                </div>
                            </div>
                        </span>
                        <span>
                            {firstAttack.name}&nbsp;&nbsp;&nbsp;{firstAttack.damage}
                        </span>
                    </div>


                    {owned &&
                        <div className="card-actions flex-1 items-end justify-center">
                            <OpenModalBtn pokemon_collector_number={pokemon.collector_number} />
                        </div>
                    }
                </div>

                <PokemonDetails pokemon={pokemon} />
            </div >
        </div>
    )
}

export default PokemonCard