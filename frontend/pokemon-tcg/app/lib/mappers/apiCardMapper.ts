import type { ApiCardJson, Cards, Pokemon } from '@/lib/definitions'

function asRecord(raw: unknown): Record<string, unknown> {
    return raw !== null && typeof raw === 'object' && !Array.isArray(raw)
        ? (raw as Record<string, unknown>)
        : {}
}

function num(value: unknown, fallback: number): number {
    const n = Number(value)
    return Number.isFinite(n) ? n : fallback
}

function parseDate(value: unknown): Date {
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value
    if (typeof value === 'string' || typeof value === 'number') {
        const d = new Date(value)
        if (!Number.isNaN(d.getTime())) return d
    }
    return new Date(0)
}

function toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return []
    return value.map((v) => (typeof v === 'string' ? v : String(v)))
}

function officialArtworkFallback(collectorNumber: number): string {
    const n = Math.max(1, Math.floor(collectorNumber))
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${n}.png`
}

function normalizePrimaryAttack(raw: unknown): { name: string; damage: number; cost: string } {
    const o = asRecord(raw)
    return {
        name: o.name != null ? String(o.name) : '',
        damage: num(o.damage, 0),
        cost: o.cost != null ? String(o.cost) : '',
    }
}

function normalizeSecondaryAttack(raw: unknown): {
    name: string | undefined
    damage: number | undefined
    cost: string | undefined
} {
    const o = asRecord(raw)
    const name = o.name != null ? String(o.name) : ''
    const damage = o.damage != null ? num(o.damage, 0) : undefined
    const cost = o.cost != null ? String(o.cost) : undefined
    const empty = !name && damage === undefined && (cost === undefined || cost === '')
    if (empty) {
        return { name: undefined, damage: undefined, cost: undefined }
    }
    return {
        name: name || undefined,
        damage,
        cost,
    }
}

function normalizeAttacks(raw: unknown): Pokemon['attacks'] {
    const arr = Array.isArray(raw) ? raw : []
    const primary = normalizePrimaryAttack(arr[0])
    const secondary = normalizeSecondaryAttack(arr[1])
    return [primary, secondary]
}

function fallbackId(r: Record<string, unknown>): string {
    const cn = num(r.collector_number, 0)
    const sc = String(r.set_code ?? 'na').replace(/\s+/g, '-')
    const nm = String(r.name ?? 'card').replace(/\s+/g, '-')
    return `card-${sc}-${cn}-${nm}`
}

function resolveImageUrl(r: Record<string, unknown>): string {
    const url = r.image_url != null ? String(r.image_url).trim() : ''
    if (url) return url
    return officialArtworkFallback(num(r.collector_number, 1))
}

/**
 * Maps backend `Card.to_dict()` JSON into the {@link Pokemon} view model used across the UI.
 */
export function mapApiCardToPokemon(raw: unknown): Pokemon {
    const r = asRecord(raw)
    const id = String(r.id ?? '').trim() || fallbackId(r)

    return {
        id,
        created_at: parseDate(r.created_at),
        name: String(r.name ?? 'Unknown'),
        rarity: String(r.rarity ?? ''),
        type: String(r.type ?? 'normal').trim() || 'normal',
        hp: Math.max(0, num(r.hp, 0)),
        set_code: String(r.set_code ?? ''),
        collector_number: num(r.collector_number, 0),
        description: String(r.description ?? ''),
        attacks: normalizeAttacks(r.attacks),
        weakness: toStringArray(r.weakness),
        resistance: toStringArray(r.resistance),
        retreat_cost: Math.max(0, num(r.retreat_cost, 0)),
        image_url: resolveImageUrl(r),
    }
}

export function mapApiCardsToPokemon(items: unknown): Pokemon[] {
    if (!Array.isArray(items)) return []
    return items.map(mapApiCardToPokemon)
}

/**
 * Normalizes a deck row (`DeckCard.to_dict()`): `{ deck_id, card_id, card }`.
 */
export function mapApiDeckCardRowToCards(raw: unknown): Cards {
    const r = asRecord(raw)
    const nested = r.card
    const mapped = mapApiCardToPokemon(nested)

    const cardId = String(r.card_id ?? '').trim()
    const deckId = String(r.deck_id ?? '').trim()

    return {
        card_id: cardId || mapped.id,
        deck_id: deckId,
        card: mapped,
        currentHp: typeof r.currentHp === 'number' ? r.currentHp : undefined,
        status: (r.status as Cards['status']) ?? undefined,
    }
}

export function mapApiDeckCardRowsToCards(items: unknown): Cards[] {
    if (!Array.isArray(items)) return []
    return items.map(mapApiDeckCardRowToCards)
}

/** Optional: map JSON that already matches {@link ApiCardJson} (typed call sites). */
export function mapKnownApiCard(json: ApiCardJson): Pokemon {
    return mapApiCardToPokemon(json)
}
