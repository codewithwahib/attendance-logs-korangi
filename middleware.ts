import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Check if the user is authenticated by looking for the user in localStorage
  // Note: This is client-side only, so we'll handle this in the client
  // The middleware here just handles basic path redirection
  
  // Public paths that don't require authentication
  const publicPaths = ['/login', '/api/auth/login', '/api/auth/logout']
  const isPublicPath = publicPaths.some(p => path.startsWith(p))
  
  // If the user is trying to access a protected path, let the client-side
  // ProtectedRoute component handle the authentication check
  // This middleware just ensures proper routing
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}