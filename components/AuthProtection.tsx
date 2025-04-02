"use client";
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';

interface AuthProtectionProps {
  children: ReactNode;
}

export function AuthProtection({ children }: AuthProtectionProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  // Define protected routes client-side too
  const isProtectedPath = 
    pathname?.startsWith("/navigation") ||
    pathname?.startsWith("/buildings") ||
    pathname?.startsWith("/search") ||
    pathname?.startsWith("/profile") ||
    pathname?.startsWith("/explore") ||
    pathname === "/quick-search";
  
  useEffect(() => {
    if (status === "unauthenticated" && isProtectedPath) {
      console.log(`[CLIENT PROTECTION] Redirecting from ${pathname} to login`);
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname || '')}`);
    }
  }, [status, pathname, isProtectedPath, router]);
  
  // Show loading state when:
  // 1. We're on a protected path AND
  // 2. We're not yet authenticated AND
  // 3. We're still loading the session
  if (isProtectedPath && status !== "authenticated" && status !== "loading") {
    return <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Checking authentication...</p>
      </div>
    </div>;
  }
  
  return <>{children}</>;
}