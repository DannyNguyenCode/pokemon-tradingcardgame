import React from 'react'
import { Pokemon } from '@app/lib/definitions'
import typeMap from '@app/lib/data/typeMap.json';
import Image from 'next/image';
import PokemonAddBtn from './PokemonAddBtn'
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
    const costToSymbols = (cost: string, attribute: string) => {
        if (!cost) return [];
        const tokens = cost.replace(/^\{|\}$/g, '').split(/[,\s]+/).filter(Boolean).map((t) => t.toLowerCase());
        const filtered = attribute === 'attack' ? tokens : tokens.filter((t) => t !== 'colorless');
        return filtered.map((tok) => getMatchingIcon(tok));

    }
    const pokemonTypeIconUrl = (type: string) => {
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-vi/x-y/${TYPE_ICON_INDEX[type.toLowerCase()]}.png`;
    }
    const pokemonRetreatCostToSymbol = (cost: number) => {
        return Array.from({ length: cost }, (_, i) => <span key={i}><Image width={20} height={20} src={`/icons/colorless.png`} alt={COLORLESS_META.color} /></span>)
    }
    const firstAttack = pokemon.attacks[0];
    const symbols = costToSymbols(firstAttack.cost, "attack");

    return (
        <div className='flex'>
            <div className={`card bg-base-100 w-200 min-h-110 shadow-sm`} style={{ backgroundColor: colorTypes[`${pokemon.type.toLowerCase()}`] }}>
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
                        <span className="flex gap-1">
                            <div className="grid grid-cols-4 gap-1">
                                {symbols?.map((s, i) => {
                                    return (
                                        <div key={i} className="">
                                            <Image loading='lazy' src={s.icon} alt={''} width={20} height={20} style={{ borderRadius: '50%', width: '20px', height: '20px' }} />
                                        </div>
                                    )
                                }
                                )}

                            </div>
                        </span>
                        <span>
                            {firstAttack.name}&nbsp;&nbsp;&nbsp;{firstAttack.damage}
                        </span>
                    </div>
                    <div className='flex items-center justify-between h-11'>
                        <span>weakness</span>
                        <span className="flex gap-1">
                            <div className="grid grid-cols-3 gap-1">
                                {pokemon.weakness?.map((s, i) => {

                                    return (
                                        <Image loading='lazy' className='object-over' key={i} src={pokemonTypeIconUrl(s)} alt="" width={50} height={20} style={{ borderRadius: '50%', width: '50px', height: '20px' }} />
                                    )


                                }
                                )}
                            </div>
                        </span>
                    </div>
                    <div className='flex items-center justify-between h-11'>
                        <span>resistance </span>
                        <span className="flex gap-1">
                            <div className="grid grid-cols-3 gap-1">
                                {pokemon.resistance?.map((s, i) => {

                                    return (
                                        <Image loading='lazy' className='object-over' key={i} src={pokemonTypeIconUrl(s)} alt="" width={50} height={20} style={{ borderRadius: '50%', width: '50px', height: '20px' }} />
                                    )
                                }
                                )}
                            </div>
                        </span>
                    </div>
                    <div className='flex items-center justify-between h-11'>
                        <h3>Retreat Cost</h3>
                        <div className="grid grid-cols-10 gap-1">{pokemonRetreatCostToSymbol(pokemon.retreat_cost)}</div>
                    </div>

                    {owned &&
                        <div className="card-actions flex-1 items-end justify-center">
                            <PokemonAddBtn pokemonData={pokemon} />

                        </div>
                    }
                </div>


            </div >
        </div>
    )
}

export default PokemonCard