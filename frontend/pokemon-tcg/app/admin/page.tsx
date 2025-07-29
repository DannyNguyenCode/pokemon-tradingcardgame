import AdminPanel from '@/ui/components/AdminPanel'
import React from 'react'
import { auth } from 'auth'
import { redirect } from 'next/navigation'
const AdminPanelPage = async () => {
    const session = await auth()
    if (session?.user.role !== 'admin') {
        redirect('/')
    }
    if (!session || !session.user) {

        redirect('/login') // Or to a custom login page
    }
    return (
        <AdminPanel />
    )
}

export default AdminPanelPage