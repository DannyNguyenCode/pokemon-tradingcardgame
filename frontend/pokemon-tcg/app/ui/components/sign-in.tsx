"use client"

import { signIn, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Email from "./Email"
import LoginBtn from "./LoginBtn"
import { useAppDispatch } from "../../lib/hooks"
import { loadToastifyState } from "../../lib/features/toastify/toastifySlice"
import Googlesignin from "./googlesignin"
export const SignIn = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const dispatch = useAppDispatch()
    const { data: session } = useSession()
    const router = useRouter()
    const [password, setPassword] = useState("")
    const [isPasswordFocused, setIsPasswordFocused] = useState(false)


    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setPassword(value)

    }
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
        <>
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="alert alert-error">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="break-words">{error}</span>
                    </div>
                )}
                <div>
                    <Email />
                </div>
                <div>
                    <div>
                        <label htmlFor="password" className="input validator">
                            <span className="sr-only">Password</span>
                            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <g
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    strokeWidth="2.5"
                                    fill="none"
                                    stroke="currentColor"
                                >
                                    <path
                                        d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
                                    ></path>
                                    <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
                                </g>
                            </svg>
                            <input
                                id="password"
                                type={isPasswordFocused ? "text" : "password"}
                                name="password"
                                required
                                value={password}
                                onChange={(e) => handlePasswordChange(e)}
                                onFocus={() => setIsPasswordFocused(true)}
                                onBlur={() => setIsPasswordFocused(false)}
                                placeholder="Password"
                                className=""
                            />
                        </label>

                    </div>
                </div>
                <div>
                    <LoginBtn disabled={isLoading} />
                </div>
                <div>
                    <p className="text-sm text-gray-500">
                        Don't have an account?{" "}
                        <a href="/register" className="text-blue-600 hover:underline">
                            Register here
                        </a>
                    </p>
                </div>
                <div className="divider">OR</div>

            </form>
            <div className="flex justify-center">
                <Googlesignin />
            </div>
        </>
    )
}