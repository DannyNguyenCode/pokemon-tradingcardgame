import { Suspense } from 'react'
import { AuthLoading } from './auth-loading'

interface AuthErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

export function AuthErrorBoundary({ children, fallback }: AuthErrorBoundaryProps) {
    return (
        <Suspense fallback={fallback || <AuthLoading />}>
            {children}
        </Suspense>
    )
}