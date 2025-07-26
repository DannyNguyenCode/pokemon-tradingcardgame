import React from 'react'

interface LoginBtnProps {
    disabled?: boolean
}

const LoginBtn = ({ disabled = false }: LoginBtnProps) => {
    return (
        <button
            className="btn btn-primary btn-md w-6/12"
            type="submit"
            disabled={disabled}
            aria-label="Sign in"
        >
            {disabled ? "Signing In..." : "Sign In"}
        </button>
    )
}

export default LoginBtn