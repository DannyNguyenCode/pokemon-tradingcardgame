'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export default class GameErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Game Error Boundary caught an error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="text-6xl mb-4">🎮</div>
                    <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong</h2>
                    <p className="text-gray-600 mb-6">
                        The game encountered an unexpected error. Please try refreshing the page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-primary"
                    >
                        🔄 Refresh Page
                    </button>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details className="mt-4 text-left">
                            <summary className="cursor-pointer text-sm text-gray-500">
                                Error Details (Development)
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                                {this.state.error.toString()}
                            </pre>
                        </details>
                    )}
                </div>
            )
        }

        return this.props.children
    }
} 