'use client'

import React, { createContext, useContext, useEffect } from 'react'

const THEME = 'light' as const

interface Ctx {
    theme: typeof THEME
}

const ThemeCtx = createContext<Ctx>({ theme: THEME })

export const useTheme = () => useContext(ThemeCtx)

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    useEffect(() => {
        document.documentElement.dataset.theme = THEME
    }, [])

    return <ThemeCtx.Provider value={{ theme: THEME }}>{children}</ThemeCtx.Provider>
}

export default ThemeProvider
