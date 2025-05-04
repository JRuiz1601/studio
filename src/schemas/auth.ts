import { z } from 'zod';

// Schema for the login form
export const loginSchema = z.object({
  identificationNumber: z.string().min(1, { message: 'Identification number is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

// Schema for the registration form
export const registerSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }).regex(/^\+?[0-9\s\-()]*$/, { message: 'Invalid phone number format.'}), // Basic phone regex
  identificationNumber: z.string().min(1, { message: 'Identification number is required.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  confirmPassword: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions.',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // path of error
});

// Schema for forgot password (optional, if needed)
export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
});

// Schema for reset password (optional, if needed)
export const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  confirmPassword: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  token: z.string().min(1, { message: 'Invalid reset token.' }), // Assuming a token is used
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
