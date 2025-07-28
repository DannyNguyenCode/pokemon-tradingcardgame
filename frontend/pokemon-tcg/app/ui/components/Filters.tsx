'use client'
import { useRouter, useSearchParams } from 'next/navigation'
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
};
// group name is needed + unique in order for multiple filters to be added across the app.
// if there are similar group names, some filters will not work properly
// example the filter-reset input will not show when radio is clicked
const Filters = ({ groupName }: { groupName: string }) => {
    const params = useSearchParams()
    const router = useRouter()
    const selectedFilter = params.get('type_filter') || '';

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
        <div className="filter flex flex-row justify-start mb-2 md:mb-0">

            <input onClick={() => handleFilterChange('')} className="btn filter-reset" type="radio" name={groupName} aria-label="All" />
            <input className="btn" checked={selectedFilter === 'fire'} onChange={() => handleFilterChange('fire')} style={{ backgroundColor: colorTypes['fire'] }} type="radio" name={groupName} aria-label="Fire" />
            <input className="btn" checked={selectedFilter === 'water'} onChange={() => handleFilterChange('water')} style={{ backgroundColor: colorTypes['water'] }} type="radio" name={groupName} aria-label="Water" />
            <input className="btn" checked={selectedFilter === 'grass'} onChange={() => handleFilterChange('grass')} style={{ backgroundColor: colorTypes['grass'] }} type="radio" name={groupName} aria-label="Grass" />
            <input className="btn" checked={selectedFilter === 'electric'} onChange={() => handleFilterChange('electric')} style={{ backgroundColor: colorTypes['electric'] }} type="radio" name={groupName} aria-label="Electric" />
            <input className="btn" checked={selectedFilter === 'psychic'} onChange={() => handleFilterChange('psychic')} style={{ backgroundColor: colorTypes['psychic'] }} type="radio" name={groupName} aria-label="Psychic" />
            <input className="btn" checked={selectedFilter === 'ice'} onChange={() => handleFilterChange('ice')} style={{ backgroundColor: colorTypes['ice'] }} type="radio" name={groupName} aria-label="Ice" />
            <input className="btn" checked={selectedFilter === 'fighting'} onChange={() => handleFilterChange('fighting')} style={{ backgroundColor: colorTypes['fighting'] }} type="radio" name={groupName} aria-label="Fighting" />
            <input className="btn" checked={selectedFilter === 'poison'} onChange={() => handleFilterChange('poison')} style={{ backgroundColor: colorTypes['poison'] }} type="radio" name={groupName} aria-label="Poison" />
            <input className="btn" checked={selectedFilter === 'ground'} onChange={() => handleFilterChange('ground')} style={{ backgroundColor: colorTypes['ground'] }} type="radio" name={groupName} aria-label="Ground" />
            <input className="btn" checked={selectedFilter === 'flying'} onChange={() => handleFilterChange('flying')} style={{ backgroundColor: colorTypes['flying'] }} type="radio" name={groupName} aria-label="Flying" />
            <input className="btn" checked={selectedFilter === 'rock'} onChange={() => handleFilterChange('rock')} style={{ backgroundColor: colorTypes['rock'] }} type="radio" name={groupName} aria-label="Rock" />
            <input className="btn" checked={selectedFilter === 'bug'} onChange={() => handleFilterChange('bug')} style={{ backgroundColor: colorTypes['bug'] }} type="radio" name={groupName} aria-label="Bug" />
            <input className="btn" checked={selectedFilter === 'ghost'} onChange={() => handleFilterChange('ghost')} style={{ backgroundColor: colorTypes['ghost'] }} type="radio" name={groupName} aria-label="Ghost" />
            <input className="btn" checked={selectedFilter === 'steel'} onChange={() => handleFilterChange('steel')} style={{ backgroundColor: colorTypes['steel'] }} type="radio" name={groupName} aria-label="Steel" />
            <input className="btn" checked={selectedFilter === 'fairy'} onChange={() => handleFilterChange('fairy')} style={{ backgroundColor: colorTypes['fairy'] }} type="radio" name={groupName} aria-label="Fairy" />
            <input className="btn" checked={selectedFilter === 'dragon'} onChange={() => handleFilterChange('dragon')} style={{ backgroundColor: colorTypes['dragon'] }} type="radio" name={groupName} aria-label="Dragon" />
            <input className="btn" checked={selectedFilter === 'dark'} onChange={() => handleFilterChange('dark')} style={{ backgroundColor: colorTypes['dark'] }} type="radio" name={groupName} aria-label="Darkness" />
            <input className="btn" checked={selectedFilter === 'normal'} onChange={() => handleFilterChange('normal')} style={{ backgroundColor: colorTypes['normal'] }} type="radio" name={groupName} aria-label="Normal" />
        </div>
    )
}

export default Filters
