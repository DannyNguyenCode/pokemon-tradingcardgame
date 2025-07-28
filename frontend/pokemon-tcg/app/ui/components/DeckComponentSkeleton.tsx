'use client'

import React from 'react'

const DeckComponentSkeleton = () => {
    return (
        <div className="flex flex-col gap-4 w-full px-4 py-6">
            {/* Deck Filter Skeleton */}
            <div className="flex flex-wrap gap-2">
                <div className="skeleton h-10 w-24 rounded"></div>
                <div className="skeleton h-10 w-24 rounded"></div>
                <div className="skeleton h-10 w-24 rounded"></div>
                <div className="skeleton h-10 w-24 rounded"></div>
            </div>

            {/* Transfer List Header Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="space-y-2">
                    <div className="skeleton h-6 w-32 rounded"></div>
                    <div className="grid grid-cols-2 gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="skeleton h-32 w-full rounded"></div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="skeleton h-6 w-32 rounded"></div>
                    <div className="grid grid-cols-2 gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="skeleton h-32 w-full rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DeckComponentSkeleton
