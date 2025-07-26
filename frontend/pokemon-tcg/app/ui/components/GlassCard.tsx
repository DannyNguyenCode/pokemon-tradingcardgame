'use client'
import Image from "next/image"
import { Pokemon } from "@/lib/definitions"
import { motion } from 'framer-motion'
const TYPE_ICON_INDEX: Record<string, number> = {
    normal: 1, fighting: 2, flying: 3, poison: 4, ground: 5, rock: 6,
    bug: 7, ghost: 8, steel: 9, fire: 10, water: 11, grass: 12,
    electric: 13, psychic: 14, ice: 15, dragon: 16, dark: 17, fairy: 18
};
const GlassCard = ({ pokemon }: { pokemon: Pokemon }) => {
    return (
        <motion.div
            className="backdrop-blur-md bg-white/30 border border-white/20 rounded-xl p-4 shadow-xl w-60 relative"
            whileHover={{ scale: 1.03 }}
        >
            <Image src={pokemon.image_url} alt={pokemon.name} width={180} height={180} className="mx-auto" />
            <h2 className="text-xl text-white font-semibold text-center mt-2">{pokemon.name}</h2>
            <div className="flex justify-center gap-2 mt-1">
                {pokemon.weakness.map((type, i) => (
                    <motion.img
                        key={i}
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-vi/x-y/${TYPE_ICON_INDEX[type.toLowerCase()]}.png`}
                        alt={type}
                        width={24}
                        height={24}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.2 }}
                    />
                ))}
            </div>
        </motion.div>
    )
}
export default GlassCard