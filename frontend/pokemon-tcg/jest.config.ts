// frontend/pokemon-tcg/jest.config.ts
import nextJest from 'next/jest'

const createJestConfig = nextJest({
    dir: './',
})

const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/app/$1',
    },
    moduleDirectories: ['node_modules', '<rootDir>/node_modules'],
    coverageThreshold: {
        global: {
            lines: 0.8,
        },
    },
    transformIgnorePatterns: [
        '/node_modules/(?!(next-auth|@next-auth|@react-aria|react-toastify)/)',
    ],
    testMatch: [
        '**/__tests__/**/*.(ts|tsx|js)',
        '**/*.(test|spec).(ts|tsx|js)'
    ],
}

export default createJestConfig(customJestConfig)
