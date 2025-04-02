import jwt from "jsonwebtoken";
import { db } from "./db";
import fs from 'fs';
import path from 'path';

// VERSION STORAGE: Use a file to persist token version between restarts
const TOKEN_VERSION_FILE = path.join(process.cwd(), '.token-version');

// Generate a stable token version that persists across development reloads
let SERVER_TOKEN_VERSION: number;

try {
  // Try to read existing version from file
  if (fs.existsSync(TOKEN_VERSION_FILE)) {
    SERVER_TOKEN_VERSION = parseInt(fs.readFileSync(TOKEN_VERSION_FILE, 'utf8'), 10);
    console.log(`Loaded existing token version: ${SERVER_TOKEN_VERSION}`);
  } else {
    // Generate new version on first run
    SERVER_TOKEN_VERSION = Math.floor(Math.random() * 10000);
    fs.writeFileSync(TOKEN_VERSION_FILE, SERVER_TOKEN_VERSION.toString(), 'utf8');
    console.log(`Generated new token version: ${SERVER_TOKEN_VERSION}`);
  }
} catch (e) {
  // Fallback if file operations fail
  SERVER_TOKEN_VERSION = Math.floor(Math.random() * 10000);
  console.log(`Using fallback token version: ${SERVER_TOKEN_VERSION} (error: ${e})`);
}

// Function to manually invalidate all tokens (for use in API routes)
export function invalidateAllTokens() {
  try {
    SERVER_TOKEN_VERSION = Math.floor(Math.random() * 10000);
    fs.writeFileSync(TOKEN_VERSION_FILE, SERVER_TOKEN_VERSION.toString(), 'utf8');
    console.log(`Tokens invalidated with new version: ${SERVER_TOKEN_VERSION}`);
    return true;
  } catch (e) {
    console.error("Failed to invalidate tokens:", e);
    return false;
  }
}

interface TokenPayload {
  id: string;
  email: string;
  name?: string | null;
  role?: string;
  tokenVersion?: number;
  [key: string]: any;
}

export function signJwtAccessToken(payload: TokenPayload) {
  const secret = process.env.NEXTAUTH_SECRET!;
  
  // Add server token version to payload
  const tokenPayload = {
    ...payload,
    tokenVersion: SERVER_TOKEN_VERSION
  };
  
  const token = jwt.sign(tokenPayload, secret, {
    expiresIn: "4h",
  });
  
  return token;
}

export function verifyJwtAccessToken(token: string) {
  try {
    const secret = process.env.NEXTAUTH_SECRET!;
    const payload = jwt.verify(token, secret) as TokenPayload;
    
    // Check if token version matches current server version
    if (payload.tokenVersion !== SERVER_TOKEN_VERSION) {
      console.log("Token version mismatch - server restarted");
      return null; // Invalid token if server has restarted
    }
    
    return payload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

// Export the server token version for use in other files
export { SERVER_TOKEN_VERSION };