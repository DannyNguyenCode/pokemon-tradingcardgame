'use client'
import React from 'react'
import { Pokemon } from '@app/lib/definitions'

const PokemonCard = ({ pokemon }: { pokemon: Pokemon }) => {
    return (
        <div data-theme="dark" className="card bg-base-100 w-96 shadow-sm">
            <figure>
                <img
                    src={pokemon.image_url}
                    alt={pokemon.name} />
            </figure>
            <div className="card-body">
                <h2 className="card-title">{pokemon.name}</h2>
                <p>{pokemon.attacks[0].name}</p>
                <div className="card-actions justify-end">
                    <button className="btn btn-primary">View</button>
                </div>
            </div>
        </div>
    )
}

export default PokemonCard