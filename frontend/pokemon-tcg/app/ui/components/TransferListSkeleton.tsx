import React from 'react'

const TransferListSkeleton = ({ count = 12 }: { count?: number }) => {
    return (
        <div className="w-full flex flex-col gap-4 justify-center">
            {/* Skeleton Actions */}
            <div className="flex flex-row justify-center items-center gap-6 w-full my-4">
                <div className="skeleton h-10 w-24 rounded"></div>
                <div className="skeleton h-10 w-24 rounded"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Available Pokémon */}
                <div className="bg-base-200 rounded-lg p-4 shadow">
                    <h3 className="font-bold mb-4 text-lg">Available Pokémon</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
                        {Array.from({ length: count }).map((_, idx) => (
                            <div key={idx} className="flex w-52 flex-col gap-4 p-2 rounded shadow bg-base-100">
                                <div className="skeleton h-32 w-full rounded"></div>
                                <div className="skeleton h-4 w-28 rounded"></div>
                                <div className="skeleton h-4 w-full rounded"></div>
                                <div className="skeleton h-4 w-full rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selected Pokémon */}
                <div className="bg-base-200 rounded-lg p-4 shadow">
                    <h3 className="font-bold mb-4 text-lg">Deck Pokémon</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
                        {Array.from({ length: count }).map((_, idx) => (
                            <div key={idx} className="flex w-52 flex-col gap-4 p-2 rounded shadow bg-base-100">
                                <div className="skeleton h-32 w-full rounded"></div>
                                <div className="skeleton h-4 w-28 rounded"></div>
                                <div className="skeleton h-4 w-full rounded"></div>
                                <div className="skeleton h-4 w-full rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TransferListSkeleton
