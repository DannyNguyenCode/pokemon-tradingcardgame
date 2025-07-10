// Mock next-auth
jest.mock('next-auth/react', () => ({
    signIn: jest.fn(),
    useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
}));

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        refresh: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
    }),
}));

import React from 'react'
import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { SignUp } from '@/ui/components/sign-up'
import { ToastContainer } from 'react-toastify'

// Mock fetch
global.fetch = jest.fn();

// Mock environment variable
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000';

const renderWithProviders = (ui: React.ReactElement) =>
    render(
        <Provider store={store}>
            {ui}
            <ToastContainer />
        </Provider>
    )

describe('SignUp', () => {
    beforeEach(() => {
        (global.fetch as jest.Mock).mockClear();
    });

    it('renders form elements correctly', async () => {
        // Arrange
        renderWithProviders(<SignUp />)

        // Assert
        expect(screen.getByPlaceholderText(/mail@site\.com/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/^password$/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/confirm your password/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    it('shows error on failed registration', async () => {
        // Arrange
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Registration failed' })
        });

        renderWithProviders(<SignUp />)
        const emailInput = screen.getByPlaceholderText(/mail@site\.com/i)
        const passwordInput = screen.getByPlaceholderText(/^password$/i)
        const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i)
        const submitBtn = screen.getByRole('button', { name: /create account/i })

        // Act - Use fireEvent for controlled inputs
        fireEvent.change(emailInput, { target: { value: 'fail@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'Password123!!' } })
        fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!!' } })

        await waitFor(() => {
            expect(passwordInput).toHaveValue('Password123!!');
            expect(confirmPasswordInput).toHaveValue('Password123!!');
        });

        const form = submitBtn.closest('form');
        if (!form) throw new Error('Form not found');
        fireEvent.submit(form);

        // Assert
        expect(await screen.findByText(/registration failed/i)).toBeInTheDocument();
    });

    it('should be accessible', async () => {
        // Arrange
        const { container } = renderWithProviders(<SignUp />)
        // Act
        const results = await axe(container)
        // Assert
        expect(results).toHaveNoViolations()
    })
}) 