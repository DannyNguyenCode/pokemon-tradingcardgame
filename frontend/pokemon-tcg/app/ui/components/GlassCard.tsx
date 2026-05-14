'use client'
import Image from "next/image"
import { Pokemon } from "@/lib/definitions"
import { normalizePokemonType, typeIconUrl } from '@/lib/pokemon'
import { motion } from 'framer-motion'
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
                    <motion.div
                        key={i}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.2 }}
                        className="relative h-6 w-6"
                    >
                        <Image
                            src={typeIconUrl(type)}
                            alt={normalizePokemonType(type)}
                            fill
                            className="rounded-full object-cover"
                            sizes="24px"
                            title={type}
                        />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}
export default GlassCard