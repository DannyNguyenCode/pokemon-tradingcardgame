import typeMap from '@/lib/data/typeMap.json'

export type { Pokemon } from '@/lib/definitions'

type TypeMeta = { color: string; icon: string }

const MAP = typeMap as Record<string, TypeMeta>

/** Normalize backend / TCG wording to keys we store in typeMap (electric ↔ lightning, steel ↔ metal). */
export function normalizePokemonType(type: string): string {
    const k = type.trim().toLowerCase()
    if (k === 'lightning') return 'electric'
    if (k === 'metal') return 'steel'
    if (k === 'darkness') return 'dark'
    return k
}

/**
 * Canonical `type_filter` query value before calling the API (same rules as {@link normalizePokemonType}).
 * Use from catalog/collection requests and Filters so the backend only receives canonical tokens.
 */
export function normalizeTypeFilterParam(type: string): string {
    return normalizePokemonType(type.trim())
}

/** Hex color for gradients / accents (matches existing catalog palette). */
export function typeColor(type: string): string {
    const k = normalizePokemonType(type)
    return MAP[k]?.color ?? MAP.normal.color
}

/** Public `/icons/*.png` URL from `typeMap.json` (TCG wording normalized via `normalizePokemonType`). */
export function typeIconUrl(type: string): string {
    const k = normalizePokemonType(type.trim())
    return MAP[k]?.icon ?? MAP.normal.icon
}

/** Decorative emoji per type (works without icon assets). */
export function typeGlyph(type: string): string {
    const k = normalizePokemonType(type)
    const glyphs: Record<string, string> = {
        fire: '🔥',
        water: '💧',
        electric: '⚡',
        grass: '🌿',
        ice: '❄️',
        fighting: '🥊',
        psychic: '🔮',
        poison: '☠️',
        ground: '🟤',
        flying: '🪶',
        bug: '🐛',
        rock: '🪨',
        ghost: '👻',
        dragon: '🐉',
        dark: '🌑',
        steel: '⚙️',
        fairy: '🧚',
        normal: '⭐',
    }
    return glyphs[k] ?? '⭐'
}
