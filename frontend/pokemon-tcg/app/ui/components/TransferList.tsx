import React from 'react'
import { Deck, Pokemon } from '@/lib/definitions'
import FlipCard from './FlipCard'
import Filters from '@/ui/components/Filters';
import SearchBarFilter from '@/ui/components/SearchBarFilter';
import NoCards from './NoCards';
import DeleteDeckBtn from './DeleteDeckBtn';
// TransferList component
const TransferList = ({
    available,
    selected,
    setAvailable,
    setSelected,
    onSave,
    onCancel,
    maxCards = 20,
    deck,
    onDelete
}: {
    onSave: (selected: Pokemon[]) => void
    onCancel: () => void
    onDelete: () => void
    maxCards?: number
    available: Pokemon[],
    selected: Pokemon[],
    setAvailable: (pokemon: Pokemon[]) => void,
    setSelected: (pokemon: Pokemon[]) => void,
    deck?: Deck | null,
}) => {


    const handleAdd = (poke: Pokemon) => {
        if (selected.length < maxCards) {
            setSelected([...selected, poke])
            setAvailable(available.filter(p => p.id !== poke.id))
        }
    }

    const handleRemove = (poke: Pokemon) => {
        setAvailable([...available, poke])
        setSelected(selected.filter(p => p.id !== poke.id))
    }
    return (
        <>
            <div className="join join-vertical bg-base-100 md:hidden w-full">
                {/* Actions */}
                <div className="flex flex-row justify-center my-2 md:my-0 gap-2 md:gap-6 w-12/12 md:w-1/6">
                    <button className="btn btn-primary btn-sm md:btn-md" onClick={() => onSave(selected)}>Save</button>
                    <button className="btn btn-secondary btn-sm md:btn-md" onClick={onCancel}>Cancel</button>
                </div>
                <div className="collapse collapse-arrow join-item border-base-300 border">
                    <input type="checkbox" name="my-accordion-4" />
                    <div className="collapse-title font-semibold">Available Pokémon</div>
                    <div className="collapse-content text-sm">
                        <div className="bg-base-200 rounded-lg p-4 shadow">
                            <SearchBarFilter />
                            <Filters groupName='mobileTransferListFilters' />
                            {available.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
                                {available.map(poke => (
                                    <FlipCard key={poke.id} pokemon={poke} isInteractive={true} isAvailable={true} handleAdd={handleAdd} handleRemove={handleRemove} />
                                ))}

                            </div> : <NoCards />}
                        </div>
                    </div>
                </div>
                <div className="collapse collapse-arrow join-item border-base-300 border">
                    <input type="checkbox" name="my-accordion-4" />
                    <div className="collapse-title font-semibold"> {deck ? `${deck.name} Deck Pokémon (${selected.length}/${maxCards})` : 'Select Deck'}</div>
                    <div className="collapse-content text-sm">
                        <div className="bg-base-200 rounded-lg p-4 shadow">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
                                {selected.map(poke => (
                                    <FlipCard
                                        key={poke.id}
                                        pokemon={poke}
                                        isInteractive={true}
                                        isAvailable={false}
                                        handleAdd={handleAdd}
                                        handleRemove={handleRemove}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Desktop */}
            <div className="w-full hidden md:flex md:flex-col gap-4 justify-center">
                {/* Actions */}
                <div className="flex flex-row justify-center items-center gap-6 w-12/12 my-4">
                    <button className="btn btn-primary btn-md" onClick={() => onSave(selected)}>Save</button>
                    <button className="btn btn-secondary btn-md" onClick={onCancel}>Cancel</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Available Pokémon */}


                    <div className="bg-base-200 rounded-lg p-4 shadow">
                        <h3 className="font-bold mb-4 pt-4 text-lg">Available Pokémon</h3>
                        <div className='flex flex-col justify-start items-start gap-2 mb-2'>
                            <SearchBarFilter />
                            <Filters groupName='transferListFilter' />
                        </div>

                        {available.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
                            {available.map(poke => (
                                <FlipCard key={poke.id} pokemon={poke} isInteractive={true} isAvailable={true} handleAdd={handleAdd} handleRemove={handleRemove} />
                            ))}

                        </div> : <NoCards />}
                    </div>

                    {/* Selected Pokémon */}
                    <div className="bg-base-200 rounded-lg p-4 shadow">
                        <div className='flex gap-4 items-center mb-4'>
                            <h3 className="font-bold mb-4 pt-4 text-lg">
                                {deck ? `${deck.name} Deck Pokémon (${selected.length}/${maxCards})` : 'Select Deck'}
                            </h3>
                            {<DeleteDeckBtn deck={deck} onDelete={onDelete} />}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
                            {selected.map(poke => (

                                <FlipCard key={poke.id} pokemon={poke} isInteractive={true} isAvailable={false} handleAdd={handleAdd} handleRemove={handleRemove} />

                            ))}
                        </div>
                    </div>
                </div>


            </div>
        </>
    )
}

export default TransferList