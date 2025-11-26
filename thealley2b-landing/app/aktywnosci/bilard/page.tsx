import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import HeroSection from '../../components/HeroSection';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Link from 'next/link';
import { Target, Clock, Users, ArrowLeft, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BilardPage() {
  const primaryColor = '#3B82F6';
  const secondaryColor = '#2563EB';
  
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
          title="Bilard"
          subtitle="Precyzja, strategia i doskonała zabawa"
          variant="with-icon"
          icon={Target}
          iconGradient={{ from: '#3B82F6', to: '#2563EB' }}
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
                    Nasze stoły bilardowe to profesjonalny sprzęt wysokiej klasy, 
                    który zapewnia niezapomnianą rozgrywkę. Niezależnie od tego, czy 
                    jesteś doświadczonym graczem czy dopiero zaczynasz przygodę z bilardem, 
                    nasze stoły są idealne dla Ciebie.
                  </p>
                  <p className="text-white/90 text-lg leading-relaxed">
                    Rezerwacja stołów odbywa się na godzinowe sloty czasowe (jeden slot = 1 godzina). 
                    Możesz zarezerwować jeden lub kilka stołów jednocześnie od 1 godziny w górę, 
                    w zależności od liczby uczestników. Każdy stół może pomieścić do 4 graczy, co 
                    pozwala na organizację turniejów i przyjacielskich rozgrywek.
                  </p>
                  <p className="text-white/90 text-lg leading-relaxed">
                    Wszystkie stoły są regularnie konserwowane i wyposażone w profesjonalny 
                    sprzęt bilardowy. Oferujemy również możliwość zamówienia przekąsek 
                    i napojów, aby urozmaicić Twoje doświadczenie.
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
                    'Profesjonalne stoły bilardowe',
                    'Pełny zestaw kijów i bil',
                    'Różne warianty gry (ósemka, dziewiątka, snooker)',
                    'Przestronna przestrzeń wokół stołów',
                    'Klimatyzowane pomieszczenie'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-[#3B82F6]/5 to-transparent border border-[#3B82F6]/10 hover:border-[#3B82F6]/30 transition-all group">
                      <div className="mt-1 p-1.5 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-lg shadow-lg shadow-[#3B82F6]/30 group-hover:scale-110 transition-transform">
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
            <Card variant="gradient" className="animate-scale-in border-[#3B82F6]/30 shadow-2xl shadow-[#3B82F6]/20 bg-gradient-to-br from-[#1A1A2E] via-[#2D2D44]/50 to-[#1A1A2E]">
              <CardHeader className="border-b border-[#3B82F6]/20">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  Szczegóły
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-[#3B82F6]/10 to-transparent border border-[#3B82F6]/20">
                  <div className="p-2.5 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-lg shadow-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/70 text-sm mb-1 font-medium uppercase tracking-wider">Czas trwania</p>
                    <p className="text-white text-lg font-bold">Od 1 godziny</p>
                    <p className="text-white/70 text-sm mt-1">(jeden slot = 1 godzina)</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-[#3B82F6]/10 to-transparent border border-[#3B82F6]/20">
                  <div className="p-2.5 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-lg shadow-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/70 text-sm mb-1 font-medium uppercase tracking-wider">Liczba uczestników</p>
                    <p className="text-white text-lg font-bold">Do 4 osób na stół</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-[#3B82F6]/10 to-transparent border border-[#3B82F6]/20">
                  <div className="p-2.5 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-lg shadow-lg">
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
            <Card variant="hover" className="animate-scale-in border-2 border-[#3B82F6] bg-gradient-to-br from-[#3B82F6]/20 via-[#2563EB]/20 to-[#3B82F6]/10 shadow-2xl shadow-[#3B82F6]/30 hover:shadow-[#3B82F6]/50 transition-all">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="inline-flex p-4 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-2xl shadow-xl shadow-[#3B82F6]/40 mb-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Gotowy na rozgrywkę?
                  </h3>
                  <p className="text-white/90 mb-6 text-base leading-relaxed">
                    Zarezerwuj stół już dziś i ciesz się doskonałą zabawą!
                  </p>
                </div>
                <Link href="https://rezerwacje.thealley2b.pl/bilard" target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="default" size="lg" className="w-full text-lg py-6 font-bold shadow-xl shadow-[#3B82F6]/40 hover:shadow-[#3B82F6]/60 transition-all">
                    Zarezerwuj teraz
                  </Button>
                </Link>
                <p className="text-white/70 text-sm mt-5 font-medium">
                  lub zadzwoń: <a href="tel:+48123456789" className="text-[#3B82F6] hover:text-[#2563EB] transition-colors font-bold">+48 123 456 789</a>
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
