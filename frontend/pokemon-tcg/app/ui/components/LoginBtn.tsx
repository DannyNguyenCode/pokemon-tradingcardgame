import React from 'react'

interface LoginBtnProps {
    disabled?: boolean
}

const LoginBtn = ({ disabled = false }: LoginBtnProps) => {
    return (
        <button
            className="btn btn-success"
            type="submit"
            disabled={disabled}
        >
            {disabled ? "Signing In..." : "Sign In"}
        </button>
    )
}

export default LoginBtn