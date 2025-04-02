import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { db } from "./db";
import { SERVER_TOKEN_VERSION } from "./jwt"; // Import token version

// Extended types for better type safety
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string;
      role: string;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email: string;
    role?: string;
    requiresOtp?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string | null;
    email: string;
    role?: string;
    requiresOtp?: boolean;
    tokenVersion?: number; // Add tokenVersion field to JWT
  }
}

export const authOptions: NextAuthOptions = {
  // Remove PrismaAdapter - it conflicts with Credentials provider
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/",
    error: "/auth/login",
  },
  debug: process.env.NODE_ENV === "development", 
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("Starting authorization for:", credentials?.email);
          
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing email or password");
            return null;
          }

          // Find the user
          const user = await db.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          console.log("User found:", user ? "Yes" : "No");

          if (!user || !user.password) {
            console.log("User not found or no password");
            return null;
          }

          // If user has OTP verification enabled, don't check password here
          if (user.useOtp) {
            console.log("User has OTP enabled, skipping password check");
            return {
              id: user.id,
              email: user.email,
              name: user.name || null,
              role: user.role || "user",
              requiresOtp: true,
            };
          }

          // Verify password
          console.log("Checking password...");
          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );

          console.log("Password valid:", isPasswordValid);

          if (!isPasswordValid) {
            console.log("Invalid password");
            return null;
          }

          // Return authenticated user
          console.log("Authentication successful");
          return {
            id: user.id,
            email: user.email,
            name: user.name || null,
            role: user.role || "user",
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role || "user";
        token.tokenVersion = SERVER_TOKEN_VERSION; // Add server token version
        
        if (user.requiresOtp) {
          token.requiresOtp = true;
        }
        console.log("JWT token updated:", { 
          id: token.id, 
          email: token.email,
          tokenVersion: token.tokenVersion 
        });
      } else {
        // For existing tokens, check if they need to be invalidated
        if (token.tokenVersion !== SERVER_TOKEN_VERSION) {
          console.log("Token invalidated due to server restart");
          // We keep the token but the session callback will handle the invalidation
        }
      }
      return token;
    },
    
    async session({ session, token }) {
      // Check if token is still valid (server hasn't restarted)
      if (token.tokenVersion !== SERVER_TOKEN_VERSION) {
        console.log("Session expired due to server restart");
        // Return empty session to force re-authentication
        return {
          ...session,
          user: undefined,
          expires: "0"
        };
      }
      
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.name || null;
        session.user.email = token.email;
        session.user.role = token.role || "user";
        console.log("Session updated:", { id: session.user.id, email: session.user.email });
      }
      return session;
    },
    
    // NEW: Add redirect callback to clean up URLs
    async redirect({ url, baseUrl }) {
      // Security: Start with assuming relative URLs are safe
      let returnUrl = url;
      
      try {
        // If it's an absolute URL (contains ://)
        if (url.includes('://')) {
          const urlObj = new URL(url);
          
          // Only allow redirects to the same host
          if (urlObj.origin !== new URL(baseUrl).origin) {
            console.log(`Blocking redirect to external site: ${url}`);
            return baseUrl;
          }
          
          // Clean up expired param if present
          urlObj.searchParams.delete("expired");
          returnUrl = urlObj.toString();
        } 
        // For relative URLs, construct a full URL to manipulate
        else {
          const urlObj = new URL(url, baseUrl);
          
          // Clean up expired param if present
          urlObj.searchParams.delete("expired");
          returnUrl = urlObj.pathname + urlObj.search + urlObj.hash;
        }
        
        console.log(`Redirecting to: ${returnUrl}`);
        return returnUrl;
      } catch (error) {
        console.error("Error in redirect callback:", error);
        // If anything goes wrong, go to the base URL
        return baseUrl;
      }
    }
  }
};