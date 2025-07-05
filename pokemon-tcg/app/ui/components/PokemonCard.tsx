'use client'
import React from 'react'
import { Pokemon } from '@app/lib/definitions'

const PokemonCard = ({ pokemon }: { pokemon: Pokemon }) => {
    const colorTypes: Record<string, string> = {
        normal: '#A8A77A',
        fire: '#EE8130',
        water: '#6390F0',
        electric: '#F7D02C',
        grass: '#7AC74C',
        ice: '#96D9D6',
        fighting: '#C22E28',
        poison: '#A33EA1',
        ground: '#E2BF65',
        flying: '#A98FF3',
        psychic: '#F95587',
        bug: '#A6B91A',
        rock: '#B6A136',
        ghost: '#735797',
        dragon: '#6F35FC',
        dark: '#705746',
        steel: '#B7B7CE',
        fairy: '#D685AD',
    };
    return (
        <div className={`card bg-base-100 shadow-sm`} style={{ backgroundColor: colorTypes[`${pokemon.type.toLowerCase()}`] }}>
            <div className="card-body">
                <h2 className="card-title justify-between" ><span >{pokemon.name}</span>  <span>{pokemon.hp} HP <div className="badge badge-outline" style={{ backgroundColor: colorTypes[`${pokemon.type.toLowerCase()}`] }}>{pokemon.type.toLowerCase()}</div></span></h2>
                <figure>
                    <img
                        src={pokemon.image_url}
                        alt={pokemon.name} />
                </figure>
                <p className='flex justify-between'><span>{pokemon.attacks[0].cost}</span> <span>{pokemon.attacks[0].name}&nbsp;&nbsp;&nbsp;{pokemon.attacks[0].damage}</span></p>
                <p><span>weakness {pokemon.weakness.join(', ')}</span></p>
                <p><span>resistance {pokemon.resistance.join(', ')}</span></p>
                <p>Retreat Cost {pokemon.retreat_cost}</p>
                <p>{pokemon.rarity}</p>

                <div className="card-actions justify-center">
                    <button className="btn btn-primary">Add</button>
                </div>
            </div>


        </div>
    )
}

export default PokemonCard