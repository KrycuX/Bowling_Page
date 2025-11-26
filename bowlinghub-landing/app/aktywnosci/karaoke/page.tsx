import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import HeroSection from '../../components/HeroSection';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Link from 'next/link';
import { Music, Clock, Users, ArrowLeft, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function KaraokePage() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {/* Breadcrumb */}
        <div className="mb-8 animate-fade-in">
          <Link 
            href="/aktywnosci" 
            className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-2 text-sm font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Wróć do aktywności
          </Link>
        </div>

        <HeroSection
          title="Karaoke"
          subtitle="Śpiewaj swoje ulubione hity w kameralnym pokoju"
          variant="with-icon"
          icon={Music}
          iconGradient={{ from: '#EC4899', to: '#BE185D' }}
          animation="animate-slide-in-up"
        />

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <Card variant="default" className="animate-fade-in border-[#2D2D44] shadow-xl shadow-black/20">
              <CardHeader className="border-b border-[#2D2D44]/50">
                <CardTitle className="text-3xl">Opis aktywności</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-5">
                  <p className="text-white/95 text-lg leading-relaxed">
                    Nasz pokój karaoke to idealne miejsce na wieczór pełen muzyki i dobrej 
                    zabawy. Kameralne pomieszczenie zostało zaprojektowane z myślą o komforcie 
                    i doskonałej jakości dźwięku, zapewniając niezapomniane doświadczenie 
                    dla całej grupy.
                  </p>
                  <p className="text-white/90 text-lg leading-relaxed">
                    Rezerwacja pokoju karaoke trwa od 1 do 4 godzin, co pozwala na pełne 
                    wykorzystanie czasu. Pokój może pomieścić maksymalnie 10 uczestników, 
                    co czyni go idealnym miejscem na spotkania towarzyskie, urodziny lub 
                    firmowe imprezy.
                  </p>
                  <p className="text-white/90 text-lg leading-relaxed">
                    Pokój jest wyposażony w profesjonalny system nagłośnienia, duży ekran 
                    z tekstami piosenek oraz szeroką bibliotekę utworów w różnych językach. 
                    Oferujemy również możliwość zamówienia przekąsek i napojów bezpośrednio 
                    do pokoju, aby urozmaicić Twoje doświadczenie.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card variant="default" className="animate-fade-in border-[#2D2D44] shadow-xl shadow-black/20">
              <CardHeader className="border-b border-[#2D2D44]/50">
                <CardTitle className="text-3xl">Co oferujemy</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    'Profesjonalny system nagłośnienia',
                    'Duży ekran z tekstami piosenek',
                    'Szeroka biblioteka utworów (polskie, angielskie, karaoke)',
                    'Klimatyzowane, komfortowe pomieszczenie',
                    'Dostępne efekty dźwiękowe i oświetlenie'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-[#EC4899]/5 to-transparent border border-[#EC4899]/10 hover:border-[#EC4899]/30 transition-all group">
                      <div className="mt-1 p-1.5 bg-gradient-to-br from-[#EC4899] to-[#BE185D] rounded-lg shadow-lg shadow-[#EC4899]/30 group-hover:scale-110 transition-transform">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-white/95 font-medium flex-1 leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details Card */}
            <Card variant="gradient" className="animate-scale-in border-[#EC4899]/30 shadow-2xl shadow-[#EC4899]/20 bg-gradient-to-br from-[#1A1A2E] via-[#2D2D44]/50 to-[#1A1A2E]">
              <CardHeader className="border-b border-[#EC4899]/20">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-[#EC4899] to-[#BE185D] rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  Szczegóły
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-[#EC4899]/10 to-transparent border border-[#EC4899]/20">
                  <div className="p-2.5 bg-gradient-to-br from-[#EC4899] to-[#BE185D] rounded-lg shadow-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/70 text-sm mb-1 font-medium uppercase tracking-wider">Czas trwania</p>
                    <p className="text-white text-lg font-bold">1-4 godziny</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-[#EC4899]/10 to-transparent border border-[#EC4899]/20">
                  <div className="p-2.5 bg-gradient-to-br from-[#EC4899] to-[#BE185D] rounded-lg shadow-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/70 text-sm mb-1 font-medium uppercase tracking-wider">Liczba uczestników</p>
                    <p className="text-white text-lg font-bold">Maksymalnie 10 osób</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-[#EC4899]/10 to-transparent border border-[#EC4899]/20">
                  <div className="p-2.5 bg-gradient-to-br from-[#EC4899] to-[#BE185D] rounded-lg shadow-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/70 text-sm mb-1 font-medium uppercase tracking-wider">Rezerwacja</p>
                    <p className="text-white text-lg font-bold">Online lub telefonicznie</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reservation Card */}
            <Card variant="hover" className="animate-scale-in border-2 border-[#EC4899] bg-gradient-to-br from-[#EC4899]/20 via-[#BE185D]/20 to-[#EC4899]/10 shadow-2xl shadow-[#EC4899]/30 hover:shadow-[#EC4899]/50 transition-all">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="inline-flex p-4 bg-gradient-to-br from-[#EC4899] to-[#BE185D] rounded-2xl shadow-xl shadow-[#EC4899]/40 mb-4">
                    <Music className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Gotowy na występ?
                  </h3>
                  <p className="text-white/90 mb-6 text-base leading-relaxed">
                    Zarezerwuj pokój karaoke już dziś i śpiewaj swoje ulubione hity!
                  </p>
                </div>
                <Link href="https://rezerwacje.bowlinghub.pl/karaoke" target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="default" size="lg" className="w-full text-lg py-6 font-bold shadow-xl shadow-[#EC4899]/40 hover:shadow-[#EC4899]/60 transition-all">
                    Zarezerwuj teraz
                  </Button>
                </Link>
                <p className="text-white/70 text-sm mt-5 font-medium">
                  lub zadzwoń: <a href="tel:+48123456789" className="text-[#EC4899] hover:text-[#BE185D] transition-colors font-bold">+48 123 456 789</a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

