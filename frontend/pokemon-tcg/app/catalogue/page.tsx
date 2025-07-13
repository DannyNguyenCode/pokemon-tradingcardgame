
import React from 'react'
import CardList from '@/ui/components/CardList'
import Pagination from '@/ui/components/Pagination'

const CataloguePage = async ({ searchParams }: { searchParams: Promise<{ page?: string }> }) => {
    const page = await searchParams
    const pageNumber = Math.max(1, Number(page.page ?? '1'));
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/cards/?page=${pageNumber}`).then((res) => {
        console.log('[cards] fetch', `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/cards/?page=${pageNumber}`, res.status, res.headers.get('content-type'));
        if (!res.ok) throw new Error(`API ${res.status} ${`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/cards/?page=${pageNumber}`}`);
        return res.json()
    }).then((data) => {
        console.log("data", data)
        return data
    })

    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 gap-4">
            <CardList data={response.data} />
            <Pagination pagination={response.pagination} />
        </div>
    )
}

export default CataloguePage