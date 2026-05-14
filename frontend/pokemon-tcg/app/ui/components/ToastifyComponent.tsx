'use client'
import { useEffect } from 'react'
import { useAppDispatch } from '@/lib/hooks'
import { loadToastifyState } from '@/lib/features/toastify/toastifySlice'
import { useSession } from 'next-auth/react'

/** Dedupe session welcome toasts across navigations/remounts (module survives component remount). */
let lastSessionWelcomeKey: string | null = null

const ToastifyComponent = () => {
    const dispatch = useAppDispatch()
    const { data: session, status } = useSession()
    const welcomeMessage = session?.user?.message
    const userKey = session?.user?.id ?? session?.user?.email ?? ''

    useEffect(() => {
        if (status === 'unauthenticated') {
            lastSessionWelcomeKey = null
            return
        }
        if (status !== 'authenticated' || !welcomeMessage || !userKey) return

        const dedupeKey = `${userKey}:${welcomeMessage}`
        if (lastSessionWelcomeKey === dedupeKey) return

        lastSessionWelcomeKey = dedupeKey
        dispatch(loadToastifyState(welcomeMessage))
    }, [status, welcomeMessage, userKey, dispatch])

    return null
}

export default ToastifyComponent