'use client'
import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
const SearchBarFilter = () => {
    const params = useSearchParams()
    const router = useRouter()
    const debouncedSearch = useDebouncedCallback((value: string) => {
        const currentParams = new URLSearchParams(params)
        currentParams.set('pokemon_name', value)
        router.push(`?${currentParams.toString()}`)
    }, 1000)
    return (
        <label className="input mr-2">
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
            <input onChange={(e) => debouncedSearch(e.target.value)} type="search" className="grow" placeholder="Search Pokemon Name" />
        </label>
    )
}

export default SearchBarFilter