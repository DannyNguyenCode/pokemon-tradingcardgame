import NextAuth, { type NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { signInSchema } from "@/lib/zod"
import Google from "next-auth/providers/google"
import { SignJWT } from 'jose'
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
                        message: user.message, // Include the message from backend response
                        role: user.data.role,
                    }
                } catch (error) {
                    // Log error for debugging but don't expose details
                    console.error("Authentication error:", error)
                    return null
                }
            },
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            profile: (profile) => {
                return {
                    id: profile.id,
                    email: profile.email,
                    name: profile.name || profile.email.split('@')[0],
                    image: profile.picture || null,
                    message: "Logged in with Google"
                }
            }

        },
        ),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    jwt: {
        maxAge: 30 * 24 * 60 * 60,
    },
    pages: {
        signIn: "/",
    },
    callbacks: {
        jwt: async ({ token, user, account }) => {
            if (account?.provider === 'google' || account?.provider === 'credentials') {
                token.accessToken = await new SignJWT({
                    sub: token.sub,
                    role: user.role as string

                }).setIssuedAt()
                    .setExpirationTime('30d').setProtectedHeader({ alg: 'HS256' })
                    .sign(new TextEncoder().encode(process.env.NEXTAUTH_SECRET))
            }
            if (user) {
                token.id = user.id
                token.email = user.email
                token.message = user.message // Pass message through JWT
                token.role = user.role
                token.loginMsg = user.message
            }
            return token
        },
        session: ({ session, token }) => {
            if (token) {
                session.user.id = token.id as string
                session.user.email = token.email as string
                session.user.message = token.message as string // Pass message to session
                session.accessToken = token.accessToken as string
                session.user.role = token.role as string
                session.user.message = token.loginMsg as string
            }
            return session
        },
        async signIn({ user, profile, account }) {
            if (account?.provider === 'google' && profile) {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/authentications/google-sync`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ id: profile.sub, email: profile.email, name: user.name, picture: profile.picture, email_verified: profile.email_verified, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
                })
                const data = await res.json()
                user.message = data.message
                user.role = data.data.role
            }
            return true // Allow sign-in
        }
    },
    // Add SSR optimizations
    debug: process.env.NODE_ENV === 'development',
    trustHost: true,
} satisfies NextAuthConfig);