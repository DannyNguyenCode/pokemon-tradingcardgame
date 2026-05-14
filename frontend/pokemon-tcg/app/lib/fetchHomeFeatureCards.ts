import { mapApiCardsToPokemon } from '@/lib/mappers/apiCardMapper'
import type { Pokemon } from '@/lib/definitions'
import {
    fallbackHeroPokemon,
    fallbackKantoStarters,
    fallbackLegendaryBirds,
} from '@/lib/homeCardFallbacks'

/**
 * First catalog card matching a name search — same `/api/cards/` contract as the catalog page.
 * Prefers exact name match (case-insensitive), then substring, then first row.
 */
export async function fetchFirstCatalogCardByName(searchName: string): Promise<Pokemon | null> {
    const base = process.env.NEXT_PUBLIC_BASE_API_URL?.replace(/\/$/, '')
    if (!base) return null

    const params = new URLSearchParams({
        page: '1',
        count_per_page: '24',
        pokemon_name: searchName,
    })

    try {
        const res = await fetch(`${base}/api/cards/?${params.toString()}`, {
            next: { revalidate: 120 },
        })
        if (!res.ok) return null
        const json = (await res.json()) as { data?: unknown }
        const list = mapApiCardsToPokemon(json?.data)
        if (list.length === 0) return null

        const lower = searchName.toLowerCase().trim()
        return (
            list.find((c) => c.name.trim().toLowerCase() === lower) ??
            list.find((c) => c.name.toLowerCase().includes(lower)) ??
            list[0] ??
            null
        )
    } catch {
        return null
    }
}

const HOME_FEATURE_NAMES = [
    'Charizard',
    'Articuno',
    'Zapdos',
    'Moltres',
    'Bulbasaur',
    'Charmander',
    'Squirtle',
] as const

export type HomeFeatureCards = {
    heroPokemon: Pokemon
    legendaryBirds: Pokemon[]
    kantoStarters: Pokemon[]
}

/** Loads the same card records the catalog would list for each featured name (with offline fallbacks). */
export async function fetchHomeFeatureCards(): Promise<HomeFeatureCards> {
    const rows = await Promise.all(HOME_FEATURE_NAMES.map((name) => fetchFirstCatalogCardByName(name)))

    const heroPokemon = rows[0] ?? fallbackHeroPokemon

    const legendaryBirds = [1, 2, 3].map((idx, i) => rows[idx] ?? fallbackLegendaryBirds[i]!)
    const kantoStarters = [4, 5, 6].map((idx, i) => rows[idx] ?? fallbackKantoStarters[i]!)

    return { heroPokemon, legendaryBirds, kantoStarters }
}
