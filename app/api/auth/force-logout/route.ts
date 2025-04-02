import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const url = new URL(request.url);
  let callbackUrl = url.searchParams.get("callbackUrl") || "/auth/login?expired=1";
  
  // Ensure we're never redirecting back to the force-logout endpoint (break loops)
  if (callbackUrl.includes("force-logout")) {
    callbackUrl = "/auth/login?expired=1";
  }
  
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    // Create response with redirect
    const response = NextResponse.redirect(new URL(callbackUrl, request.url));
    
    console.log(`Force logout, redirecting to: ${callbackUrl}`);
    
    // Delete all auth-related cookies with multiple methods
    for (const cookie of allCookies) {
      if (cookie.name.includes("next-auth") || 
          cookie.name.includes("token") || 
          cookie.name.includes("session")) {
        
        console.log(`Deleting cookie: ${cookie.name}`);
        
        // Method 1: Response cookies API
        response.cookies.delete(cookie.name);
        
        // Method 2: Set expired cookie headers (more reliable)
        ['/', '/api', '/auth'].forEach(path => {
          response.headers.append(
            'Set-Cookie',
            `${cookie.name}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax; Max-Age=0`
          );
        });
      }
    }
    
    // Method 3: Explicitly handle known NextAuth cookies
    [
      "next-auth.session-token",
      "next-auth.csrf-token",
      "next-auth.callback-url",
      "__Secure-next-auth.session-token",
      "__Host-next-auth.csrf-token"
    ].forEach(name => {
      response.cookies.delete(name);
      
      ['/', '/api', '/auth'].forEach(path => {
        response.headers.append(
          'Set-Cookie',
          `${name}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax; Max-Age=0`
        );
      });
    });
    
    // Method 4: Use Clear-Site-Data (modern browsers)
    response.headers.append('Clear-Site-Data', '"cookies"');
    
    return response;
  } catch (error) {
    console.error("Error during force logout:", error);
    return NextResponse.redirect(new URL(callbackUrl, request.url));
  }
}