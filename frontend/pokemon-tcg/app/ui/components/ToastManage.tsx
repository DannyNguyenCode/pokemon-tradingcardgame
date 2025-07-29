'use client'

import { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { clearToastifyState } from '@/lib/features/toastify/toastifySlice';
import { useTheme } from '@/ui/theme/ThemeProvider';
export default function ToastManager() {
    const dispatch = useAppDispatch();
    const message = useAppSelector((s) => s.toastify.message);
    const { theme } = useTheme();
    useEffect(() => {
        if (message) {
            toast(message, { onClose: () => dispatch(clearToastifyState()) });
        }
    }, [message, dispatch]);

    return <ToastContainer style={{ marginTop: '49px' }} position="top-right" theme={theme} newestOnTop />;
}
