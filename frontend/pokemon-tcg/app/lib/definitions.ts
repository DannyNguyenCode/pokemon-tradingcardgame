export type Pokemon = {
    "id": string,
    "created_at": Date,
    "name": string,
    "rarity": string,
    "type": string,
    "hp": number,
    "set_code": string,
    "collector_number": string,
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
    name: string | null;
    damage: number | null;
    cost: string | null;
};

export type RawPokemon = {
    id: string;
    name: string;
    rarity: string;
    type: string;
    hp: number;
    set_code: string;
    collector_number: string;
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