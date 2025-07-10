import NextAuth from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            email: string
            name?: string
            message?: string
        }
    }

    interface User {
        id: string
        email: string
        name?: string
        message?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        email: string
        message?: string
    }
} 