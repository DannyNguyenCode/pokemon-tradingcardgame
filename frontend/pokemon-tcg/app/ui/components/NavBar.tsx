"use client"

import ThemeToggleBtn from './ThemeToggleBtn'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '@/lib/hooks'
import { loadToastifyState } from '@/lib/features/toastify/toastifySlice'
export default function NavBar() {
    const { data: session } = useSession()
    const router = useRouter()
    const dispatch = useAppDispatch()
    const handleLogout = async () => {
        await signOut({ redirect: false })
        dispatch(loadToastifyState('You have been logged out successfully.'))
        router.push('/')
    }

    return (
        <div className="navbar h-16 bg-base-100 shadow-sm">
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden" aria-label="open menu in mobile view">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /> </svg>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                        <li><Link role="link" href={'/'} aria-label="redicrect to home page">Home</Link></li>
                        <li><Link role="link" href={'/catalogue'} aria-label="redicrect to catalogue page">Catalogue</Link></li>
                        <li><Link role="link" href={'/collection'} aria-label="redicrect to collection page">Collection</Link></li>
                        {session ? (
                            <>
                                <li><button aria-label="logout" onClick={handleLogout}>Logout</button></li>
                            </>
                        ) : (
                            <>
                                <li><Link role="link" href={'/login'} aria-label="redicrect to login page">Login</Link></li>
                                <li><Link role="link" href={'/register'} aria-label="redicrect to register page">Register</Link></li>
                            </>
                        )}
                    </ul>
                </div>
                <Link href={'/'} className="link link-hover link-active text-xl items-center hidden lg:flex gap-2 p-4">
                    <span className="text-xl">Pokemon TCG</span>
                    <div className="flex justify-center items-center pt-1.5">
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                            <path d='M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4m2-2h7M3 12h7' />
                            <path d='M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0' />
                        </svg>
                    </div>
                </Link>
            </div>
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">

                    <li><Link role="link" href={'/catalogue'} aria-label="redicrect to catalogue page">Catalogue</Link></li>
                    <li><Link role="link" href={'/collection'} aria-label="redicrect to collection page">Collection</Link></li>
                    {session ? (
                        <>
                            <li><button aria-label="logout" onClick={handleLogout}>Logout</button></li>
                        </>
                    ) : (
                        <>
                            <li><Link role="link" href={'/register'} aria-label="redicrect to register page">Register</Link></li>
                            <li><Link role="link" href={'/login'} aria-label="redicrect to login page">Login</Link></li>

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
