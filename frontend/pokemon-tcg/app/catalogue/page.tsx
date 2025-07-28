
import React from 'react'
import CardList from '@/ui/components/CardList'
import Pagination from '@/ui/components/Pagination'
import Filters from '../ui/components/Filters'
import SearchBarFilter from '@/ui/components/SearchBarFilter'

const CataloguePage = async ({ searchParams }: { searchParams: Promise<{ page?: string, type_filter?: string, pokemon_name?: string, count_per_page?: string }> }) => {
    const params = await searchParams
    const pageNumber = Math.max(1, Number(params.page ?? '1'));
    const count_per_page = '16'

    // Build query string with all filters
    const queryParams = new URLSearchParams();
    queryParams.append('page', pageNumber.toString());
    queryParams.append('count_per_page', count_per_page);

    if (params.type_filter) {
        queryParams.append('type_filter', params.type_filter);
    }

    if (params.pokemon_name) {
        queryParams.append('pokemon_name', params.pokemon_name);
    }

    let data = null;
    try {

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/cards/?${queryParams.toString()}`);
        if (!response.ok) throw new Error(`Fetch error: ${response.status}`);
        data = await response.json();
    } catch (error) {
        console.log("error collection route fetch cards")
    }
    return (
        <div className="flex-1 flex flex-col items-center justify-between min-h-0 pt-6">
            <div className='w-full px-4 flex flex-col md:flex-row'>
                <SearchBarFilter />
                <Filters groupName='metaframeworks' />
            </div>
            <div className="flex flex-col items-center gap-4 w-full">

                <CardList data={data.data} columns='8' />
            </div>
            <div className="w-full flex justify-center pb-4">
                <Pagination pagination={data.pagination} />
            </div>
        </div>
    )
}

export default CataloguePage