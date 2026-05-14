
import React from 'react'
import { normalizeTypeFilterParam } from '@/lib/pokemon'
import { mapApiCardsToPokemon } from '@/lib/mappers/apiCardMapper'
import CardList from '@/ui/components/CardList'
import Pagination from '@/ui/components/Pagination'
import Filters from '../ui/components/Filters'
import SearchBarFilter from '@/ui/components/SearchBarFilter'

const CatalogPage = async ({ searchParams }: { searchParams: Promise<{ page?: string, type_filter?: string, pokemon_name?: string, count_per_page?: string }> }) => {
    const params = await searchParams
    const pageNumber = Math.max(1, Number(params.page ?? '1'));
    const count_per_page = '12'

    // Build query string with all filters
    const queryParams = new URLSearchParams();
    queryParams.append('page', pageNumber.toString());
    queryParams.append('count_per_page', count_per_page);

    if (params.type_filter) {
        queryParams.append('type_filter', normalizeTypeFilterParam(params.type_filter))
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
        console.log("error collection route fetch cards", error)
    }
    return (
        <div className="flex  w-full flex-1 flex-col pt-6">
            <div className="grid flex-1 grid-cols-1 gap-6 px-4 lg:grid-cols-12">
                <aside className="flex flex-col gap-6 lg:col-span-2">
                    <SearchBarFilter />
                    <div className=" flex-1">
                        <Filters groupName="metaframeworks" variant="sidebar" />
                    </div>
                </aside>
                <div className="flex w-full flex-col items-center gap-4 lg:col-span-10">
                    <CardList data={mapApiCardsToPokemon(data?.data)} columns="6" />
                    <div className="flex w-full shrink-0 justify-center mb-4">
                        <Pagination pagination={data.pagination} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CatalogPage