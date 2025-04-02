import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
// Import from edge-compatible file
import { SERVER_TOKEN_VERSION } from "@/lib/jwt-edge";

// Helper function to check if a path is static asset
function isStaticAsset(path: string): boolean {
  return !!path.match(/\.(js|css|png|jpg|jpeg|svg|ico|json|woff|woff2|ttf|map)$/);
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Skip middleware for static assets
  if (isStaticAsset(path)) {
    return NextResponse.next();
  }
  
  // IMPROVE DEBUGGING - Add more visible markers
  console.log(`[🔒 MIDDLEWARE CHECK] Path: ${path}, Method: ${request.method}`);
  
  // Define public paths that don't require authentication
  const isPublicPath = 
    path === "/auth/login" || 
    path === "/auth/register" ||
    path === "/auth/otp-verification" ||
    path === "/" ||  // Homepage is public
    path.startsWith("/api/auth/") ||
    path === "/api/token-version";
  
  // EXPLICITLY define protected paths - helps with debugging
  const isProtectedPath = 
    path.startsWith("/navigation") ||
    path.startsWith("/buildings") ||
    path.startsWith("/search") ||
    path.startsWith("/profile") ||
    path.startsWith("/explore") ||
    path === "/quick-search" ||
    path.startsWith("/api/protected");
  
  // Add specific check for navigation and building pages
  const isNavigationOrBuilding = path.startsWith("/navigation") || path.startsWith("/buildings");
  
  console.log(`[MIDDLEWARE STATUS] Path: ${path}, Public: ${isPublicPath}, Protected: ${isProtectedPath}`);
  if (isNavigationOrBuilding) {
    console.log(`[🔍 CRITICAL PATH] Navigation or Building path detected: ${path}`);
  }

  // Get token with debugging
  let token;
  try {
    token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
  } catch (e) {
    console.error(`[AUTH ERROR] Failed to get token: ${e}`);
    token = null;
  }
  
  // Force redirect for navigation and building routes without valid token
  if (isNavigationOrBuilding && !token) {
    console.log(`[🛑 FORCED REDIRECT] Navigation/Building path without auth: ${path}`);
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    loginUrl.searchParams.set("source", "critical-path");
    
    const response = NextResponse.redirect(loginUrl);
    response.headers.set("X-Middleware-Cache", "no-cache");
    response.headers.set("X-Auth-Required", "true");
    return response;
  }
  
  console.log(`[AUTH CHECK] Token exists: ${!!token}, Path: ${path}`);
  
  // CRITICAL CHECK: Protected route, no auth - redirect to login
  // This is the most important part for your issue!
  if (isProtectedPath && !token) {
    console.log(`[🛑 ACCESS DENIED] Redirecting to login from: ${path}`);
    
    // Create response with debug header
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    loginUrl.searchParams.set("protected", "true"); // Add flag to help debug
    
    const response = NextResponse.redirect(loginUrl);
    response.headers.set("X-Middleware-Cache", "no-cache");
    return response;
  }
  
  // Rest of your middleware remains the same...
  
  console.log(`[✅ ACCESS GRANTED] Path: ${path}`);
  
  // Add no-cache header to prevent middleware caching
  const response = NextResponse.next();
  response.headers.set("X-Middleware-Cache", "no-cache");
  return response;
}

// Use a catchall matcher but with explicit exclusions
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (.svg, .jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/',
  ],
};










