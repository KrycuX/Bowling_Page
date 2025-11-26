import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import HeroSection from '../../components/HeroSection';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Link from 'next/link';
import { Circle, Clock, Users, ArrowLeft, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function KreglePage() {
  const primaryColor = '#8B5CF6';
  const secondaryColor = '#7C3AED';
  
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
          title="Kregle"
          subtitle="Klasyczna rozrywka dla całej rodziny"
          variant="with-icon"
          icon={Circle}
          iconGradient={{ from: '#8B5CF6', to: '#7C3AED' }}
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
              <CardContent className="pt-6 ">
                <div className="space-y-5">
                  <p className="text-white/95 text-lg leading-relaxed">
                    Nasze tory do kręgli to idealne miejsce na spotkanie z przyjaciółmi, 
                    rodzinne wyjście lub firmową integrację. Oferujemy profesjonalne tory 
                    wyposażone w najnowocześniejszy sprzęt, który zapewnia niezapomnianą 
                    rozrywkę dla wszystkich uczestników.
                  </p>
                  <p className="text-white/90 text-lg leading-relaxed">
                    Rezerwacja obejmuje wybór jednego lub kilku torów na wybraną godzinę. 
                    Możesz zarezerwować tory od 1 godziny w górę (jeden slot = 1 godzina), 
                    co pozwala na spokojną rozgrywkę i pełne wykorzystanie czasu.
                  </p>
                  <p className="text-white/90 text-lg leading-relaxed">
                    Wszystkie tory są regularnie konserwowane i przygotowane do gry. 
                    Oferujemy również możliwość zamówienia przekąsek i napojów bezpośrednio 
                    na tor, aby urozmaicić Twoje doświadczenie.
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
                    'Profesjonalne tory do kręgli',
                    'Automatyczny system punktacji',
                    'Wypożyczalnia butów i sprzętu',
                    'Obsługa kelnerska na torach',
                    'Przyjazne oświetlenie i klimatyzacja'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-[#8B5CF6]/5 to-transparent border border-[#8B5CF6]/10 hover:border-[#8B5CF6]/30 transition-all group">
                      <div className="mt-1 p-1.5 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-lg shadow-lg shadow-[#8B5CF6]/30 group-hover:scale-110 transition-transform">
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
            <Card variant="gradient" className="animate-scale-in border-[#8B5CF6]/30 shadow-2xl shadow-[#8B5CF6]/20 bg-gradient-to-br from-[#1A1A2E] via-[#2D2D44]/50 to-[#1A1A2E]">
              <CardHeader className="border-b border-[#8B5CF6]/20">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  Szczegóły
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-[#8B5CF6]/10 to-transparent border border-[#8B5CF6]/20">
                  <div className="p-2.5 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-lg shadow-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/70 text-sm mb-1 font-medium uppercase tracking-wider">Czas trwania</p>
                    <p className="text-white text-lg font-bold">Od 1 godziny</p>
                    <p className="text-white/70 text-sm mt-1">(jeden slot = 1 godzina)</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-[#8B5CF6]/10 to-transparent border border-[#8B5CF6]/20">
                  <div className="p-2.5 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-lg shadow-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/70 text-sm mb-1 font-medium uppercase tracking-wider">Liczba uczestników</p>
                    <p className="text-white text-lg font-bold">Do 6 osób na tor</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-[#8B5CF6]/10 to-transparent border border-[#8B5CF6]/20">
                  <div className="p-2.5 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-lg shadow-lg">
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
            <Card variant="hover" className="animate-scale-in border-2 border-[#8B5CF6] bg-gradient-to-br from-[#8B5CF6]/20 via-[#7C3AED]/20 to-[#8B5CF6]/10 shadow-2xl shadow-[#8B5CF6]/30 hover:shadow-[#8B5CF6]/50 transition-all">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="inline-flex p-4 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-2xl shadow-xl shadow-[#8B5CF6]/40 mb-4">
                    <Circle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Gotowy na rozgrywkę?
                  </h3>
                  <p className="text-white/90 mb-6 text-base leading-relaxed">
                    Zarezerwuj tor już dziś i ciesz się doskonałą zabawą!
                  </p>
                </div>
                <Link href="https://rezerwacje.thealley2b.pl/kregle" target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="default" size="lg" className="w-full text-lg py-6 font-bold shadow-xl shadow-[#8B5CF6]/40 hover:shadow-[#8B5CF6]/60 transition-all">
                    Zarezerwuj teraz
                  </Button>
                </Link>
                <p className="text-white/70 text-sm mt-5 font-medium">
                  lub zadzwoń: <a href="tel:+48123456789" className="text-[#8B5CF6] hover:text-[#7C3AED] transition-colors font-bold">+48 123 456 789</a>
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
