import { NextRequest, NextResponse } from 'next/server';
import { getGalleryImages } from '@/lib/api-client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const section = searchParams.get('section') || undefined;
    
    const images = await getGalleryImages(section);
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error in gallery API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery images' },
      { status: 500 }
    );
  }
}

