'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';
interface Ctx { theme: string; toggle: () => void; }

const ThemeCtx = createContext<Ctx | null>(null);
export const useTheme = () => useContext(ThemeCtx)!;

// component
const ThemeProvider = ({
    initialTheme,
    children,
}: {
    initialTheme: string;
    children: React.ReactNode;
}) => {
    // state
    const [theme, setTheme] = useState<string>(initialTheme);
    // set document theme
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);
    const toggle = async () => {
        const next: string = theme === 'light' ? 'dark' : 'light';
        setTheme(next);


        fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/api/authentications/set-theme`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme: next }),
            credentials: 'include'
        }).catch(() => { });

    }
    return (
        <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>
    )
}

export default ThemeProvider