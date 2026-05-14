
'use client'
import Link from 'next/link'
import { Lexend } from 'next/font/google'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import ToastifyComponent from "./ui/components/ToastifyComponent";
import { useEffect } from 'react';
import { useAppDispatch } from './lib/hooks';
import { clearToastifyState } from './lib/features/toastify/toastifySlice';
import type { Pokemon } from './lib/definitions'
import { HoloCard } from './ui/components/HoloCard'

const lexend = Lexend({
    subsets: ['latin'],
    display: 'swap',
})

const heroPattern =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAhXEOoxmmWgHyxzbyG4mZ76kO9caToGa8O55OHGQ2ody4qUKnml-FVVriyluSlf8_-82V-QLPewYTCg-b63S2mLDYI-LtPpajRgmdhakoXIrQA74NuoB2tZSko0vX-yohjXAMjV2dB4ZWN_cRkIcAQx4CU9_FNLVMAA3yN8P395CAwZt-68uoI7pHsStzaydUl2-pGUflmRM0ytaCuwYVhXRx6yWlMc_R6tD0vVSak7hov_d7lScPC8BzsfjS8GZSl7vONr9ETxSza"

export type HomeClientProps = {
    heroPokemon: Pokemon
    legendaryBirds: Pokemon[]
    kantoStarters: Pokemon[]
}

export default function HomeClient({ heroPokemon, legendaryBirds, kantoStarters }: HomeClientProps) {
    const router = useRouter()
    const dispatch = useAppDispatch()
    useEffect(() => {
        dispatch(clearToastifyState())
    }, [dispatch])

    return (
        <main
            className={`${lexend.className} hq-home flex min-h-0 flex-1 flex-col bg-hq-background text-hq-on-background antialiased`}
        >
            <div className="flex min-h-0 flex-1 flex-col pb-24 md:pb-12">
                {/* Hero */}
                <section className="relative w-full overflow-hidden bg-hq-surface-container-low py-12 px-hq-container-padding md:py-20">
                    <div
                        className="absolute inset-0 z-0 opacity-5"
                        style={{ backgroundImage: `url('${heroPattern}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        aria-hidden
                    />
                    <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-hq-section-gap lg:grid-cols-12">
                        <div className="flex flex-col gap-hq-stack-md lg:col-span-7">
                            <motion.div
                                className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-hq-secondary/20 bg-hq-secondary/10 px-3 py-1"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <span className="material-symbols-outlined text-sm text-hq-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>electric_bolt</span>
                                <span className="hq-text-label-caps text-hq-secondary">ELITE TRAINER NETWORK</span>
                            </motion.div>
                            <motion.h1
                                className="hq-text-display-xl text-hq-on-background"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.05 }}
                            >
                                Build Your <span className="text-hq-primary">Deck.</span>
                                <br />
                                Battle with <span className="text-hq-secondary">Heart.</span>
                            </motion.h1>
                            <motion.p
                                className="hq-text-body-md mt-4 max-w-xl text-hq-on-surface/70"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                            >
                                The ultimate Kanto Pokémon TCG experience. Collect iconic legends, master complex strategies, and climb the global ranks in a modern competitive environment designed for the true Pokemon Master.
                            </motion.p>
                            <motion.div
                                className="mt-8 flex flex-wrap gap-hq-gutter"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.35, duration: 0.6 }}
                            >
                                <button
                                    type="button"
                                    onClick={() => router.push('/play')}
                                    className="hq-text-label-caps flex items-center gap-2 rounded-hq-lg bg-hq-primary px-8 py-4 text-hq-on-primary shadow-md shadow-hq-primary/20 transition-all hover:brightness-95 active:scale-95"
                                >
                                    <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>swords</span>
                                    ENTER BATTLE
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.push('/collection')}
                                    className="hq-text-label-caps flex items-center gap-2 rounded-hq-lg border border-slate-200 bg-white px-8 py-4 text-hq-on-surface shadow-sm transition-all hover:bg-slate-50 active:scale-95"
                                >
                                    <span className="material-symbols-outlined">style</span>
                                    BUILD DECK
                                </button>
                            </motion.div>
                        </div>
                        <motion.div
                            className="relative mt-12 flex aspect-square w-full items-center justify-center lg:col-span-5 lg:mt-0"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.25, duration: 0.65 }}
                        >
                            <div className="absolute h-[120%] w-[120%] rounded-full bg-hq-primary/10 blur-[100px]" aria-hidden />
                            <div className="relative z-10 w-[min(100%,14rem)] rotate-[-12deg]">
                                <HoloCard pokemon={heroPokemon} />
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Featured — Legendary Birds & Kanto starters */}
                <section className="mx-auto max-w-7xl px-hq-container-padding py-hq-section-gap">
                    <div className="mb-hq-gutter flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <h2 className="hq-text-headline-lg uppercase tracking-tight text-hq-on-surface">
                            FEATURED
                        </h2>
                        <Link
                            href="/catalog"
                            className="hq-text-label-caps flex items-center gap-1 text-hq-secondary hover:underline"
                        >
                            VIEW ALL <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </Link>
                    </div>

                    <h3 className="mb-hq-stack-md hq-text-headline-md uppercase tracking-tight text-hq-on-surface">
                        Legendary birds
                    </h3>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3">
                        {legendaryBirds.map((pokemon) => (
                            <FeaturedHoloLink key={pokemon.id} pokemon={pokemon} />
                        ))}
                    </div>

                    <h3 className="mb-hq-stack-md mt-hq-section-gap hq-text-headline-md uppercase tracking-tight text-hq-on-surface">
                        Kanto starters
                    </h3>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3">
                        {kantoStarters.map((pokemon) => (
                            <FeaturedHoloLink key={pokemon.id} pokemon={pokemon} />
                        ))}
                    </div>
                </section>
            </div>

            <ToastifyComponent />
        </main>
    )
}

function FeaturedHoloLink({ pokemon }: { pokemon: Pokemon }) {
    return (
        <div className="flex justify-center">
            <Link
                href={`/catalog?pokemon_name=${encodeURIComponent(pokemon.name)}`}
                className="block w-full max-w-[14rem] transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hq-primary"
            >
                <HoloCard pokemon={pokemon} />
            </Link>
        </div>
    )
}
