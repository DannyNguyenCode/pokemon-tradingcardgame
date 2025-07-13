
import React from 'react'
import CardList from '@/ui/components/CardList'
import Pagination from '@/ui/components/Pagination'

const CataloguePage = async ({ searchParams }: { searchParams: Promise<{ page?: string }> }) => {
    const page = await searchParams
    const pageNumber = Math.max(1, Number(page.page ?? '1'));
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/cards/?page=${pageNumber}`).then((res) => {

        return res.json()
    }).then((data) => {
        console.log("data", data)
        return data
    })

    return (
        <div>
            <CardList data={response.data} />
            <Pagination pagination={response.pagination} />
        </div>
    )
}

export default CataloguePage