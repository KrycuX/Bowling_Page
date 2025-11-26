'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import { Turnstile } from '../components/Turnstile';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function KontaktPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    rodoConsent: false,
    marketingConsent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.rodoConsent) {
      setSubmitStatus('error');
      setErrorMessage('Musisz wyrazić zgodę RODO aby wysłać wiadomość');
      return;
    }

    setSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    if (!turnstileToken) {
      setSubmitStatus('error');
      setErrorMessage('Proszę ukończyć weryfikację zabezpieczającą');
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CF-Turnstile-Response': turnstileToken,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setTurnstileToken(null); // Reset Turnstile after success
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
          rodoConsent: false,
          marketingConsent: false,
        });
      } else {
        const error = await response.json();
        setSubmitStatus('error');
        setErrorMessage(error.error || 'Wystąpił błąd podczas wysyłania wiadomości');
      }
    } catch {
      setSubmitStatus('error');
      setErrorMessage('Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie później.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <HeroSection
          title="Kontakt"
          description="Skontaktuj się z nami - chętnie odpowiemy na Twoje pytania"
        />

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-purple-900/30 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-purple-700/30">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Adres</h3>
                  <p className="text-white/80">
                    ul. Przykładowa 123<br />
                    00-000 Warszawa<br />
                    Polska
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-900/30 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-purple-700/30">
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Telefon</h3>
                  <a href="tel:+48123456789" className="text-purple-300 hover:text-purple-200 transition-colors block">
                    +48 123 456 789
                  </a>
                  <p className="text-white/70 text-sm mt-2">Pn-Nd: 10:00 - 22:00</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-900/30 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-purple-700/30">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Email</h3>
                  <a href="mailto:kontakt@thealley2b.pl" className="text-[#A78BFA] hover:text-[#8B5CF6] transition-colors block">
                    kontakt@thealley2b.pl
                  </a>
                  <a href="mailto:rezerwacje@thealley2b.pl" className="text-[#A78BFA] hover:text-[#8B5CF6] transition-colors block mt-2">
                    rezerwacje@thealley2b.pl
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-purple-900/30 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-purple-700/30">
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Godziny otwarcia</h3>
                  <div className="text-white/80 space-y-1 text-sm">
                    <p>Poniedziałek - Czwartek: 14:00 - 23:00</p>
                    <p>Piątek: 14:00 - 24:00</p>
                    <p>Sobota: 12:00 - 24:00</p>
                    <p>Niedziela: 12:00 - 22:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-purple-900/30 backdrop-blur-sm rounded-lg p-6 md:p-8 lg:p-10 border border-purple-700/30">
            <h2 className="text-2xl font-bold text-white mb-6">Wyślij wiadomość</h2>
            
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-900/30 border border-green-700/30 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-200 font-semibold">Wiadomość wysłana pomyślnie!</p>
                  <p className="text-green-300/80 text-sm mt-1">Odpowiemy najszybciej jak to możliwe.</p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-700/30 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-200 font-semibold">Błąd podczas wysyłania</p>
                  <p className="text-red-300/80 text-sm mt-1">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-white/90 mb-2 text-sm font-medium">
                  Imię i nazwisko *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-purple-800/50 border border-purple-700/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                  placeholder="Jan Kowalski"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-white/90 mb-2 text-sm font-medium">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-purple-800/50 border border-purple-700/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                  placeholder="jan@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-white/90 mb-2 text-sm font-medium">
                  Telefon (opcjonalnie)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-purple-800/50 border border-purple-700/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                  placeholder="+48 123 456 789"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-white/90 mb-2 text-sm font-medium">
                  Wiadomość *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 bg-purple-800/50 border border-purple-700/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500 resize-none"
                  placeholder="Twoja wiadomość..."
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="rodoConsent"
                    name="rodoConsent"
                    required
                    checked={formData.rodoConsent}
                    onChange={(e) => setFormData({ ...formData, rodoConsent: e.target.checked })}
                    className="mt-1 w-4 h-4 text-purple-600 bg-purple-800/50 border-purple-700/30 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="rodoConsent" className="text-white/80 text-sm">
                    Wyrażam zgodę na przetwarzanie moich danych osobowych w celu udzielenia odpowiedzi na moją wiadomość. *
                    <Link href="/polityka-prywatnosci" className="text-purple-300 hover:text-purple-200 underline ml-1">
                      Polityka prywatności
                    </Link>
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="marketingConsent"
                    name="marketingConsent"
                    checked={formData.marketingConsent}
                    onChange={(e) => setFormData({ ...formData, marketingConsent: e.target.checked })}
                    className="mt-1 w-4 h-4 text-purple-600 bg-purple-800/50 border-purple-700/30 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="marketingConsent" className="text-white/80 text-sm">
                    Wyrażam zgodę na otrzymywanie informacji marketingowych (np. promocje, nowości) na podany adres email. (opcjonalnie)
                  </label>
                </div>
              </div>

              <div>
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onError={() => {
                    setTurnstileToken(null);
                    setSubmitStatus('error');
                    setErrorMessage('Weryfikacja zabezpieczająca nie powiodła się. Spróbuj ponownie.');
                  }}
                  mode="managed"
                  theme="auto"
                />
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Wysyłanie...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Wyślij wiadomość
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Map Section */}
        <section className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#8B5CF6]" />
            Lokalizacja
          </h2>
          <div className="bg-purple-900/30 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-purple-700/30">
            <div className="aspect-video w-full bg-gradient-to-br from-[#2D2D44]/50 to-[#1A1A2E]/50 rounded-xl mb-4 flex items-center justify-center border border-[#2D2D44]">
              <p className="text-white/70">Mapa będzie tutaj wstawiona</p>
            </div>
            <p className="text-white/90">
              Użyj mapy powyżej, aby znaleźć naszą lokalizację lub sprawdź adres w sekcji kontaktowej powyżej
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
