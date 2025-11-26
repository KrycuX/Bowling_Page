'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import { Image as ImageIcon } from 'lucide-react';
import type { GalleryImage } from '@/lib/api-client';

const BOOKING_API_URL = process.env.NEXT_PUBLIC_BOOKING_API_URL || 'https://api.thealley2b.pl';

export default function GaleriaPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImages() {
      try {
        const url = selectedSection
          ? `/api/gallery?section=${encodeURIComponent(selectedSection)}`
          : '/api/gallery';
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setImages(data);
        }
      } catch (error) {
        console.error('Error fetching gallery images:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, [selectedSection]);

  // Extract unique sections
  const sections = Array.from(
    new Set(images.map((img) => img.section).filter((s): s is string => s !== null))
  );

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <HeroSection
          title="Galeria"
          description="Zobacz nasz obiekt i atmosferę"
        />

        {/* Section Filter */}
        {sections.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedSection(null)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                selectedSection === null
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-800/50 text-white/80 hover:bg-purple-700/50'
              }`}
            >
              Wszystkie
            </button>
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => setSelectedSection(section)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedSection === section
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-800/50 text-white/80 hover:bg-purple-700/50'
                }`}
              >
                {section}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center text-white/70 py-12">
            Ładowanie galerii...
          </div>
        ) : images.length === 0 ? (
          <div className="text-center text-white/70 py-12">
            <ImageIcon className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Brak zdjęć w galerii</p>
            <p className="text-sm text-white/60">
              Zdjęcia będą tutaj wstawione z rzeczywistego obiektu
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {images.map((img) => {
              const imageUrl = img.url.startsWith('http')
                ? img.url
                : `${BOOKING_API_URL}${img.url}`;
              
              return (
                <div
                  key={img.id}
                  className="aspect-square rounded-lg border border-purple-700/30 overflow-hidden hover:border-purple-600 transition-all cursor-pointer group relative"
                >
                  <Image
                    src={imageUrl}
                    alt={img.caption || img.originalFilename}
                    width={500}
                    height={500}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {img.caption && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white text-sm font-medium">{img.caption}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
