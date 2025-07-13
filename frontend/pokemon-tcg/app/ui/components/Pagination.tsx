"use client"
import React from 'react'
import { Pagination as PaginationType } from '@/lib/definitions';
import { useRouter, useSearchParams } from 'next/navigation';

const Pagination = ({
    pagination,
}: {
    pagination: PaginationType;
}) => {
    const router = useRouter()
    const params = useSearchParams()
    const currentPage = Number(params.get('page')) || 1

    const handlePageChange = (page: number) => {
        if (page < 1 || page > pagination.total_pages) return
        const currentParams = new URLSearchParams(params)
        currentParams.set('page', page.toString())
        router.push(`?${currentParams.toString()}`)
    }

    const renderPageButtons = () => {
        const buttons = []
        const totalPages = pagination.total_pages

        if (totalPages <= 7) {
            // If 7 or fewer pages, show all pages
            for (let i = 1; i <= totalPages; i++) {
                buttons.push(
                    <button
                        key={i}
                        className={`join-item btn ${currentPage === i ? 'btn-active' : ''}`}
                        onClick={() => handlePageChange(i)}
                    >
                        {i}
                    </button>
                )
            }
        } else {
            // Show first page
            buttons.push(
                <button
                    key={1}
                    className={`join-item btn ${currentPage === 1 ? 'btn-active' : ''}`}
                    onClick={() => handlePageChange(1)}
                >
                    1
                </button>
            )

            // Calculate range around current page
            let startPage = Math.max(2, currentPage - 1)
            let endPage = Math.min(totalPages - 1, currentPage + 1)

            // Adjust range to show 3 pages around current page
            if (currentPage <= 3) {
                startPage = 2
                endPage = Math.min(4, totalPages - 1)
            } else if (currentPage >= totalPages - 2) {
                startPage = Math.max(2, totalPages - 3)
                endPage = totalPages - 1
            }

            // Add ellipsis if there's a gap after first page
            if (startPage > 2) {
                buttons.push(
                    <button key="ellipsis1" className="join-item btn btn-disabled">
                        ...
                    </button>
                )
            }

            // Show pages around current page
            for (let i = startPage; i <= endPage; i++) {
                buttons.push(
                    <button
                        key={i}
                        className={`join-item btn ${currentPage === i ? 'btn-active' : ''}`}
                        onClick={() => handlePageChange(i)}
                    >
                        {i}
                    </button>
                )
            }

            // Add ellipsis if there's a gap before last page
            if (endPage < totalPages - 1) {
                buttons.push(
                    <button key="ellipsis2" className="join-item btn btn-disabled">
                        ...
                    </button>
                )
            }

            // Show last page if not already included
            if (totalPages > 1) {
                buttons.push(
                    <button
                        key={totalPages}
                        className={`join-item btn ${currentPage === totalPages ? 'btn-active' : ''}`}
                        onClick={() => handlePageChange(totalPages)}
                    >
                        {totalPages}
                    </button>
                )
            }
        }

        return buttons
    }

    return (
        <div className="join">
            {/* Previous button - only show if not on first page */}
            {currentPage > 1 && (
                <button
                    className="join-item btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                >
                    «
                </button>
            )}

            {/* Current page in the middle */}
            <button className="join-item btn">
                Page {currentPage}
            </button>

            {/* Next button - only show if not on last page */}
            {currentPage < pagination.total_pages && (
                <button
                    className="join-item btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                    »
                </button>
            )}
        </div>
    )
}

export default Pagination