const BOOKING_API_URL = process.env.NEXT_PUBLIC_BOOKING_API_URL || 'https://api.thealley2b.pl';

export type PublicCoupon = {
  id: number;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  validFrom: string | null;
  validTo: string | null;
  minTotal: number | null;
};

export async function getPublicCoupons(): Promise<PublicCoupon[]> {
  try {
    const response = await fetch(`${BOOKING_API_URL}/coupons/public`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error('Failed to fetch coupons:', response.statusText);
      return [];
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return [];
  }
}

export type GalleryImage = {
  id: number;
  filename: string;
  originalFilename: string;
  path: string;
  url: string;
  section: string | null;
  caption: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export async function getGalleryImages(section?: string): Promise<GalleryImage[]> {
  try {
    const url = new URL(`${BOOKING_API_URL}/gallery`);
    if (section) {
      url.searchParams.set('section', section);
    }
    
    const response = await fetch(url.toString(), {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error('Failed to fetch gallery images:', response.statusText);
      return [];
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return [];
  }
}

