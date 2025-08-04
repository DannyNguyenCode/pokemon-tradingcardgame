'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Cards } from '@/lib/definitions'
import TypeBadge from '../TypeBadge'

export default function GameCard({
    card,
    onClick,
    isActive = true,
    isDisabled = false,
}: {
    card: Cards
    onClick?: (card: Cards) => void
    isActive?: boolean
    isDisabled?: boolean
}) {
    const pokemon = card.card
    const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.collector_number}.png`

    return (
        <motion.button
            whileHover={{ scale: isActive && !isDisabled ? 1.05 : 1 }}
            whileTap={{ scale: isActive && !isDisabled ? 0.97 : 1 }}
            className={`relative w-32 h-44 md:w-40 md:h-56 rounded-lg shadow-lg overflow-hidden border-2 transition-all duration-300 flex flex-col items-center justify-between p-2
        ${isDisabled
                    ? 'cursor-not-allowed'
                    : isActive
                        ? 'cursor-pointer border-yellow-300 hover:shadow-xl hover:border-yellow-400'
                        : 'border-gray-300'
                }`}
            onClick={() => onClick?.(card)}
        >
            {/* Background */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    background: `radial-gradient(circle at center, ${typeColor(pokemon.type)}66, #1f1f1f)`,
                }}
            />

            {/* Artwork */}
            <div className="z-10 mt-2">
                <Image
                    src={artworkUrl}
                    alt={pokemon.name}
                    width={80}
                    height={80}
                    className="drop-shadow-md"
                />
            </div>

            {/* Info */}
            <div className="z-10 w-full text-center">
                <h2 className="text-sm font-bold text-white tracking-tight">{pokemon.name}</h2>
                <p className="text-[11px] text-white/70 font-mono">HP: {pokemon.hp}</p>
            </div>

            {/* Type + Attack */}
            <div className="z-10 w-full px-2 pb-2 flex items-center justify-between">
                <TypeBadge type={pokemon.type} />
                <span className="text-[11px] text-white font-bold">
                    ⚔ {pokemon.attacks?.[0]?.damage || '—'}
                </span>
            </div>
        </motion.button>
    )
}

function typeColor(type: string) {
    const colors: Record<string, string> = {
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
    }
    return colors[type.toLowerCase()] || '#777'
}
