import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { signInSchema } from "@/app/lib/zod"

// Check for required environment variables with better error handling
const requiredEnvVars = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
}

// Only check in production or when explicitly running
if (process.env.NODE_ENV === 'production') {
    for (const [key, value] of Object.entries(requiredEnvVars)) {
        if (!value) {
            throw new Error(`${key} is not set`)
        }
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials) => {
                try {
                    // Validate input
                    const validatedFields = signInSchema.safeParse(credentials)
                    if (!validatedFields.success) {
                        return null
                    }

                    const { email, password } = validatedFields.data

                    // Check if API URL is available
                    if (!process.env.NEXT_PUBLIC_API_URL) {
                        console.error("NEXT_PUBLIC_API_URL is not set")
                        return null
                    }

                    // Call backend API
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/authentications/login`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ email, password }),
                    })

                    if (!response.ok) {
                        // Don't distinguish between different error types for security
                        return null
                    }

                    const user = await response.json()

                    if (!user?.data?.id) {
                        return null
                    }

                    // Return minimal user data with message from backend
                    return {
                        id: user.data.id,
                        email: user.data.email,
                        name: user.data.email.split('@')[0], // Fallback name
                        message: user.message // Include the message from backend response
                    }
                } catch (error) {
                    // Log error for debugging but don't expose details
                    console.error("Authentication error:", error)
                    return null
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 15 * 60, // 15 minutes
    },
    jwt: {
        maxAge: 15 * 60, // 15 minutes
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        jwt: ({ token, user }) => {
            if (user) {
                token.id = user.id
                token.email = user.email
                token.message = user.message // Pass message through JWT
            }
            return token
        },
        session: ({ session, token }) => {
            if (token) {
                session.user.id = token.id as string
                session.user.email = token.email as string
                session.user.message = token.message as string // Pass message to session
            }
            return session
        }
    },
    // Add SSR optimizations
    debug: process.env.NODE_ENV === 'development',
    trustHost: true,
})