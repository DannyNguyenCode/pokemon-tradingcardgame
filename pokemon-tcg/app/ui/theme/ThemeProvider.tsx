'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
interface Ctx { theme: string; toggle: () => void; }

const ThemeCtx = createContext<Ctx | null>(null);
const baseUrl = process.env.BASE_API_URL;
export const useTheme = () => useContext(ThemeCtx)!;
// Mui theme declerations
const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});
const lightTheme = createTheme({
    palette: {
        mode: 'light',
    },
});
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
        <ThemeCtx.Provider value={{ theme, toggle }}><MuiThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>  <CssBaseline />{children}</MuiThemeProvider></ThemeCtx.Provider>
    )
}

export default ThemeProvider