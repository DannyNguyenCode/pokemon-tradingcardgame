'use client'
import React from 'react'
import { useAppDispatch } from '@/lib/hooks'
import { loadToastifyState } from '@/lib/features/toastify/toastifySlice'
import { signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
const LogoutBtn = () => {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const pathname = usePathname()
    const handleLogout = async () => {
        await signOut({ redirect: false })
        dispatch(loadToastifyState('You have been logged out successfully.'))
        if (pathname === '/') {
            router.refresh()
        } else {

            window.location.href = '/'
        }

    }
    return (
        <li><button aria-label="logout" onClick={handleLogout}>Logout</button></li>
    )
}

export default LogoutBtn