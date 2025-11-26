import { NextResponse } from 'next/server';
import { getPublicCoupons } from '@/lib/api-client';

export async function GET() {
  try {
    const coupons = await getPublicCoupons();
    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Error in coupons API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

