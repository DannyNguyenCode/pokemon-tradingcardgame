'use client'
import React from 'react'
import { Pokemon } from '@/lib/definitions'
import { useAppDispatch } from '@/lib/hooks'
import { loadToastifyState } from '@/lib/features/toastify/toastifySlice'
import { mapPokemonToCardBase } from '@/lib/mappers/pokemonCreateMapper'
const PokemonAddBtn = ({ pokemonData }: { pokemonData: Pokemon }) => {
    const payload = mapPokemonToCardBase(pokemonData)
    const dispatch = useAppDispatch()

    const handleAddClick = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/cards/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                throw new Error('Network response was not ok')
            }
            const response = await res.json()
            dispatch(loadToastifyState(`${response.data.name} has been added to your collection`))
        } catch (error) {
            console.error(error)
            dispatch(loadToastifyState(`Something went wrong!`))
        }

    }
    return (
        <button className="btn btn-primary" onClick={handleAddClick}>Add</button>
    )
}

export default PokemonAddBtn