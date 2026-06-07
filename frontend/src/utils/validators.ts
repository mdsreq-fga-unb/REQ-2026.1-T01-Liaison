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

/**
 * Validates if a string is a mathematically valid CNPJ.
 */
export function isValidCNPJ(cnpj: string): boolean {
  const clean = cnpj.replace(/\D/g, '');

  if (clean.length !== 14) return false;

  // Reject known invalid patterns
  if (/^(\d)\1{13}$/.test(clean)) return false;

  // Validate checksum digits
  const calc = (s: string, weight: number[]) => {
    let sum = 0;
    for (let i = 0; i < s.length; i++) {
      sum += parseInt(s[i]) * weight[i];
    }
    const res = sum % 11;
    return res < 2 ? 0 : 11 - res;
  };

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const d1 = calc(clean.substring(0, 12), w1);
  const d2 = calc(clean.substring(0, 12) + d1, w2);

  return (
    parseInt(clean[12]) === d1 && parseInt(clean[13]) === d2
  );
}
