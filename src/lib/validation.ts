// Supabase's default minimum password length.
export const MIN_PASSWORD_LENGTH = 6;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns an error message for the sign-in form, or null if it's valid. */
export function validateSignIn(email: string, password: string): string | null {
  if (!email.trim()) return 'Enter your email.';
  if (!EMAIL_PATTERN.test(email.trim())) return 'Enter a valid email address.';
  if (!password) return 'Enter your password.';
  return null;
}

/** Returns an error message for the sign-up form, or null if it's valid. */
export function validateSignUp(
  email: string,
  password: string,
  confirmPassword: string,
): string | null {
  const signInError = validateSignIn(email, password);
  if (signInError) return signInError;
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password !== confirmPassword) return 'Passwords do not match.';
  return null;
}
