"use client"

import { signIn, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch } from "@/app/lib/hooks"
import { loadToastifyState } from "@/app/lib/features/toastify/toastifySlice"
import Email from "./Email"
import Password from "./Password"
import LoginBtn from "./LoginBtn"

export const SignIn = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const dispatch = useAppDispatch()
    const { data: session } = useSession()
    const router = useRouter()

    // Show toast when session is available (after successful login)
    useEffect(() => {
        if (session?.user?.message) {
            dispatch(loadToastifyState(session.user.message))

            // Redirect to dashboard or home page immediately
            router.push("/")
        }
    }, [session, dispatch, router])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError("Invalid credentials")
            }
            // Success handling is now done in useEffect when session is available
        } catch (error) {
            setError("An error occurred during sign in")
            console.error("Sign in error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {error && (
                <div className="text-red-500 text-sm mb-4">
                    {error}
                </div>
            )}
            <label>
                <Email />
            </label>
            <label>
                <Password />
            </label>
            <LoginBtn disabled={isLoading} />
        </form>
    )
}