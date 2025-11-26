import { NextRequest, NextResponse } from 'next/server';
import { verifyTurnstile } from '../_lib/verifyTurnstile';

const BOOKING_API_URL = process.env.NEXT_PUBLIC_BOOKING_API_URL || 'https://api.thealley2b.pl';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               'unknown';
    
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Verify Turnstile token
    const turnstileToken = request.headers.get('cf-turnstile-response') || body.turnstileToken;
    if (!turnstileToken) {
      return NextResponse.json(
        { error: 'Turnstile verification token is required' },
        { status: 403 }
      );
    }

    const turnstileResult = await verifyTurnstile(turnstileToken, ip);
    if (!turnstileResult.success) {
      return NextResponse.json(
        { error: turnstileResult.error || 'Turnstile verification failed' },
        { status: 403 }
      );
    }

    const response = await fetch(`${BOOKING_API_URL}/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: body.email,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      return NextResponse.json(
        { error: error.message || error.error || 'Failed to subscribe to newsletter' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in newsletter API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

