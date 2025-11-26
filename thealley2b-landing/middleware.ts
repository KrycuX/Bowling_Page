import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Generate nonce for CSP (only for HTML responses)
  const nonce = generateNonce();
  
  // Create new request headers with the nonce
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  
  // Create response with nonce in both request and response headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set nonce in response header as well (for consistency)
  response.headers.set('x-nonce', nonce);

  // Set CSP header with nonce (only for HTML pages, not API routes)
  if (!pathname.startsWith('/api/') && !pathname.startsWith('/_next/')) {
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com`,
      "connect-src 'self' https://www.google-analytics.com https://api.thealley2b.pl",
      "img-src 'self' data: https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline'",
      "frame-src https://challenges.cloudflare.com",
      "frame-ancestors 'none'",
    ].join('; ');

    response.headers.set('Content-Security-Policy', csp);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

