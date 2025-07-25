import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string
            email: string
            name?: string
            message?: string
            role?: string

        },
        accessToken?: string
    }

    interface User extends DefaultUser {
        id: string
        email: string
        name?: string
        message?: string
        role?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        email: string
        message?: string
        role?: string
        accessToken?: string
    }
} 