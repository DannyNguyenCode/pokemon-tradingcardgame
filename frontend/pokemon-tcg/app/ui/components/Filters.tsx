'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { useDebouncedCallback } from 'use-debounce'
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
const Filters = () => {
    const params = useSearchParams()
    const router = useRouter()
    const debouncedSearch = useDebouncedCallback((value: string) => {
        const currentParams = new URLSearchParams(params)
        currentParams.set('pokemon_name', value)
        router.push(`?${currentParams.toString()}`)
    }, 1000)
    const handleFilterChange = (filter: string) => {
        const currentParams = new URLSearchParams(params)

        if (filter === '') {
            // Remove the type_filter parameter entirely when clearing
            currentParams.delete('type_filter')
            // Reset to page 1 when clearing filters
            currentParams.set('page', '1')
        } else {
            currentParams.set('type_filter', filter)
            // Reset to page 1 when applying a new filter
            currentParams.set('page', '1')
        }

        router.push(`?${currentParams.toString()}`)
    }

    return (
        <div className="filter pt-4 flex flex-start items-start">
            <input onClick={() => handleFilterChange('')} className="btn filter-reset" type="radio" name="metaframeworks" aria-label="All" />
            <label className="input mr-2">
                <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <g
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        strokeWidth="2.5"
                        fill="none"
                        stroke="currentColor"
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                    </g>
                </svg>
                <input onChange={(e) => debouncedSearch(e.target.value)} type="search" className="grow" placeholder="Search Pokemon Name" />
            </label>
            <input className="btn" onClick={() => handleFilterChange('fire')} style={{ backgroundColor: colorTypes['fire'] }} type="radio" name="metaframeworks" aria-label="Fire" />
            <input className="btn" onClick={() => handleFilterChange('water')} style={{ backgroundColor: colorTypes['water'] }} type="radio" name="metaframeworks" aria-label="Water" />
            <input className="btn" onClick={() => handleFilterChange('grass')} style={{ backgroundColor: colorTypes['grass'] }} type="radio" name="metaframeworks" aria-label="Grass" />
            <input className="btn" onClick={() => handleFilterChange('electric')} style={{ backgroundColor: colorTypes['electric'] }} type="radio" name="metaframeworks" aria-label="Electric" />
            <input className="btn" onClick={() => handleFilterChange('psychic')} style={{ backgroundColor: colorTypes['psychic'] }} type="radio" name="metaframeworks" aria-label="Psychic" />
            <input className="btn" onClick={() => handleFilterChange('ice')} style={{ backgroundColor: colorTypes['ice'] }} type="radio" name="metaframeworks" aria-label="Ice" />
            <input className="btn" onClick={() => handleFilterChange('fighting')} style={{ backgroundColor: colorTypes['fighting'] }} type="radio" name="metaframeworks" aria-label="Fighting" />
            <input className="btn" onClick={() => handleFilterChange('poison')} style={{ backgroundColor: colorTypes['poison'] }} type="radio" name="metaframeworks" aria-label="Poison" />
            <input className="btn" onClick={() => handleFilterChange('ground')} style={{ backgroundColor: colorTypes['ground'] }} type="radio" name="metaframeworks" aria-label="Ground" />
            <input className="btn" onClick={() => handleFilterChange('flying')} style={{ backgroundColor: colorTypes['flying'] }} type="radio" name="metaframeworks" aria-label="Flying" />
            <input className="btn" onClick={() => handleFilterChange('rock')} style={{ backgroundColor: colorTypes['rock'] }} type="radio" name="metaframeworks" aria-label="Rock" />
            <input className="btn" onClick={() => handleFilterChange('bug')} style={{ backgroundColor: colorTypes['bug'] }} type="radio" name="metaframeworks" aria-label="Bug" />
            <input className="btn" onClick={() => handleFilterChange('ghost')} style={{ backgroundColor: colorTypes['ghost'] }} type="radio" name="metaframeworks" aria-label="Ghost" />
            <input className="btn" onClick={() => handleFilterChange('steel')} style={{ backgroundColor: colorTypes['steel'] }} type="radio" name="metaframeworks" aria-label="Steel" />
            <input className="btn" onClick={() => handleFilterChange('fairy')} style={{ backgroundColor: colorTypes['fairy'] }} type="radio" name="metaframeworks" aria-label="Fairy" />
            <input className="btn" onClick={() => handleFilterChange('dragon')} style={{ backgroundColor: colorTypes['dragon'] }} type="radio" name="metaframeworks" aria-label="Dragon" />
            <input className="btn" onClick={() => handleFilterChange('dark')} style={{ backgroundColor: colorTypes['dark'] }} type="radio" name="metaframeworks" aria-label="Darkness" />
            <input className="btn" onClick={() => handleFilterChange('normal')} style={{ backgroundColor: colorTypes['normal'] }} type="radio" name="metaframeworks" aria-label="Normal" />
        </div>
    )
}

export default Filters
