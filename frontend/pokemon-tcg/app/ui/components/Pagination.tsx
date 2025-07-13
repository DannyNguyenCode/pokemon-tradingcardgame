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