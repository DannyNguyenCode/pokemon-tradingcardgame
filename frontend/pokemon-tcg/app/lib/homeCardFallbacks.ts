import type { Pokemon } from '@/lib/definitions'

const pokeArt = (id: number) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`

const noSecondAttack: Pokemon['attacks'][1] = {
    name: undefined,
    damage: undefined,
    cost: undefined,
}

function showcasePokemon(o: {
    id: string
    name: string
    type: string
    hp: number
    dex: number
    description: string
    attackName: string
    attackDamage: number
    attackCost: string
    weakness: string[]
}): Pokemon {
    return {
        id: o.id,
        created_at: new Date(0),
        name: o.name,
        rarity: 'Rare Holo',
        type: o.type,
        hp: o.hp,
        set_code: 'kanto',
        collector_number: o.dex,
        description: o.description,
        attacks: [
            { name: o.attackName, damage: o.attackDamage, cost: o.attackCost },
            noSecondAttack,
        ],
        weakness: o.weakness,
        resistance: [],
        retreat_cost: 2,
        image_url: pokeArt(o.dex),
    }
}

/** Used when the catalog API is unavailable or has no matching row. */
export const fallbackHeroPokemon: Pokemon = {
    id: 'hero-charizard',
    created_at: new Date(0),
    name: 'Charizard',
    rarity: 'Rare Holo',
    type: 'Fire',
    hp: 120,
    set_code: 'kanto',
    collector_number: 6,
    description: 'Spits fire that is hot enough to melt boulders.',
    attacks: [
        { name: 'Fire Spin', damage: 80, cost: '{R}{R}{R}' },
        { name: 'Wing Attack', damage: 30, cost: '{R}' },
    ],
    weakness: ['Water'],
    resistance: [],
    retreat_cost: 2,
    image_url: pokeArt(6),
}

export const fallbackLegendaryBirds: Pokemon[] = [
    showcasePokemon({
        id: 'featured-articuno',
        name: 'Articuno',
        type: 'Ice',
        hp: 90,
        dex: 144,
        description:
            'A legendary bird Pokémon. It freezes water that is contained in winter air and makes it snow.',
        attackName: 'Blizzard',
        attackDamage: 120,
        attackCost: '{ice}',
        weakness: ['Fire'],
    }),
    showcasePokemon({
        id: 'featured-zapdos',
        name: 'Zapdos',
        type: 'Electric',
        hp: 90,
        dex: 145,
        description:
            'A legendary Pokémon that is said to live in thunderclouds. It freely controls lightning bolts.',
        attackName: 'Thunder',
        attackDamage: 120,
        attackCost: '{electric}',
        weakness: ['Ground'],
    }),
    showcasePokemon({
        id: 'featured-moltres',
        name: 'Moltres',
        type: 'Fire',
        hp: 90,
        dex: 146,
        description:
            'One of the legendary bird Pokémon. Those who see it are overwhelmed by its orange wings.',
        attackName: 'Sky Attack',
        attackDamage: 120,
        attackCost: '{fire}',
        weakness: ['Water'],
    }),
]

export const fallbackKantoStarters: Pokemon[] = [
    showcasePokemon({
        id: 'featured-bulbasaur',
        name: 'Bulbasaur',
        type: 'Grass',
        hp: 45,
        dex: 1,
        description: 'There is a plant seed on its back right from the day this Pokémon is born.',
        attackName: 'Vine Whip',
        attackDamage: 45,
        attackCost: '{G}',
        weakness: ['Fire'],
    }),
    showcasePokemon({
        id: 'featured-charmander',
        name: 'Charmander',
        type: 'Fire',
        hp: 39,
        dex: 4,
        description: 'From the time it is born, a flame burns at the tip of its tail.',
        attackName: 'Ember',
        attackDamage: 40,
        attackCost: '{R}',
        weakness: ['Water'],
    }),
    showcasePokemon({
        id: 'featured-squirtle',
        name: 'Squirtle',
        type: 'Water',
        hp: 44,
        dex: 7,
        description:
            'When it retracts its long neck into its shell, it squirts out water with vigorous force.',
        attackName: 'Water Gun',
        attackDamage: 40,
        attackCost: '{W}',
        weakness: ['Electric'],
    }),
]
