'use client'
import React from 'react'

const DeckComponentSkeleton = () => {
    return (
        <div className="space-y-6 max-w-5xl w-full">
            {/* Header */}
            <div className="flex justify-between items-center pb-4">
                <div className="h-8 w-48 rounded-md bg-base-300 animate-pulse"></div>
                <div className="h-10 w-32 rounded-md bg-base-300 animate-pulse"></div>
            </div>

            {/* Deck Cards List */}
            <div className="flex gap-4 flex-wrap">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-64 h-40 bg-base-200 rounded-xl shadow animate-pulse p-4 flex flex-col justify-between">
                        <div className="h-4 w-3/4 bg-base-300 rounded mb-2"></div>
                        <div className="h-3 w-1/2 bg-base-300 rounded mb-4"></div>
                        <div className="h-8 w-20 bg-base-300 rounded self-end"></div>
                    </div>
                ))}
            </div>

            {/* Transfer List Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Available Pokémon List */}
                <div>
                    <div className="h-6 w-48 bg-base-300 rounded mb-4 animate-pulse"></div>
                    <div className="grid grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-36 h-56 rounded-lg bg-base-300 animate-pulse"></div>
                        ))}
                    </div>
                </div>

                {/* Deck Pokémon List */}
                <div>
                    <div className="h-6 w-48 bg-base-300 rounded mb-4 animate-pulse"></div>
                    <div className="grid grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-36 h-56 rounded-lg bg-base-300 animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
                <div className="w-20 h-10 bg-base-300 rounded animate-pulse"></div>
                <div className="w-20 h-10 bg-base-300 rounded animate-pulse"></div>
            </div>
        </div>
    )
}

export default DeckComponentSkeleton
