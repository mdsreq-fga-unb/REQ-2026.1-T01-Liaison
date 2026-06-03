/**
 * Validates if a string is a valid email format.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validates if a password meets the strength requirements:
 * - At least 8 characters
 * - Contains at least one letter
 * - Contains at least one number
 */
export function isStrongPassword(password: string): boolean {
  const hasLength = password.length >= 8;
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  return hasLength && hasLetters && hasNumbers;
}
