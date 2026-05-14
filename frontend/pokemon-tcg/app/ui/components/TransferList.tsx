import React, { type ReactNode } from 'react'
import { Deck, Pokemon, type Data } from '@/lib/definitions'
import FlipCard from './FlipCard'
import { HoloCard } from './HoloCard'
import Filters from '@/ui/components/Filters'
import SearchBarFilter from '@/ui/components/SearchBarFilter'
import NoCards from './NoCards'
import DeleteDeckBtn from './DeleteDeckBtn'
import { GAME_CONSTANTS } from '@/lib/constants/game'

const TransferList = ({
    available,
    selected,
    setAvailable,
    setSelected,
    onSave,
    onCancel,
    maxCards = GAME_CONSTANTS.TEAM_BUILDER_MAX_CARDS,
    deck,
    onDelete,
    decks,
    activeDeckId,
    onDeckSelect,
    createDeckSlot,
}: {
    onSave: (selected: Pokemon[]) => void
    onCancel: () => void
    onDelete: () => void
    maxCards?: number
    available: Pokemon[]
    selected: Pokemon[]
    setAvailable: (pokemon: Pokemon[]) => void
    setSelected: (pokemon: Pokemon[]) => void
    deck?: Deck | null
    decks?: Data[] | null
    activeDeckId: string | null
    onDeckSelect: (deckId: string) => void
    createDeckSlot: ReactNode
}) => {
    const deckList = Array.isArray(decks) ? decks : []
    const canEditDeck = Boolean(deck?.id)

    const handleAdd = (poke: Pokemon) => {
        if (!canEditDeck || selected.length >= maxCards) return
        setSelected([...selected, poke])
        setAvailable(available.filter(p => p.id !== poke.id))
    }

    const handleRemove = (poke: Pokemon) => {
        if (!canEditDeck) return
        setAvailable([...available, poke])
        setSelected(selected.filter(p => p.id !== poke.id))
    }

    const deckThumb = (d: Data) => {
        const first = d.cards?.[0]?.card as Pokemon | undefined
        return first?.image_url
    }

    return (
        <div className="deck-binder-texture flex w-full min-h-0 flex-1 flex-col pb-8 text-hq-on-background antialiased lg:min-h-[calc(100dvh-4rem)]">
            <div className="flex w-full min-h-0 flex-1 flex-col lg:flex-row lg:items-stretch">
                {/* Left: card filters — flush left + under navbar; sticky in scroll parent */}
                <aside className="sticky top-0 z-30 w-full shrink-0 border-b border-hq-outline-variant/35 bg-hq-surface-container-low/95 p-4 shadow-[4px_0_12px_-6px_rgba(0,0,0,0.08)] backdrop-blur-sm lg:max-h-[calc(100dvh-4rem)] lg:min-h-[calc(100dvh-4rem)] lg:w-80 lg:self-start lg:overflow-y-auto lg:border-b-0 lg:border-r lg:border-hq-outline-variant/25 lg:p-5 lg:shadow-none">
                    <h2 className="mb-4 text-[11px] font-bold tracking-[0.2em] text-hq-on-surface-variant uppercase">
                        Card filters
                    </h2>
                    <div className="flex flex-col gap-4">
                        <SearchBarFilter variant="binder" />
                        <Filters groupName="teamBuilderFilters" variant="sidebar" />
                    </div>
                </aside>

                {/* Center: binder grid */}
                <main className="min-w-0 flex-1 px-3 py-4 sm:px-4 sm:py-5 md:px-6">
                    {!canEditDeck ? (
                        <div className="mb-4 rounded-lg border border-hq-outline-variant/40 bg-hq-surface-container-high/70 px-4 py-3 text-sm text-hq-on-surface">
                            Choose a team on the right to add or remove Pokémon. Cards you tap <strong>Add</strong> on
                            join the team; <strong>Remove</strong> drops them back into the catalog.
                        </div>
                    ) : null}
                    {available.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-4">
                            {available.map(poke => (
                                <div
                                    key={poke.id}
                                    className="deck-holo-lift group relative flex flex-col rounded-xl "
                                >
                                    <div className="relative z-0 flex min-h-0 flex-1 flex-col p-1">
                                        <FlipCard
                                            pokemon={poke}
                                            isInteractive={canEditDeck}
                                            isAvailable={true}
                                            handleAdd={handleAdd}
                                            handleRemove={handleRemove}
                                        >
                                            <HoloCard pokemon={poke} className="min-h-0 flex-1" variant="default" />
                                        </FlipCard>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <NoCards />
                    )}
                </main>

                {/* Right: all user teams — same surface as card filters rail */}
                <aside className="flex w-full shrink-0 flex-col border-t border-hq-outline-variant/35 bg-hq-surface-container-low/95 shadow-[-4px_0_12px_-6px_rgba(0,0,0,0.08)] backdrop-blur-sm lg:sticky lg:top-0 lg:z-30 lg:h-[calc(100dvh-4rem)] lg:max-h-[calc(100dvh-4rem)] lg:w-72 lg:self-start lg:overflow-hidden lg:border-t-0 lg:border-l lg:border-hq-outline-variant/25 lg:shadow-none">
                    <div className="flex min-h-0 flex-1 flex-col lg:h-full">
                        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-hq-outline-variant/30 px-4 py-3 text-hq-on-surface">
                            <h2 className="text-lg font-bold tracking-tight">My teams</h2>
                            <div className="shrink-0 scale-90">{createDeckSlot}</div>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto p-3">
                            {deckList.length === 0 ? (
                                <p className="px-1 py-2 text-sm text-hq-on-surface-variant">No teams yet. Create one!</p>
                            ) : (
                                <div className="space-y-2">
                                    {deckList.map(d => {
                                        const active = activeDeckId === d.id
                                        const thumb = deckThumb(d)
                                        return (
                                            <button
                                                key={d.id}
                                                type="button"
                                                onClick={() => onDeckSelect(d.id)}
                                                className={`flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-all ${active
                                                    ? 'border-hq-primary bg-hq-surface-bright shadow-md ring-1 ring-hq-primary/35'
                                                    : 'border-hq-outline-variant/35 bg-hq-surface-container-high/60 hover:border-hq-primary/40 hover:bg-hq-surface-bright'
                                                    }`}
                                            >
                                                <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded border border-hq-outline-variant/40 bg-hq-surface-container-low">
                                                    {thumb ? (
                                                        // eslint-disable-next-line @next/next/no-img-element -- card art may come from any CDN
                                                        <img src={thumb} alt="" className="h-full w-full object-cover" />
                                                    ) : null}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-semibold tracking-wide text-hq-on-surface uppercase">
                                                        {d.name}
                                                    </p>
                                                    <p className="text-[10px] text-hq-on-surface-variant">
                                                        {d.cards?.length ?? 0}/{maxCards} Pokémon
                                                    </p>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            {canEditDeck ? (
                                <>
                                    <div className="mt-4 border-t border-hq-outline-variant/30 px-1 py-2 pt-4">
                                        <p className="truncate text-xs font-semibold text-hq-on-surface">{deck?.name}</p>
                                        <p className="text-[10px] text-hq-on-surface-variant">
                                            Editing team — add from grid or remove below
                                        </p>
                                    </div>
                                    <div className="mt-2 space-y-2 border-t border-hq-outline-variant/20 pt-3">
                                        {selected.map(poke => (
                                            <div
                                                key={poke.id}
                                                className="flex items-center gap-2 rounded-lg bg-hq-surface-container-high/70 p-2"
                                            >
                                                <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded border border-hq-outline-variant/35">
                                                    {poke.image_url ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={poke.image_url}
                                                            alt=""
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : null}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-[11px] font-semibold text-hq-on-surface">{poke.name}</p>
                                                    <p className="text-[9px] text-hq-on-surface-variant uppercase">
                                                        {poke.type} · HP {poke.hp}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-ghost btn-xs shrink-0 text-error"
                                                    onClick={() => handleRemove(poke)}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : null}
                        </div>

                        {canEditDeck ? (
                            <div className="shrink-0 space-y-2 border-t border-hq-outline-variant/35 bg-hq-surface-container-high/80 p-4">
                                <div className="flex justify-between font-mono text-xs">
                                    <span className="text-hq-on-surface-variant">Team size</span>
                                    <span className="text-hq-on-surface">
                                        {selected.length}/{maxCards}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline btn-sm w-full"
                                        onClick={() => void onDeckSelect('')}
                                    >
                                        Cancel
                                    </button>
                                    <div className="flex flex-wrap gap-2">
                                        <DeleteDeckBtn deck={deck} onDelete={onDelete} />
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm flex-1 min-w-[5rem]"
                                            onClick={() => onSave(selected)}
                                        >
                                            Save
                                        </button>
                                        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </aside>
            </div>
        </div>
    )
}

export default TransferList
