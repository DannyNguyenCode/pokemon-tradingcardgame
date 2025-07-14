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
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { SignIn } from '@/ui/components/sign-in'
import { ToastContainer } from 'react-toastify'
import { signIn } from 'next-auth/react'

const renderWithProviders = (ui: React.ReactElement) =>
    render(
        <Provider store={store}>
            {ui}
            <ToastContainer />
        </Provider>
    )

describe('SignIn', () => {
    const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

    beforeEach(() => {
        mockSignIn.mockClear();
    });

    it('renders form elements correctly', async () => {
        // Arrange
        renderWithProviders(<SignIn />)

        // Assert
        expect(screen.getByPlaceholderText(/mail@site\.com/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/^password$/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument()
    })

    it('shows error on invalid credentials', async () => {
        // Arrange
        mockSignIn.mockResolvedValueOnce({
            error: 'Invalid credentials',
            ok: false,
            status: 401,
            url: null,
            code: 'CredentialsSignin'
        });

        renderWithProviders(<SignIn />)
        const emailInput = screen.getByPlaceholderText(/mail@site\.com/i)
        const passwordInput = screen.getByPlaceholderText(/^password$/i)
        const buttons = screen.getAllByRole('button', { name: /sign in/i });
        const submitBtn = buttons.find(btn => btn.getAttribute('type') === 'submit');
        expect(buttons).toHaveLength(1);

        // Act
        await userEvent.type(emailInput, 'fail@example.com')
        await userEvent.type(passwordInput, 'Password123!!') // Valid password format
        await userEvent.click(submitBtn!)

        // Assert
        expect(await screen.findByText(/Invalid credentials/i)).toBeInTheDocument()
    })

    it('should be accessible', async () => {
        // Arrange
        const { container } = renderWithProviders(<SignIn />)
        // Act
        const results = await axe(container)
        // Assert
        expect(results).toHaveNoViolations()
    })
}) 