import PlayPage from '@/ui/components/PlayPage'
import React from 'react'
import { auth } from 'auth'
import { redirect } from 'next/navigation'
const page = async () => {
    const session = await auth()

    if (!session || !session.user) {
        redirect('/login') // Or to a custom login page
    }
    return (
        <PlayPage />
    )
}

export default page