'use client'
import React, { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

type SearchBarFilterProps = {
    /** Wider rounded search for deck binder layout */
    variant?: 'default' | 'binder'
}

const SearchBarFilter = ({ variant = 'default' }: SearchBarFilterProps) => {
    const params = useSearchParams()
    const pathname = usePathname()
    const router = useRouter()
    const [searchText, setSearchText] = useState<string>('')

    useEffect(() => {
        setSearchText(params.get('pokemon_name') ?? '')
    }, [params])
    const debouncedSearch = useDebouncedCallback((value: string) => {
        const currentParams = new URLSearchParams(params)
        if (!value.trim()) {
            currentParams.delete('pokemon_name')
        } else {
            currentParams.set('pokemon_name', value)
        }
        router.push(`${pathname}?${currentParams.toString()}`)
    }, 1000)
    const clearSearch = () => {
        setSearchText('');
        debouncedSearch('');
    };
    const shell =
        variant === 'binder'
            ? 'relative w-full max-w-md'
            : 'relative w-full md:w-auto'
    const labelClass =
        variant === 'binder'
            ? 'input w-full rounded-full border-hq-outline-variant/40 bg-hq-surface-bright pl-11 pr-10 text-hq-on-surface shadow-inner'
            : 'input mr-2 mb-2 md:mb-0'

    return (
        <div className={shell}>
            {variant === 'binder' ? (
                <span
                    className="pointer-events-none absolute left-4 top-1/2 z-[1] -translate-y-1/2 text-hq-on-surface-variant"
                    aria-hidden
                >
                    <svg className="h-[1.1em] w-[1.1em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
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
                </span>
            ) : null}
            <label className={labelClass}>
                {variant === 'default' ? (
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
                ) : null}
                <input
                    value={searchText}
                    onChange={(e) => {
                        debouncedSearch(e.target.value)
                        setSearchText(e.target.value)
                    }}
                    type="search"
                    className={variant === 'binder' ? 'grow pl-1' : 'grow'}
                    placeholder={variant === 'binder' ? 'Search Pokémon…' : 'Search Pokemon Name'}
                />
            </label>
            {searchText && (
                <button
                    onClick={clearSearch}
                    className={
                        variant === 'binder'
                            ? 'absolute right-3 top-1/2 z-[1] -translate-y-1/2 text-hq-on-surface-variant hover:text-hq-error'
                            : 'absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500'
                    }
                    aria-label="Clear search"
                    type="button"
                >
                    ✕
                </button>
            )}
        </div>
    )
}

export default SearchBarFilter