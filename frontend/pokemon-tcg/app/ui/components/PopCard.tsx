'use client'
import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Pokemon } from '@/lib/definitions'
import TypeBadge from './TypeBadge'

const colorTypes: Record<string, string> = {
    normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C', grass: '#7AC74C',
    ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1', ground: '#E2BF65', flying: '#A98FF3',
    psychic: '#F95587', bug: '#A6B91A', rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC',
    dark: '#705746', steel: '#B7B7CE', fairy: '#D685AD',
};

const PopCard = ({
    pokemon,
    isAvailable,
    onToggle,
}: {
    pokemon: Pokemon
    isAvailable: boolean
    onToggle: (poke: Pokemon) => void
}) => {
    const [expanded, setExpanded] = useState(false)
    const officialArtworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.collector_number}.png`

    return (
        <motion.div
            onClick={() => setExpanded(!expanded)}
            className="cursor-pointer w-52 h-auto rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col items-center"
        >
            <div className='w-full h-full flex flex-col items-center p-2' style={{ backgroundColor: colorTypes[`${pokemon.type.toLowerCase()}`] }}>
                <Image src={officialArtworkUrl} alt={pokemon.name} width={96} height={96} />
                <h2 className="text-lg font-bold mt-1">{pokemon.name}</h2>


            </div>
            <AnimatePresence initial={false}>
                {expanded ? (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1, scale: 1 }}
                        exit={{ height: 0, opacity: 0, scale: 0 }}
                        className="px-4 pb-4 text-sm text-gray-700 w-full"
                    >


                        <div className="pl-2 pr-2 flex flex-col items-start text-start" >
                            <div className='flex flex-row justify-start items-start gap-2'>

                                <span className='text-[12px] font-bold flex flex-row justify-center my-2 gap-2'>
                                    <TypeBadge key={pokemon.type} type={pokemon.type} />
                                </span>
                            </div>
                            <span className="text-[12px] font-bold">{pokemon.rarity}</span>
                            <span className="text-[12px] font-bold">{pokemon.hp} HP</span>
                            <span className='text-[12px] font-bold'>Attack: {pokemon.attacks[0]?.name} ({pokemon.attacks[0]?.damage})</span>
                        </div>
                        <div className="flex justify-between w-full text-xs p-2">
                            <div className="flex flex-col items-start">
                                <span className="text-[12px] font-bold mb-1">Weak</span>
                                <div className="grid grid-cols-3 gap-2">
                                    {pokemon.weakness.map((type, i) => (
                                        <TypeBadge key={i} type={type} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between w-full text-xs mt-2 pl-2 pr-2 pb-2">
                            <div className="flex flex-col items-start">
                                <span className="text-[12px] font-bold mb-1">Resist</span>
                                <div className="grid grid-cols-3 gap-2">
                                    {pokemon.resistance.map((type, i) => (
                                        <TypeBadge key={i} type={type} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            className={`btn btn-xs mx-2 mt-2 p-2 ${isAvailable ? 'btn-success' : 'btn-error'}`}
                            onClick={(e) => {
                                e.stopPropagation()
                                onToggle(pokemon)
                            }}
                        >
                            {isAvailable ? 'Add' : 'Remove'}
                        </button>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </motion.div>
    )
}

export default PopCard
