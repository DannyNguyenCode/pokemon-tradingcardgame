import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from 'auth'
import { SignUp } from '@/ui/components/sign-up'
import { AuthErrorBoundary } from '@/ui/components/auth-error-boundary'

export const metadata: Metadata = {
    title: 'Sign Up - Pokemon Trading Card Game',
    description: 'Create a new account for Pokemon Trading Card Game to start your collection and battle with other players.',
    keywords: ['pokemon', 'trading card game', 'register', 'sign up', 'create account', 'authentication'],
    robots: 'noindex, nofollow', // Prevent indexing of register page
}

export default async function RegisterPage() {
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
                            Create your account
                        </h2>
                        <p className="mt-2 text-center text-sm opacity-70">
                            Join Pokemon Trading Card Game and start your collection
                        </p>
                    </div>
                    <div className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <SignUp />
                    </div>
                </div>
            </div>
        </AuthErrorBoundary>
    )
}