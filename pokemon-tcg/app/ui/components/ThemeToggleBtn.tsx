'use client';
import { useTheme } from '@/app/ui/theme/ThemeProvider';

export default function ThemeToggleBtn() {
    const { theme, toggle } = useTheme();
    return (
        <button className="btn btn-primary" onClick={toggle}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
    );
}
