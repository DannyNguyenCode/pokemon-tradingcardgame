
import React from 'react'
import CardList from '@/ui/components/CardList'
import Pagination from '@/ui/components/Pagination'
import Filters from '../ui/components/Filters'

const CataloguePage = async ({ searchParams }: { searchParams: Promise<{ page?: string, type_filter?: string, pokemon_name?: string }> }) => {
    const params = await searchParams
    const pageNumber = Math.max(1, Number(params.page ?? '1'));


    // Build query string with all filters
    const queryParams = new URLSearchParams();
    queryParams.append('page', pageNumber.toString());

    if (params.type_filter) {
        queryParams.append('type_filter', params.type_filter);
    }

    if (params.pokemon_name) {
        queryParams.append('pokemon_name', params.pokemon_name);
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/cards/?${queryParams.toString()}`).then((res) => {
        if (!res.ok) throw new Error(`API ${res.status} ${`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/cards/?${queryParams.toString()}`}`);
        return res.json()
    }).then((data) => {
        return data
    })

    return (
        <div className="flex-1 flex flex-col items-center justify-between min-h-0 pt-4">
            <div className="flex flex-col items-center gap-4 w-full">
                <div className='w-full px-4'>
                    <Filters />
                </div>
                <CardList data={response.data} />
            </div>
            <div className="w-full flex justify-center">
                <Pagination pagination={response.pagination} />
            </div>
        </div>
    )
}

export default CataloguePage