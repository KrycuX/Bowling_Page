'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import { Gift, Percent, Calendar } from 'lucide-react';
import Link from 'next/link';
import type { PublicCoupon } from '@/lib/api-client';

function formatPrice(value: number, type: 'PERCENT' | 'FIXED'): string {
  if (type === 'PERCENT') {
    return `${value / 100}%`;
  }
  return `${(value / 100).toFixed(2)} zł`;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Bez limitu';
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function PromocjePage() {
  const [coupons, setCoupons] = useState<PublicCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    async function fetchCoupons() {
      try {
        const response = await fetch('/api/coupons');
        if (response.ok) {
          const data = await response.json();
          setCoupons(data);
        }
      } catch (error) {
        console.error('Error fetching coupons:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCoupons();
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newsletterEmail.trim()) {
      setNewsletterMessage({ type: 'error', text: 'Proszę podać adres email' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail)) {
      setNewsletterMessage({ type: 'error', text: 'Nieprawidłowy format adresu email' });
      return;
    }

    setNewsletterLoading(true);
    setNewsletterMessage(null);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setNewsletterMessage({ 
          type: 'error', 
          text: data.error || 'Wystąpił błąd podczas zapisywania do newslettera' 
        });
      } else {
        setNewsletterMessage({ 
          type: 'success', 
          text: 'Dziękujemy! Zostałeś zapisany do newslettera.' 
        });
        setNewsletterEmail(''); // Reset form
      }
    } catch (error) {
      setNewsletterMessage({ 
        type: 'error', 
        text: 'Wystąpił błąd podczas zapisywania do newslettera' 
      });
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <HeroSection
          title="Promocje"
          description="Sprawdź nasze aktualne oferty specjalne"
        />

        {loading ? (
          <div className="text-center text-white/70 py-12">
            Ładowanie promocji...
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center text-white/70 py-12">
            Obecnie nie ma dostępnych promocji. Sprawdź ponownie później!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="bg-gradient-to-br from-sky-900/40 to-cyan-900/40 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-sky-700/30 hover:border-sky-500 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-sky-600 text-white px-4 py-1 rounded-bl-lg font-bold flex items-center gap-1">
                  <Percent className="w-4 h-4" />
                  {formatPrice(coupon.value, coupon.type)}
                </div>
                
                <div className="flex items-center gap-3 mb-4 mt-2">
                  <Gift className="w-6 h-6 text-sky-400" />
                  <h3 className="text-2xl font-bold text-white">Kod: {coupon.code}</h3>
                </div>
                
                <p className="text-white/80 mb-4">
                  {coupon.type === 'PERCENT' 
                    ? `Rabat ${formatPrice(coupon.value, coupon.type)} na wszystkie aktywności`
                    : `Rabat ${formatPrice(coupon.value, coupon.type)} na wszystkie aktywności`}
                  {coupon.minTotal && (
                    <span className="block text-sm text-white/60 mt-2">
                      Minimalna wartość zamówienia: {(coupon.minTotal / 100).toFixed(2)} zł
                    </span>
                  )}
                </p>
                
                {coupon.validTo && (
                  <div className="flex items-center gap-2 text-white/80 text-sm mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>Ważne do: {formatDate(coupon.validTo)}</span>
                  </div>
                )}
                
                <Link 
                  href={`https://rezerwacje.twoja-kręgielnia.pl/rezerwacje?coupon=${encodeURIComponent(coupon.code)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition-colors text-center"
                >
                  Skorzystaj z oferty
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-slate-900/40 backdrop-blur-sm rounded-lg p-8 md:p-10 border border-sky-800/30 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Newsletter</h2>
          <p className="text-white/80 mb-6">
            Zapisz się do newslettera, aby otrzymywać informacje o najnowszych promocjach
          </p>
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Twój email"
                  disabled={newsletterLoading}
                  className="flex-1 px-4 py-2 bg-slate-900/60 border border-sky-800/40 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
                <button 
                  type="submit"
                  disabled={newsletterLoading}
                  className="px-6 py-2 bg-gradient-to-r from-sky-600 to-cyan-500 text-white rounded-lg font-semibold hover:from-sky-700 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {newsletterLoading ? 'Zapisywanie...' : 'Zapisz się'}
                </button>
              </div>
              <div className="flex justify-center text-xs text-white/60">
                Formularz newslettera w wersji demo nie posiada dodatkowego CAPTCHA.
              </div>
            </div>
            {newsletterMessage && (
              <div className={`mt-4 px-4 py-2 rounded-lg ${
                newsletterMessage.type === 'success' 
                  ? 'bg-green-900/50 text-green-200 border border-green-700/30' 
                  : 'bg-red-900/50 text-red-200 border border-red-700/30'
              }`}>
                {newsletterMessage.text}
              </div>
            )}
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
