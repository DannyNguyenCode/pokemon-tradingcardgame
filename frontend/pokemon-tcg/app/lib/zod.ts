import { object, string, minLength, maxLength, regex, refine, z } from "zod"

// Password validation regex for security best practices - matches backend requirements
// Backend requires: 2 uppercase, 2 numbers, 2 special characters, 8+ length
const PASSWORD_REGEX = /^(?=.*[A-Z].*[A-Z])(?=.*[a-z])(?=.*\d.*\d)(?=.*[@$!%*?&].*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

// Email validation regex (RFC 5322 compliant)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

// Email validation with additional checks
const emailSchema = string({ error: "Email is required" })
    .min(1, "Email is required")
    .regex(EMAIL_REGEX, "Please enter a valid email address")
    .max(254, "Email address is too long")
    .transform(email => email.toLowerCase().trim())

// Password validation with security requirements - matches backend exactly
const passwordSchema = string({ error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must be less than 128 characters")
    .regex(
        PASSWORD_REGEX,
        "Password must contain at least 2 uppercase letters, 2 numbers, and 2 special characters (@$!%*?&)"
    )

// Sign-in schema (login)
export const signInSchema = object({
    email: emailSchema,
    password: passwordSchema,
})

// Sign-up schema (registration) with password confirmation
export const signUpSchema = object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: string({ error: "Please confirm your password" })
        .min(1, "Please confirm your password"),
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"], // This will show the error on the confirmPassword field
    }
)

// Password reset request schema
export const passwordResetRequestSchema = object({
    email: emailSchema,
})

// Password reset schema
export const passwordResetSchema = object({
    token: string({ error: "Reset token is required" })
        .min(1, "Reset token is required"),
    password: passwordSchema,
    confirmPassword: string({ error: "Please confirm your new password" })
        .min(1, "Please confirm your new password"),
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }
)

// Profile update schema (for future use)
export const profileUpdateSchema = object({
    email: emailSchema.optional(),
    currentPassword: string().optional(),
    newPassword: passwordSchema.optional(),
    confirmNewPassword: string().optional(),
}).refine(
    (data) => {
        // If newPassword is provided, confirmNewPassword must match
        if (data.newPassword && data.confirmNewPassword) {
            return data.newPassword === data.confirmNewPassword
        }
        return true
    },
    {
        message: "New passwords do not match",
        path: ["confirmNewPassword"],
    }
)

// Export types for TypeScript
export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>
export type PasswordResetInput = z.infer<typeof passwordResetSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>