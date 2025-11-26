import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import HeroSection from '../../components/HeroSection';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Link from 'next/link';
import { Brain, Clock, Users, ArrowLeft, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function QuizyPage() {
  const primaryColor = '#8B5CF6';
  const secondaryColor = '#3B82F6';
  
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
          title="Quizy"
          subtitle="Sprawdź swoją wiedzę w quizowym pokoju"
          variant="with-icon"
          icon={Brain}
          iconGradient={{ from: '#8B5CF6', to: '#3B82F6' }}
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
                    Nasz pokój quizowy to wyjątkowe miejsce, gdzie możesz sprawdzić swoją 
                    wiedzę w przyjaznej atmosferze. Wyposażony w najnowocześniejszy sprzęt 
                    multimedialny, pokój oferuje niezapomniane doświadczenie dla całej grupy.
                  </p>
                  <p className="text-white/90 text-lg leading-relaxed">
                    Sesja quizowa trwa 60 minut, podczas której zmierzycie się z różnorodnymi 
                    pytaniami z różnych dziedzin. Cena zależy od liczby uczestników (maksymalnie 
                    8 osób), co czyni tę aktywność idealną dla małych grup przyjaciół lub rodzin.
                  </p>
                  <p className="text-white/90 text-lg leading-relaxed">
                    Pokój jest wyposażony w komfortowe siedzenia, duży ekran interaktywny oraz 
                    system audio, który zapewnia doskonałą jakość dźwięku. Oferujemy również 
                    możliwość zamówienia przekąsek i napojów bezpośrednio do pokoju.
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
                    'Interaktywny system quizowy',
                    'Duży ekran multimedialny',
                    'Różnorodne kategorie pytań',
                    'System punktacji w czasie rzeczywistym',
                    'Komfortowe warunki i klimatyzacja'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-[#8B5CF6]/5 to-transparent border border-[#8B5CF6]/10 hover:border-[#8B5CF6]/30 transition-all group">
                      <div className="mt-1 p-1.5 bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] rounded-lg shadow-lg shadow-[#8B5CF6]/30 group-hover:scale-110 transition-transform">
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
                  <div className="p-2 bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] rounded-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  Szczegóły
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-[#8B5CF6]/10 to-transparent border border-[#8B5CF6]/20">
                  <div className="p-2.5 bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] rounded-lg shadow-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/70 text-sm mb-1 font-medium uppercase tracking-wider">Czas trwania</p>
                    <p className="text-white text-lg font-bold">60 minut</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-[#8B5CF6]/10 to-transparent border border-[#8B5CF6]/20">
                  <div className="p-2.5 bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] rounded-lg shadow-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/70 text-sm mb-1 font-medium uppercase tracking-wider">Liczba uczestników</p>
                    <p className="text-white text-lg font-bold">Do 8 osób</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-[#8B5CF6]/10 to-transparent border border-[#8B5CF6]/20">
                  <div className="p-2.5 bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] rounded-lg shadow-lg">
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
            <Card variant="hover" className="animate-scale-in border-2 border-[#8B5CF6] bg-gradient-to-br from-[#8B5CF6]/20 via-[#3B82F6]/20 to-[#8B5CF6]/10 shadow-2xl shadow-[#8B5CF6]/30 hover:shadow-[#8B5CF6]/50 transition-all">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="inline-flex p-4 bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] rounded-2xl shadow-xl shadow-[#8B5CF6]/40 mb-4">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Gotowy na wyzwanie?
                  </h3>
                  <p className="text-white/90 mb-6 text-base leading-relaxed">
                    Zarezerwuj pokój quizowy już dziś i sprawdź swoją wiedzę!
                  </p>
                </div>
                <Link href="https://rezerwacje.twoja-kręgielnia.pl/quiz" target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="default" size="lg" className="w-full text-lg py-6 font-bold shadow-xl shadow-[#8B5CF6]/40 hover:shadow-[#8B5CF6]/60 transition-all">
                    Zarezerwuj teraz
                  </Button>
                </Link>
                <p className="text-white/70 text-sm mt-5 font-medium">
                  lub zadzwoń: <a href="tel:+48123456789" className="text-[#8B5CF6] hover:text-[#3B82F6] transition-colors font-bold">+48 123 456 789</a>
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
