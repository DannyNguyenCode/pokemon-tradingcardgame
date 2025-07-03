'use client'
import React from 'react'
import { Pokemon } from '@app/lib/definitions'
const CardList = ({ data }: { data: Pokemon[] }) => {
    return (
        <div>
            <ul>
                {data.map(element => {
                    return (<li key={element.id}>
                        <p>{element.name}</p>
                    </li>)
                })}
            </ul>

        </div>
    )
}

export default CardList