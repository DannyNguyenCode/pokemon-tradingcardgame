'use client'
import React from 'react'
import { Pokemon } from '@app/lib/definitions'
import { Grid, Box } from '@mui/material'
import PokemonCard from './PokemonCard'
const CardList = ({ data }: { data: Pokemon[] }) => {
    return (
        <Box sx={{ flexGrow: 1, margin: '2em' }}>
            <Grid container spacing={2}>
                {data.map((pokemon) => {
                    return (
                        <Grid key={pokemon.id} size={{ sm: 12, md: 3 }}>
                            <PokemonCard pokemon={pokemon} />
                        </Grid>
                    )
                })}

            </Grid>
        </Box>

    )
}

export default CardList