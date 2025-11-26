import { NextRequest, NextResponse } from 'next/server';

const BOOKING_API_URL =
  process.env.NEXT_PUBLIC_BOOKING_API_URL || 'https://api.bowlinghub.pl';
const USE_MOCK_API = process.env.NEXT_PUBLIC_MOCK_API === 'true';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Tryb demo – nie wysyłamy nic do backendu, tylko udajemy sukces
    if (USE_MOCK_API) {
      console.log('[MOCK] contact form submit', body);
      return NextResponse.json({
        success: true,
        message: 'Wiadomość została zapisana w trybie demo (mock).',
      });
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || null;

    const response = await fetch(`${BOOKING_API_URL}/contact/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        clientIp: ip,
        userAgent,
      }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Unknown error' }));
      return NextResponse.json(
        { error: error.message || 'Failed to submit contact form' },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in contact API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

