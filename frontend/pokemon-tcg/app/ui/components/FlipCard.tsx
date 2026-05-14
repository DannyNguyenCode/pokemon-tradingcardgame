'use client'

import type { ReactNode } from 'react'
import { Pokemon } from '@/lib/definitions'

type FlipCardProps = {
    pokemon: Pokemon
    children: ReactNode
    isAvailable?: boolean
    isInteractive?: boolean
    handleAdd?: (pokemon: Pokemon) => void
    handleRemove?: (pokemon: Pokemon) => void
}

/** Wraps arbitrary card content (`children`) with optional Add/Remove actions. */
const FlipCard = ({
    pokemon,
    children,
    isAvailable = false,
    isInteractive = false,
    handleAdd,
    handleRemove,
}: FlipCardProps) => {
    return (
        <div className="mx-auto flex h-full min-h-0 w-full max-w-[14rem] flex-col items-stretch gap-2 py-2">
            {children}
            {isInteractive ? (
                <div className="flex justify-center">
                    {isAvailable ? (
                        <button
                            type="button"
                            onClick={() => handleAdd?.(pokemon)}
                            className="btn btn-success btn-xs"
                        >
                            Add
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => handleRemove?.(pokemon)}
                            className="btn btn-error btn-xs"
                        >
                            Remove
                        </button>
                    )}
                </div>
            ) : null}
        </div>
    )
}

export default FlipCard
