"use client"

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "../../lib/hooks";
import { loadToastifyState } from "../../lib/features/toastify/toastifySlice";

import Email from "./Email";
import { PASSWORD_REGEX } from '@/lib/zod';
export const SignUp = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [isPasswordFocused, setIsPasswordFocused] = useState(false)
    const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false)
    const dispatch = useAppDispatch()
    const router = useRouter()



    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const passwordValue = formData.get("password") as string


        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/authentications/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password: passwordValue }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || "Registration failed")
            } else {
                // Show success message
                dispatch(loadToastifyState("Registration successful! Please sign in."))

                // Redirect to login page
                router.push("/login")
            }
        } catch (error) {
            setError("An error occurred during registration")
            console.error("Registration error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setPassword(value)

    }

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value)
    }

    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0
    const showPasswordMismatch = confirmPassword.length > 0 && !passwordsMatch

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{error}</span>
                </div>
            )}
            <div>
                <Email />
            </div>
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
                        minLength={8}
                        pattern={PASSWORD_REGEX.source}
                        title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
                        className=""
                    />
                </label>
                <p className="validator-hint hidden">
                    Must be more than 8 characters, including
                    <br />At least one number <br />At least one lowercase letter <br />At least one uppercase letter <br />At least 2 special characters
                </p>
            </div>
            <div>
                <label htmlFor="confirmPassword" className="input validator">
                    <span className="sr-only">Confirm password</span>
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
                        id="confirmPassword"
                        type={isConfirmPasswordFocused ? "text" : "password"}
                        name="confirmPassword"
                        required
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        onFocus={() => setIsConfirmPasswordFocused(true)}
                        onBlur={() => setIsConfirmPasswordFocused(false)}
                        className={`${showPasswordMismatch
                            ? 'input-error'
                            : passwordsMatch
                                ? 'input-success'
                                : ''
                            }`}
                        placeholder="Confirm your password"
                        aria-describedby={showPasswordMismatch ? "password-mismatch" : passwordsMatch ? "password-match" : "confirm-password-help"}
                    />
                </label>
                {showPasswordMismatch && (
                    <div className="label">
                        <span className="label-text-alt text-error">
                            Passwords do not match
                        </span>
                    </div>
                )}
                {passwordsMatch && (
                    <div className="label">
                        <span className="label-text-alt text-success">
                            Passwords match ✓
                        </span>
                    </div>
                )}

            </div>
            <div>
                <button
                    type="submit"
                    disabled={isLoading || showPasswordMismatch}
                    className="btn btn-primary w-full"
                    aria-label="Create account"
                >
                    {isLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Creating account...
                        </>
                    ) : (
                        "Create account"
                    )}
                </button>
                {(showPasswordMismatch) && (
                    <div className="label">
                        <span className="label-text-alt text-error">
                            Please fix validation errors before submitting
                        </span>
                    </div>
                )}
            </div>
        </form>
    )
} 