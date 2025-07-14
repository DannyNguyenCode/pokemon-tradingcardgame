import { signInSchema, signUpSchema, passwordResetRequestSchema, passwordResetSchema, profileUpdateSchema } from "@/lib/zod"

describe('signInSchema', () => {
    describe('valid email and password', () => {
        it('should return true', () => {
            const email = 'test@test.com'
            const password = 'PasswordAdmin123!!'
            const result = signInSchema.safeParse({ email, password })
            expect(result.success).toBe(true)
        })
    })

    describe('invalid email and password', () => {
        it('should return false', () => {
            const email = 'test@'
            const password = 'Password123!!'
            const result = signInSchema.safeParse({ email, password })
            expect(result.success).toBe(false)
        })
    })


})
describe('signUpSchema', () => {
    describe('valid email, password and confirm password', () => {
        it('should return true', () => {
            const email = 'test@test.com'
            const password = 'PasswordAdmin123!!'
            const confirmPassword = 'PasswordAdmin123!!'
            const result = signUpSchema.safeParse({ email, password, confirmPassword })
            expect(result.success).toBe(true)
        })
    })

    describe('invalid email, password and confirm password', () => {
        it('should return false', () => {
            const email = 'test@'
            const password = 'Password123!!'
            const confirmPassword = 'Password123!!'
            const result = signUpSchema.safeParse({ email, password, confirmPassword })
            expect(result.success).toBe(false)
        })
    })
})
describe('passwordResetRequestSchema', () => {
    describe('valid email', () => {
        it('should return true', () => {
            const email = 'test@test.com'
            const result = passwordResetRequestSchema.safeParse({ email })
            expect(result.success).toBe(true)
        })
    })
    describe('invalid email', () => {
        it('should return false', () => {
            const email = 'test@'
            const result = passwordResetRequestSchema.safeParse({ email })
            expect(result.success).toBe(false)
        })
    })
})
describe('passwordResetSchema', () => {
    describe('valid token, password and confirm password', () => {
        it('should return true', () => {
            const token = '1234567890'
            const password = 'PasswordAdmin123!!'
            const confirmPassword = 'PasswordAdmin123!!'
            const result = passwordResetSchema.safeParse({ token, password, confirmPassword })
            expect(result.success).toBe(true)
        })
    })
    describe('invalid token, password and confirm password', () => {
        it('should return false', () => {
            const token = '1234567890'
            const password = 'PasswordAdmin123!!'
            const confirmPassword = 'Password123!!'
            const result = passwordResetSchema.safeParse({ token, password, confirmPassword })
            expect(result.success).toBe(false)
        })
    })
})
describe('profileUpdateSchema', () => {
    describe('valid email, current password, new password and confirm new password', () => {
        it('should return true', () => {
            const email = 'test@test.com'
            const currentPassword = 'PasswordAdmin123!!'
            const newPassword = 'PasswordAdmin123!!'
            const result = profileUpdateSchema.safeParse({ email, currentPassword, newPassword, confirmNewPassword: newPassword })
            expect(result.success).toBe(true)
        })
    })
    describe('invalid email, current password, new password and confirm new password', () => {
        it('should return false', () => {
            const email = 'test@'
            const currentPassword = 'PasswordAdmin123!!'
            const newPassword = 'PasswordAdmin123!!'
            const result = profileUpdateSchema.safeParse({ email, currentPassword, newPassword, confirmNewPassword: newPassword })
            expect(result.success).toBe(false)
        })
    })



})