import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from 'auth'
import { SignIn } from '@/ui/components/sign-in'
import { AuthErrorBoundary } from '@/ui/components/auth-error-boundary'

export const metadata: Metadata = {
    title: 'Sign In - Pokemon Trading Card Game',
    description: 'Sign in to your Pokemon Trading Card Game account to manage your collection and battle with other players.',
    keywords: ['pokemon', 'trading card game', 'login', 'sign in', 'authentication'],
    robots: 'noindex, nofollow', // Prevent indexing of login page
}

export default async function LoginPage() {
    // Check if user is already authenticated
    const session = await auth()

    if (session) {
        // Redirect authenticated users to home page
        redirect('/')
    }

    return (
        <AuthErrorBoundary>
            <div className="flex flex-1 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold">
                            Sign in to your account
                        </h2>
                        <p className="mt-2 text-center text-sm opacity-70">
                            Access your Pokemon Trading Card Game collection
                        </p>
                    </div>
                    <div className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <SignIn />
                    </div>
                </div>
            </div>
        </AuthErrorBoundary>
    )
}