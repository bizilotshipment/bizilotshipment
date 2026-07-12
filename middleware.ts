// ============================================================
// Delivery Platform — Middleware
// ============================================================
// Protects dashboard routes. Passes through public + API routes.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — pass through
  if (
    pathname === '/' ||
    pathname.startsWith('/signin') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/docs') ||
    pathname.startsWith('/playground') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/v1') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Protected routes — check JWT
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/jobs')) {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/signin/customer', request.url));
    }

    const payload = await verifyToken(token);
    if (!payload) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired token' },
          { status: 401 }
        );
      }
      // Clear invalid cookie and redirect
      const response = NextResponse.redirect(new URL('/signin/customer', request.url));
      response.cookies.delete('auth-token');
      return response;
    }

    // Route to correct dashboard if hitting the base path
    if (pathname === '/dashboard') {
      return NextResponse.redirect(new URL(payload.role === 'customer' ? '/dashboard/console' : '/dashboard/driver', request.url));
    }

    // Role-based route protection
    if (pathname.startsWith('/dashboard/console') && payload.role !== 'customer') {
      return NextResponse.redirect(new URL('/dashboard/driver', request.url));
    }
    if (pathname.startsWith('/dashboard/driver') && payload.role !== 'driver') {
      return NextResponse.redirect(new URL('/dashboard/console', request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
