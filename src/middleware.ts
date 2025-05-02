import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth');
  
  // Protected routes that require authentication
  if (request.nextUrl.pathname.startsWith('/cart') ||
      request.nextUrl.pathname.startsWith('/checkout') ||
      request.nextUrl.pathname.startsWith('/orders')
  ) {
    if (!authCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Admin routes protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!authCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // You might want to verify admin status here by decoding the token
    // For now, we'll just check if the route is accessed
    const isAdmin = authCookie.value.includes('admin'); // This should be properly implemented
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/cart/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/admin/:path*'
  ]
};