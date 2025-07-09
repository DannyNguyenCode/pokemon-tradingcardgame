import { RawPokemon } from '../definitions'
export function mapPokemonToCardBase(pokemon: RawPokemon) {
    return {
        name: pokemon.name,
        rarity: pokemon.rarity,
        type: pokemon.type,
        hp: pokemon.hp,
        set_code: pokemon.set_code,
        collector_number: pokemon.collector_number,
        description: pokemon.description ?? "", // must not be null
        weakness: pokemon.weakness ?? [],
        resistance: pokemon.resistance ?? [],
        retreat_cost: pokemon.retreat_cost,
        image_url: pokemon.image_url,
    };
}