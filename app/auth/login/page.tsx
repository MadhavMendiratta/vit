"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Changed default redirect to home page
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const registered = searchParams.get("registered");
  const expired = searchParams.get("expired") === "1";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showExpiredAlert, setShowExpiredAlert] = useState(expired);

  // Cleanup effect for problematic session state
  useEffect(() => {
    // Clean up any problematic session state on login page load
    const cleanupSession = async () => {
      // If we have an expired flag, make sure NextAuth is in a clean state
      if (searchParams.get("expired") === "1") {
        // Try to clean client-side storage
        if (typeof window !== 'undefined') {
          console.log("Cleaning up NextAuth session state");
          
          // Remove NextAuth items from localStorage
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('next-auth')) {
              console.log(`Removing localStorage item: ${key}`);
              localStorage.removeItem(key);
            }
          });
          
          // Remove NextAuth items from sessionStorage
          Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('next-auth')) {
              console.log(`Removing sessionStorage item: ${key}`);
              sessionStorage.removeItem(key);
            }
          });
          
          // Force reload if this is the first time we're seeing the login page after expiration
          const hasCleanedUp = sessionStorage.getItem('auth-cleanup-done');
          if (!hasCleanedUp) {
            console.log("First time cleanup, setting flag and reloading page");
            sessionStorage.setItem('auth-cleanup-done', 'true');
            
            // Hard reload the page once to ensure clean state
            window.location.reload();
            return; // Don't continue with the rest of the effect
          }
        }
      } else {
        // Clear the cleanup flag if we're not on an expired session
        sessionStorage.removeItem('auth-cleanup-done');
      }
    };
    
    cleanupSession();
  }, [searchParams]);

  // Handle expired session notification
  useEffect(() => {
    if (expired) {
      setShowExpiredAlert(true);
      const timer = setTimeout(() => {
        setShowExpiredAlert(false);
        // Clean URL without redirecting
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.delete("expired");
          window.history.replaceState({}, "", url.toString());
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [expired]);

  const handleLoginSuccess = (result: any) => {
    if (result?.ok) {
      console.log("Login successful, redirecting...");
      
      // Clear the cleanup flag on successful login
      if (typeof window !== "undefined") {
        sessionStorage.removeItem('auth-cleanup-done');
      }
      
      // UPDATED: Fixed home redirect logic
      let finalCallbackUrl = "/"; // Default to home page
      
      // Only use callbackUrl if it's not an auth page
      if (callbackUrl && !callbackUrl.includes('/auth/') && !callbackUrl.includes('/api/auth/')) {
        try {
          // Parse the callback URL to remove expired parameter
          const callbackUrlObj = new URL(
            callbackUrl.startsWith("http") 
              ? callbackUrl 
              : `${window.location.origin}${callbackUrl.startsWith('/') ? callbackUrl : `/${callbackUrl}`}`
          );
          
          callbackUrlObj.searchParams.delete("expired");
          
          // Extract just the pathname + search from the URL
          const pathname = callbackUrlObj.pathname + callbackUrlObj.search;
          finalCallbackUrl = pathname.startsWith('/') ? pathname : `/${pathname}`;
        } catch (e) {
          console.error("Error parsing callback URL:", e);
          finalCallbackUrl = "/"; // Default to home page on error
        }
      }
      
      console.log("Redirecting to:", finalCallbackUrl);
      router.push(finalCallbackUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Use redirect:false to handle redirection ourselves
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        console.error("Authentication error:", result.error);
        setError("Authentication failed. Please check your credentials.");
        setIsLoading(false);
        return;
      }
      
      // Handle successful login
      handleLoginSuccess(result);
      
    } catch (error) {
      console.error("Login error:", error);
      setError("Authentication failed. Please check your credentials.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Login to your account
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Enter your credentials to access your account
        </p>
      </div>

      {registered && (
        <Alert className="bg-green-50 text-green-800 border-green-300 mb-4">
          <AlertDescription>
            Registration successful! You can now log in with your credentials.
          </AlertDescription>
        </Alert>
      )}

      {showExpiredAlert && (
        <Alert className="mb-4 bg-amber-50 text-amber-800 border-amber-300">
          <AlertDescription>
            Your session has expired due to server maintenance. Please log in again.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </div>
      </form>

      <div className="mt-4 text-center">
        <span className="text-sm">Don't have an account? </span>
        <Link href="/auth/register" className="text-primary hover:underline text-sm">
          Register here
        </Link>
      </div>
    </>
  );
}