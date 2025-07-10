"use client"

import ThemeToggleBtn from './ThemeToggleBtn'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function NavBar() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const handleLogout = async () => {
        await signOut({ redirect: false })
        router.push('/')
    }

    const handleLogin = () => {
        if (session) {
            // If user is logged in, redirect to home instead of login page
            router.push('/')
        } else {
            // If user is not logged in, go to login page
            router.push('/login')
        }
    }

    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /> </svg>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                        <li><Link href={'/'}>Home</Link></li>
                        <li><Link href={'/catalogue'}>Catalogue</Link></li>
                        <li><Link href={'/collection'}>Collection</Link></li>
                        {session ? (
                            <>
                                <li><span className="text-sm opacity-70">Welcome, {session.user?.email?.split('@')[0]}</span></li>
                                <li><button onClick={handleLogout}>Logout</button></li>
                            </>
                        ) : (
                            <>
                                <li><Link href={'/login'}>Login</Link></li>
                                <li><Link href={'/register'}>Register</Link></li>
                            </>
                        )}
                    </ul>
                </div>
                <a className="btn btn-ghost text-xl">daisyUI</a>
            </div>
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">
                    <li><Link href={'/'}>Home</Link></li>
                    <li><Link href={'/catalogue'}>Catalogue</Link></li>
                    <li><Link href={'/collection'}>Collection</Link></li>
                    {session ? (
                        <>
                            <li><span className="text-sm opacity-70">Welcome, {session.user?.email?.split('@')[0]}</span></li>
                            <li><button onClick={handleLogout}>Logout</button></li>
                        </>
                    ) : (
                        <>
                            <li><Link href={'/login'}>Login</Link></li>
                            <li><Link href={'/register'}>Register</Link></li>
                        </>
                    )}
                </ul>
            </div>
            <div className="navbar-end">
                <ThemeToggleBtn />
            </div>
        </div>
    )
}
