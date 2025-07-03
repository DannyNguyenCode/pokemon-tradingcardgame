'use client'

import { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAppSelector, useAppDispatch } from '@/app/lib/hooks';
import { clearToastifyState } from '@/app/lib/features/toastify/toastifySlice';

export default function ToastManager() {
    const dispatch = useAppDispatch();
    const message = useAppSelector((s) => s.toasify.message);

    useEffect(() => {
        if (message) {
            toast(message, { onClose: () => dispatch(clearToastifyState()) });
        }
    }, [message, dispatch]);

    return <ToastContainer position="top-right" newestOnTop />;
}
