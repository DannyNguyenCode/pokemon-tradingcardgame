import React from 'react'

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
}

const TypeBadge = ({ type }: { type: string }) => {
    const color = colorTypes[type.toLowerCase()] || '#A8A77A'

    return (
        <div
            className="px-1 py-0.5 inline-flex rounded-full items-center justify-center text-[10px] font-bold uppercase shadow"
            style={{
                backgroundColor: color,
                color: 'white',
                textShadow: '0 1px 1px rgba(0,0,0,0.3)',
            }}
            title={type}
        >
            {type}
        </div>
    )
}

export default TypeBadge
