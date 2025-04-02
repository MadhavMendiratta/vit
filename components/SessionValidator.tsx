"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Declare global SERVER_TOKEN_VERSION for TypeScript
declare global {
  interface Window {
    __SERVER_TOKEN_VERSION?: number;
  }
}

export function SessionValidator() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const expired = searchParams.get("expired") === "1";
  const [showMessage, setShowMessage] = useState(expired);
  const [serverVersion, setServerVersion] = useState<number | undefined>(undefined);
  
  // Fetch token version from API
  useEffect(() => {
    // Fetch the current server token version
    fetch('/api/token-version')
      .then(res => res.json())
      .then(data => {
        window.__SERVER_TOKEN_VERSION = data.version;
        setServerVersion(data.version);
        console.log("[SESSION] Server token version updated:", data.version);
      })
      .catch(err => console.error("[SESSION] Failed to fetch token version:", err));
  }, []);
  
  // Show notification for expired sessions and clean URL
  useEffect(() => {
    if (expired) {
      setShowMessage(true);
      
      // Clean URL without redirecting after a short delay
      const timer = setTimeout(() => {
        setShowMessage(false);
        
        // Clean URL parameter without triggering navigation
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.delete("expired");
          window.history.replaceState({}, "", url.toString());
        }
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [expired]);
  
  // Enhanced client-side validation of session with token version check
  useEffect(() => {
    // Skip check if we don't have the server version yet
    if (!serverVersion) return;
    
    // Only check once we know we're authenticated
    if (status === "authenticated") {
      console.log("[SESSION] Session status:", { 
        authenticated: true, 
        hasUser: !!session?.user 
      });
      
      // Case 1: Session exists but user is missing (basic invalid session)
      if (!session?.user) {
        console.log("[SESSION] Invalid session detected - user is missing");
        handleInvalidSession();
        return;
      }
      
      // Case 2: Token version mismatch (server restarted)
      // @ts-ignore - access custom session properties
      const tokenVersion = session?.tokenVersion;
      
      if (tokenVersion !== undefined) {
        console.log("[SESSION] Checking token version:", { 
          token: tokenVersion, 
          server: serverVersion 
        });
        
        // Check version difference - only logout for significant changes
        const versionDifference = Math.abs(Number(tokenVersion) - serverVersion);
        
        if (tokenVersion !== serverVersion && versionDifference > 1) {
          console.log(`[SESSION] Token version mismatch detected (diff=${versionDifference})`);
          handleInvalidSession();
          return;
        } else if (tokenVersion !== serverVersion) {
          console.log(`[SESSION] Minor version difference (${versionDifference}), ignoring`);
        }
      }
    }
  }, [session, status, serverVersion]);
  
  // Function to handle invalid sessions
  const handleInvalidSession = () => {
    console.log("[SESSION] Forcing logout due to invalid session");
    
    // Use the custom force-logout endpoint instead of nextAuth's signOut
    window.location.href = "/api/auth/force-logout?callbackUrl=/auth/login?expired=1";
  };
  
  // Only render the alert when needed
  if (!showMessage) return null;
  
  return (
    <div className="fixed top-4 right-4 left-4 md:left-auto z-50 md:max-w-md">
      <Alert variant="destructive">
        <AlertDescription>
          Your session has expired due to server maintenance. Please log in again.
        </AlertDescription>
      </Alert>
    </div>
  );
}