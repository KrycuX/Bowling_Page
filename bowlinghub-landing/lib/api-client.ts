const BOOKING_API_URL =
  process.env.NEXT_PUBLIC_BOOKING_API_URL || 'https://api.bowlinghub.pl';

// Prosty przełącznik mocków – ustaw NEXT_PUBLIC_MOCK_API=true,
// żeby landing działał bez backendu (np. na Vercelu / w demo).
const USE_MOCK_API = process.env.NEXT_PUBLIC_MOCK_API === 'true';

export type PublicCoupon = {
  id: number;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  validFrom: string | null;
  validTo: string | null;
  minTotal: number | null;
};

// Mockowane przykładowe kupony do trybu demo
const MOCK_COUPONS: PublicCoupon[] = [
  {
    id: 1,
    code: 'DEMO10',
    type: 'PERCENT',
    value: 1000, // 10%
    validFrom: null,
    validTo: null,
    minTotal: null,
  },
  {
    id: 2,
    code: 'WEEKEND20',
    type: 'PERCENT',
    value: 2000, // 20%
    validFrom: null,
    validTo: null,
    minTotal: 10000, // 100 zł
  },
];

export async function getPublicCoupons(): Promise<PublicCoupon[]> {
  if (USE_MOCK_API) {
    return MOCK_COUPONS;
  }

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

// Mockowane przykładowe zdjęcia do trybu demo
const MOCK_GALLERY_IMAGES: GalleryImage[] = [
  {
    id: 1,
    filename: 'demo-lane.jpg',
    originalFilename: 'demo-lane.jpg',
    path: '/uploads/gallery/demo-lane.jpg',
    // Pełny URL, żeby działało bez backendu API
    url: 'https://images.pexels.com/photos/3961204/pexels-photo-3961204.jpeg',
    section: 'Kręgle',
    caption: 'Tor bowlingowy w klimacie BowlingHub',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    filename: 'demo-bar.jpg',
    originalFilename: 'demo-bar.jpg',
    path: '/uploads/gallery/demo-bar.jpg',
    url: 'https://images.pexels.com/photos/63633/pexels-photo-63633.jpeg',
    section: 'Bar',
    caption: 'Strefa barowa z napojami',
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function getGalleryImages(
  section?: string,
): Promise<GalleryImage[]> {
  if (USE_MOCK_API) {
    if (!section) return MOCK_GALLERY_IMAGES;
    return MOCK_GALLERY_IMAGES.filter((img) => img.section === section);
  }

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

