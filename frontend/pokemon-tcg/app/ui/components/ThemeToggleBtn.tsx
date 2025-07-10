'use client';
import { useTheme } from '@/ui/theme/ThemeProvider';

export default function ThemeToggleBtn() {
    const { theme, toggle } = useTheme();
    return (
        <button className={`btn ${theme === 'dark' ? 'btn-neutral-content' : 'btn-neutral'}`} onClick={toggle}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
    );
}
