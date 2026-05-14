export type Pokemon = {
    id: string
    created_at: Date
    name: string
    rarity: string
    type: string
    hp: number
    set_code: string
    collector_number: number
    description: string
    attacks: [
        {
            name: string
            damage: number
            cost: string
        },
        {
            name: string | undefined
            damage: number | undefined
            cost: string | undefined
        },
    ]
    weakness: string[]
    resistance: string[]
    retreat_cost: number
    image_url: string
}

/**
 * Loose JSON shape from backend `Card.to_dict()` / FastAPI (nullable fields, ISO dates).
 * Use {@link mapApiCardToPokemon} to normalize for UI.
 */
export type ApiCardJson = {
    id?: string | null
    created_at?: string | Date | null
    name?: string | null
    rarity?: string | null
    type?: string | null
    /** Second PokéAPI type when dual-type; used server-side for filters. */
    type_secondary?: string | null
    hp?: number | string | null
    set_code?: string | null
    collector_number?: number | string | null
    description?: string | null
    attacks?: unknown
    weakness?: unknown
    resistance?: unknown
    retreat_cost?: number | string | null
    image_url?: string | null
}

/** Deck row from API (`DeckCard.to_dict()`): nested `card` matches {@link ApiCardJson}. */
export type ApiDeckCardRowJson = {
    deck_id?: string | null
    card_id?: string | null
    card?: ApiCardJson | unknown | null
    currentHp?: number | null
    status?: string | null
}

export type Attack = {
    name: string | null | undefined;
    damage: number | null | undefined;
    cost: string | null | undefined;
};

/** @deprecated Prefer {@link ApiCardJson} for wire data and {@link Pokemon} after mapping. */
export type RawPokemon = Pokemon

/** Matches Flask `generate_pagination` / `PaginationSchema` wire JSON (`page_size` snake_case). */
export type Pagination = {
    page: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
    total_count: number;
    page_size: number;
}
export type Cards = {
    card: Pokemon;
    card_id: string;
    deck_id: string;
    currentHp?: number;
    status?: string | 'ko' | null;
};
export type Deck = {
    cards: Cards[];
    created_at: Date
    id: string,
    name: string
}

export type Data = {
    cards: Cards[]
    created_at: Date
    id: string
    name: string
}
export type DeckCardsResponse = {
    data: Data[]
    message: string
    pagination: Pagination
    status: number
}