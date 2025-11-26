import dynamic from 'next/dynamic';
import HeroSection from './components/HeroSection';
import LazyLoadWrapper from './components/LazyLoadWrapper';
import { MapPin, Circle, Target, Music, Brain } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card';
import Button from './components/ui/Button';
import { cn } from '@/lib/utils';

const Navbar = dynamic(() => import('./components/Navbar'), { ssr: true });
const Footer = dynamic(() => import('./components/Footer'));
const DayOffNotice = dynamic(() => import('./components/DayOffNotice'));

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      <DayOffNotice />
      
      <main className="flex-1 container mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <HeroSection
          title="Demo Bowling Center"
          subtitle="Przykładowe centrum rozrywki"
          description="Strona demonstracyjna prezentująca możliwości landingu dla centrum rozrywki z kręglami, bilardem, karaoke i quizami."
        />

        {/* Activities Section */}
        <LazyLoadWrapper>
          <section className="mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
              Nasze aktywności
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Kregle */}
            <Card variant="hover" className="animate-fade-in group h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-lg">
                    <Circle className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="group-hover:text-sky-300 transition-colors duration-200">
                    Kregle
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <p className="text-white/70 mb-4 flex-grow">
                  Rezerwacja jednego lub kilku torów od 1 godziny w górę (jeden slot = 1 godzina). Idealne dla grup przyjaciół i rodzinnych spotkań.
                </p>
                <Link href="https://rezerwacje.twoja-kręgielnia.pl/kregle" target="_blank" rel="noopener noreferrer">
                  <Button variant="default" className="w-full group-hover:bg-sky-400 transition-colors">
                    Rezerwuj
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Bilard */}
            <Card variant="hover" className="animate-fade-in group h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="group-hover:text-sky-300 transition-colors duration-200">
                    Bilard
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <p className="text-white/70 mb-4 flex-grow">
                  Stoły bilardowe rezerwowane od 1 godziny w górę (jeden slot = 1 godzina). Wybierz ile stołów potrzebujesz dla swojej rozgrywki.
                </p>
                <Link href="https://rezerwacje.twoja-kręgielnia.pl/bilard" target="_blank" rel="noopener noreferrer">
                  <Button variant="default" className="w-full group-hover:bg-sky-400 transition-colors">
                    Rezerwuj
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Quiz Room */}
            <Card variant="hover" className="animate-fade-in group h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="group-hover:text-sky-300 transition-colors duration-200">
                    Quiz Room
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <p className="text-white/70 mb-4 flex-grow">
                  Pokój quizowy na 60 minut. Cena zależy od liczby uczestników (do 8 osób). Sprawdź swoją wiedzę!
                </p>
                <Link href="https://rezerwacje.twoja-kręgielnia.pl/quiz" target="_blank" rel="noopener noreferrer">
                  <Button variant="default" className="w-full group-hover:bg-sky-400 transition-colors">
                    Rezerwuj
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Karaoke Room */}
            <Card variant="hover" className="animate-fade-in group h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-lg">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="group-hover:text-sky-300 transition-colors duration-200">
                    Karaoke Room
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <p className="text-white/70 mb-4 flex-grow">
                  Kameralny pokój karaoke na 1-4 godziny, maksymalnie 10 uczestników. Śpiewaj swoje ulubione hity!
                </p>
                <Link href="https://rezerwacje.twoja-kręgielnia.pl/karaoke" target="_blank" rel="noopener noreferrer">
                  <Button variant="default" className="w-full group-hover:bg-sky-400 transition-colors">
                    Rezerwuj
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
        </LazyLoadWrapper>

        {/* Map Section */}
        <LazyLoadWrapper rootMargin="200px">
          <section className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-sky-400" />
            Lokalizacja (przykładowa)
          </h2>
          <Card className="animate-fade-in">
            <CardContent className="p-6 md:p-8">
              <div className="aspect-video w-full bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-xl mb-4 flex items-center justify-center border border-slate-800">
                <p className="text-white/70">Mapa demonstracyjna – w docelowym projekcie wstaw mapę Google / innego dostawcy.</p>
              </div>
              <p className="text-white/90">
                Użyj mapy powyżej, aby znaleźć lokalizację swojego obiektu lub sprawdź dane adresowe
                w sekcji kontaktowej.
              </p>
            </CardContent>
          </Card>
        </section>
        </LazyLoadWrapper>

      </main>

      <Footer />
    </div>
  );
}