import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory rate limiting store (for middleware)
// In production, consider using a shared store (Redis) if multiple instances
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20; // 20 requests per minute per IP

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetAt < now) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown';
  return ip;
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = `ratelimit:${ip}`;
  const record = rateLimitStore.get(key);

  if (!record || record.resetAt < now) {
    // Create new window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

function isBotUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const botPatterns = /curl|python-requests|scrapy|wget|bot|crawler|spider/i;
  return botPatterns.test(userAgent);
}

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

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
      "connect-src 'self' https://www.google-analytics.com https://api.thealley2b.pl https://challenges.cloudflare.com",
      "img-src 'self' data: https://www.google-analytics.com https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "frame-src https://challenges.cloudflare.com",
      "frame-ancestors 'none'",
    ].join('; ');

    response.headers.set('Content-Security-Policy', csp);
  }

  // Rate limiting for POST /api/*
  if (method === 'POST' && pathname.startsWith('/api/')) {
    const ip = getClientIp(request);
    
    if (!checkRateLimit(ip)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests. Please try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }
  }

  // Bot filtering - block simple bots on POST requests
  if (method === 'POST') {
    const userAgent = request.headers.get('user-agent');
    if (isBotUserAgent(userAgent)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Forbidden',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }

  // Panel authentication check
  if (pathname.startsWith('/panel')) {
    if (pathname.startsWith('/panel/login')) {
      return response;
    }

    const cookieHeader = request.headers.get('cookie') ?? '';
    
    // Debug logging
    console.log('🔍 Middleware check:', {
      pathname,
      hasCookie: cookieHeader.includes('sessionToken='),
      cookieValue: cookieHeader.includes('sessionToken=') ? 
        cookieHeader.split('sessionToken=')[1]?.split(';')[0]?.substring(0, 10) + '...' : 'none'
    });

    // Only check if cookie exists - let PanelShell handle actual auth validation
    if (!cookieHeader.includes('sessionToken=')) {
      console.log('❌ No session token, redirecting to login');
      return NextResponse.redirect(new URL('/panel/login', request.url));
    }

    // Cookie exists, let the page load and PanelShell will validate via API
    console.log('✅ Session token found, allowing request');
    return response;
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
