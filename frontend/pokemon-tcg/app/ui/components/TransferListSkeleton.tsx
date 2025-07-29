import React from 'react'

const CardSkeleton = () => (
    <div className="w-full h-64 bg-base-300 rounded-lg animate-pulse"></div>
)

const FilterSkeleton = () => (
    <div className="h-8 w-full bg-base-300 rounded animate-pulse mb-2"></div>
)

const TransferListSkeleton = () => {
    return (
        <div className="w-full max-w-screen-3xl mx-auto">
            {/* Mobile */}
            <div className="join join-vertical bg-base-100 md:hidden w-full">
                {/* Available Pokémon */}
                <div className="collapse collapse-arrow join-item border border-base-300">
                    <input type="checkbox" name="mobile-accordion-available" />
                    <div className="collapse-title font-semibold">Available Pokémon</div>
                    <div className="collapse-content text-sm">
                        <div className="bg-base-200 rounded-lg p-4 shadow space-y-4">
                            <FilterSkeleton />
                            <FilterSkeleton />
                            <div className="grid grid-cols-2 gap-3">
                                {[...Array(4)].map((_, i) => (
                                    <CardSkeleton key={i} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selected Pokémon */}
                <div className="collapse collapse-arrow join-item border border-base-300">
                    <input type="checkbox" name="mobile-accordion-selected" />
                    <div className="collapse-title font-semibold">
                        Selected Pokémon (0/20)
                        <div className="flex flex-row gap-2 mt-2">
                            <div className="btn btn-sm btn-primary animate-pulse w-20 h-8"></div>
                            <div className="btn btn-sm btn-secondary animate-pulse w-20 h-8"></div>
                        </div>
                    </div>
                    <div className="collapse-content text-sm">
                        <div className="bg-base-200 rounded-lg p-4 shadow">
                            <div className="grid grid-cols-2 gap-3">
                                {[...Array(2)].map((_, i) => (
                                    <CardSkeleton key={i} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Available Pokémon */}
                <div className="bg-base-200 rounded-lg min-h-screen p-4 shadow space-y-4">
                    <div className="h-6 w-48 bg-base-300 rounded animate-pulse mb-2"></div>
                    <FilterSkeleton />
                    <FilterSkeleton />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[...Array(8)].map((_, i) => (
                            <CardSkeleton key={i} />
                        ))}
                    </div>
                </div>

                {/* Selected Pokémon */}
                <div className="bg-base-200 rounded-lg p-4 shadow space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <div className="h-6 w-48 bg-base-300 rounded animate-pulse"></div>
                        <div className="flex gap-3">
                            <div className="btn btn-sm btn-error animate-pulse w-20 h-8"></div>
                            <div className="btn btn-sm btn-primary animate-pulse w-20 h-8"></div>
                            <div className="btn btn-sm btn-secondary animate-pulse w-20 h-8"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[...Array(4)].map((_, i) => (
                            <CardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TransferListSkeleton
