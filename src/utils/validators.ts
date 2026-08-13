export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

// Mirrors the backend's exact policy (src/utils/password.js validateStrength):
// at least 8 characters with a lowercase letter, an uppercase letter, and a digit.
export function isStrongPassword(value: string): boolean {
  return value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /[0-9]/.test(value);
}

export const PASSWORD_REQUIREMENTS_MESSAGE =
  'At least 8 characters, with an uppercase letter, a lowercase letter, and a number.';
