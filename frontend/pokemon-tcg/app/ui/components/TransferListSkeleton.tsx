import React from 'react'

const CardSkeleton = () => <div className="aspect-[3/4] w-full animate-pulse rounded-xl bg-hq-surface-container-high" />

const TransferListSkeleton = () => {
    return (
        <div className="deck-binder-texture flex w-full min-h-0 flex-1 flex-col pb-8 lg:min-h-[calc(100dvh-4rem)]">
            <div className="flex w-full min-h-0 flex-1 flex-col lg:flex-row lg:items-stretch">
                <aside className="h-48 w-full shrink-0 animate-pulse bg-hq-surface-container-low/90 lg:sticky lg:top-0 lg:z-30 lg:h-[calc(100dvh-4rem)] lg:w-80 lg:border-r lg:border-hq-outline-variant/25" />
                <main className="min-w-0 flex-1 px-3 py-4 sm:px-4 sm:py-5 md:px-6">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-4">
                        {[...Array(8)].map((_, i) => (
                            <CardSkeleton key={i} />
                        ))}
                    </div>
                </main>
                <aside className="h-64 w-full shrink-0 animate-pulse bg-hq-surface-container-low/90 lg:sticky lg:top-0 lg:z-30 lg:h-[calc(100dvh-4rem)] lg:w-72 lg:border-l lg:border-hq-outline-variant/25" />
            </div>
        </div>
    )
}

export default TransferListSkeleton
