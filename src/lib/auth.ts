export function validateCredentials(username: string, password: string): { valid: boolean; error?: string } {
  if (!username?.trim()) {
    return { valid: false, error: 'Username is required.' };
  }
  if (!password?.trim()) {
    return { valid: false, error: 'Password is required.' };
  }
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters.' };
  }
  return { valid: true };
}
