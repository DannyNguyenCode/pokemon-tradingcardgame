"use client"
import React, { useEffect } from 'react'
import { Pagination as PaginationType } from '@/lib/definitions';
import { useRouter, useSearchParams } from 'next/navigation';

const Pagination = ({
    pagination,
}: {

    pagination: PaginationType;
}) => {
    const router = useRouter()
    const params = useSearchParams()
    const handlePageChange = (page: number) => {
        if (page < 1 || page > pagination.total_pages) return
        const currentParams = new URLSearchParams(params)
        currentParams.set('page', page.toString())
        router.push(`?${currentParams.toString()}`)
    }
    return (
        <div className="join">
            {Array.from({ length: pagination.total_pages }, (_, index) => (
                <button key={index} className="join-item btn" onClick={() => handlePageChange(index + 1)}>
                    {index + 1}
                </button>
            ))}
        </div>
    )
}

export default Pagination