'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Pokemon } from '@/lib/definitions'
import TypeBadge from './TypeBadge'
import { useState } from 'react'
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
const FlipCard = (
    { pokemon, isAvailable = false, isInteractive = false, handleAdd, handleRemove }:
        { pokemon: Pokemon, isAvailable?: boolean, isInteractive?: boolean, handleAdd?: (pokemon: Pokemon) => void, handleRemove?: (pokemon: Pokemon) => void }) => {
    const [flipped, setFlipped] = useState<boolean>(false)
    const officialArtworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.collector_number}.png`

    return (
        <div className="group perspective w-full max-w-[250px] h-72">
            <div className={`relative w-full h-full transition-transform duration-700 transform-style preserve-3d ${flipped ? 'rotate-y-180' : ''} md:group-hover:rotate-y-180`}
                onClick={() => setFlipped(!flipped)}
            >
                {/* Front */}
                <motion.div
                    className="absolute w-full h-full backface-hidden rounded-lg shadow-lg p-4 flex flex-col items-center justify-center border border-white"
                    style={{ backgroundColor: colorTypes[`${pokemon.type.toLowerCase()}`] }}
                >
                    <Image src={officialArtworkUrl} alt={pokemon.name} width={100} height={100} />

                    <h2 className="text-lg font-bold mt-2">{pokemon.name}</h2>
                    <p className="text-sm">{pokemon.rarity}</p>
                </motion.div>

                {/* Back */}
                <motion.div
                    className="absolute w-full h-full backface-hidden rotate-y-180 rounded-lg shadow-lg p-4 flex flex-col items-start justify-start bg-gray-100 border border-white"
                >
                    <p className='text-[12px] font-bold'>HP: {pokemon.hp}</p>
                    <div className='flex flex-row justify-center items-center gap-2'>
                        <span className='text-[12px] font-bold flex flex-row justify-center my-2 gap-2'><TypeBadge key={pokemon.type} type={pokemon.type} /></span>

                    </div>
                    <p className='text-[12px] font-bold'>Attack: {pokemon.attacks[0]?.name} ({pokemon.attacks[0]?.damage})</p>



                    <div className="flex justify-between w-full text-xs mt-2">
                        <div className="flex flex-col items-start">
                            <span className="font-semibold mb-1">Weak</span>
                            <div className="grid grid-cols-3 gap-2">
                                {pokemon.weakness.map((type, i) => (
                                    <TypeBadge key={i} type={type} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between w-full text-xs mt-2">
                        <div className="flex flex-col items-start">
                            <span className="font-semibold mb-1">Resist</span>
                            <div className="grid grid-cols-3 gap-2">
                                {pokemon.resistance.map((type, i) => (
                                    <TypeBadge key={i} type={type} />
                                ))}
                            </div>
                        </div>
                    </div>
                    {isInteractive &&
                        <div className='flex flex-1 justify-center items-center'>
                            {isAvailable ? <button onClick={() => handleAdd && handleAdd(pokemon)} className='btn btn-success btn-xs'>Add</button> : <button onClick={() => handleRemove && handleRemove(pokemon)} className='btn btn-error btn-xs'>Remove</button>}

                        </div>
                    }

                </motion.div>
            </div>
        </div>
    )
}
export default FlipCard