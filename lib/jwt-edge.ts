// Simple version of JWT for Edge middleware (no fs/path modules)
// Uses a fixed version - actual checking happens client-side

// This is just a placeholder - the real version is fetched from API
export const SERVER_TOKEN_VERSION = 1;

// Simplified check that allows tokens through in middleware
// The full check happens client-side with SessionValidator
export function checkTokenVersion(tokenVersion?: number): boolean {
  return true; // Always allow in middleware
}