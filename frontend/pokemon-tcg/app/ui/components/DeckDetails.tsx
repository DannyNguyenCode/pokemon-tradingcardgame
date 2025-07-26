import React from 'react'
import { Pokemon } from '@/lib/definitions'
import PokemonCard from './PokemonCard'
import PokemonAddBtn from './PokemonAddBtn'
import PokemonRemoveBtn from './PokemonRemoveBtn'
type Cards = {
    card: Pokemon
    card_id: string
    deck_id: string
}
const DeckDetails = ({ deckName, openId, data }: { deckName: string, openId: string, data: Cards[] }) => {
    console.log(data)

    return (
        <div>

            <dialog id={`${openId}`} className="modal">
                <div className="modal-box w-screen max-w-screen h-11/12 p-4">
                    <h3 className="font-bold text-lg">{deckName}</h3>
                    <div className='grid grid-cols-1 md:grid-cols-7 gap-4'>
                        {data.map((pokemon, i) => {
                            return <div className='flex flex-col shadow-xl/20' key={i}><PokemonCard pokemon={pokemon.card} owned={false} />
                                <div className="card-actions flex-1 items-end justify-evenly p-2">
                                    <PokemonAddBtn pokemonData={pokemon.card} />
                                    <PokemonRemoveBtn pokemonData={pokemon.card} />
                                </div>
                            </div>
                        })}
                    </div>

                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                </div>

                <form method="dialog" className="modal-backdrop">
                    <button >close</button>
                </form>
            </dialog>
        </div>
    )
}

export default DeckDetails