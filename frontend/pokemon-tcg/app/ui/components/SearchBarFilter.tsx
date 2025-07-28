'use client'
import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
const SearchBarFilter = () => {
    const params = useSearchParams()
    const router = useRouter()
    const [searchText, setSearchText] = useState<string>('')
    const debouncedSearch = useDebouncedCallback((value: string) => {
        const currentParams = new URLSearchParams(params)
        currentParams.set('pokemon_name', value)
        router.push(`?${currentParams.toString()}`)
    }, 1000)
    const clearSearch = () => {
        setSearchText('');
        debouncedSearch('');
    };
    return (
        <div className='relative w-full md:w-auto'>
            <label className="input mr-2 mb-2 md:mb-0">
                <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <g
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        strokeWidth="2.5"
                        fill="none"
                        stroke="currentColor"
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                    </g>
                </svg>
                <input value={searchText} onChange={(e) => { debouncedSearch(e.target.value); setSearchText(e.target.value) }} type="search" className="grow" placeholder="Search Pokemon Name" />
            </label>
            {searchText && (
                <button
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
                    aria-label="Clear search"
                >
                    ✕
                </button>
            )}
        </div>
    )
}

export default SearchBarFilter