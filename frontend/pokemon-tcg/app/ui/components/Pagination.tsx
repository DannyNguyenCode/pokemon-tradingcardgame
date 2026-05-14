"use client"
import React from 'react'
import { Pagination as PaginationType } from '@/lib/definitions';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const Pagination = ({
    pagination,
}: {
    pagination: PaginationType;
}) => {
    const router = useRouter()
    const pathname = usePathname()
    const params = useSearchParams()
    const currentPage = Number(params.get('page')) || 1

    const handlePageChange = (page: number) => {
        if (page < 1 || page > pagination.total_pages) return
        const currentParams = new URLSearchParams(params.toString())
        currentParams.set('page', page.toString())
        router.push(`${pathname}?${currentParams.toString()}`)
    }

    return (
        <div className="join">
            {/* Previous button - only show if not on first page */}
            {currentPage > 1 && (

                <button
                    type="button"
                    className="join-item btn"
                    onClick={() => handlePageChange(1)}
                >
                    1
                </button>
            )}
            {currentPage > 1 && (

                <button
                    type="button"
                    className="join-item btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                >
                    «
                </button>
            )}

            {/* Current page in the middle */}
            <button type="button" className="join-item btn" disabled>
                {currentPage}
            </button>

            {/* Next button - only show if not on last page */}
            {currentPage < pagination.total_pages && (
                <button
                    type="button"
                    className="join-item btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                    »
                </button>
            )}
            {currentPage < pagination.total_pages && (
                <button
                    type="button"
                    className="join-item btn"
                    onClick={() => handlePageChange(pagination.total_pages)}
                >
                    {pagination.total_pages}
                </button>
            )}
        </div>
    )
}

export default Pagination