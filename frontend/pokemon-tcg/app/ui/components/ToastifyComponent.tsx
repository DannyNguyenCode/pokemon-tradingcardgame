'use client'
import React, { useEffect } from 'react'
import { useAppDispatch } from '@/lib/hooks'
import { loadToastifyState, clearToastifyState } from '@/lib/features/toastify/toastifySlice'
import { useSession } from 'next-auth/react'
const ToastifyComponent = () => {
    const dispatch = useAppDispatch()
    const { data: session } = useSession()
    useEffect(() => {
        if (session?.user?.message) {
            dispatch(loadToastifyState(session.user.message))
        }
        return () => {
            // Clear the toastify state when the component unmounts or session changes
            dispatch(clearToastifyState())
        }
    }, [session, dispatch])

    return (
        <></>
    )
}

export default ToastifyComponent