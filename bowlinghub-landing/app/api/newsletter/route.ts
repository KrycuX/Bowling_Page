import { NextRequest, NextResponse } from 'next/server';

const BOOKING_API_URL =
  process.env.NEXT_PUBLIC_BOOKING_API_URL || 'https://api.bowlinghub.pl';
const USE_MOCK_API = process.env.NEXT_PUBLIC_MOCK_API === 'true';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 },
      );
    }

    // Tryb demo – nie wysyłamy nic do backendu, tylko udajemy sukces
    if (USE_MOCK_API) {
      console.log('[MOCK] newsletter subscribe', body.email);
      return NextResponse.json({
        success: true,
        message: 'Adres dodany do newslettera w trybie demo (mock).',
      });
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
      const error = await response
        .json()
        .catch(() => ({ message: 'Unknown error' }));
      return NextResponse.json(
        {
          error:
            error.message ||
            error.error ||
            'Failed to subscribe to newsletter',
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in newsletter API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
