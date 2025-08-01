export type Pokemon = {
    "id": string,
    "created_at": Date,
    "name": string,
    "rarity": string,
    "type": string,
    "hp": number,
    "set_code": string,
    "collector_number": number,
    "description": string,
    "attacks": [
        {
            "name": string,
            "damage": number,
            "cost": string,
        },
        {
            "name": string | undefined,
            "damage": number | undefined,
            "cost": string | undefined,
        },
    ],
    "weakness": string[],
    "resistance": string[],
    "retreat_cost": number,
    "image_url": string,
}

export type Attack = {
    name: string | null | undefined;
    damage: number | null | undefined;
    cost: string | null | undefined;
};

export type RawPokemon = {
    id: string;
    name: string;
    rarity: string;
    type: string;
    hp: number;
    set_code: string;
    collector_number: number;
    description?: string | null;
    attacks: Attack[];
    weakness?: string[];
    resistance?: string[];
    retreat_cost: number;
    image_url: string;
    created_at: Date;
};

export type Pagination = {
    page: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
    total_count: number;
    pageSize: number;
}
export type Cards = {
    card: Pokemon;
    card_id: string;
    deck_id: string;
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