import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Link from 'next/link';
import { Circle, Target, Brain, Music, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const activities = [
  {
    href: '/aktywnosci/kregle',
    title: 'Kregle',
    description: 'Rezerwacja jednego lub kilku torów od 1 godziny w górę (jeden slot = 1 godzina). Idealne dla grup przyjaciół i rodzinnych spotkań.',
    icon: Circle,
    color: 'from-[#8B5CF6] to-[#7C3AED]',
  },
  {
    href: '/aktywnosci/bilard',
    title: 'Bilard',
    description: 'Stoły bilardowe rezerwowane od 1 godziny w górę (jeden slot = 1 godzina). Wybierz ile stołów potrzebujesz dla swojej rozgrywki.',
    icon: Target,
    color: 'from-[#3B82F6] to-[#2563EB]',
  },
  {
    href: '/aktywnosci/quizy',
    title: 'Quizy',
    description: 'Pokój quizowy na 60 minut. Cena zależy od liczby uczestników (do 8 osób). Sprawdź swoją wiedzę!',
    icon: Brain,
    color: 'from-[#8B5CF6] to-[#3B82F6]',
  },
  {
    href: '/aktywnosci/karaoke',
    title: 'Karaoke',
    description: 'Kameralny pokój karaoke na 1-4 godziny, maksymalnie 10 uczestników. Śpiewaj swoje ulubione hity!',
    icon: Music,
    color: 'from-[#EC4899] to-[#BE185D]',
  },
];

export default function ActivitiesPage() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <HeroSection
          title="Nasze Aktywności"
          subtitle="Odkryj różnorodne formy rozrywki"
          description="Wybierz aktywność, która najbardziej Cię interesuje i sprawdź dostępne terminy"
          animation="animate-fade-in"
        />

        {/* Activities Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <Card
                key={activity.href}
                variant="hover"
                className={cn(
                  'group h-full flex flex-col transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#8B5CF6]/30',
                  'animate-fade-in-stagger'
                )}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                      'p-3 bg-gradient-to-br rounded-lg transition-transform duration-300 group-hover:scale-110',
                      activity.color
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="group-hover:text-[#A78BFA] transition-colors duration-200">
                      {activity.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <p className="text-white/70 mb-4 flex-grow">
                    {activity.description}
                  </p>
                  <Link href={activity.href} className="w-full">
                    <Button 
                      variant="default" 
                      className="w-full group-hover:bg-[#A78BFA] transition-colors flex items-center justify-center gap-2"
                    >
                      Zobacz więcej
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* Additional Info Section */}
        <section className="mt-16 md:mt-20 animate-slide-in-up">
          <Card variant="gradient" className="text-center">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Nie możesz się zdecydować?
              </h2>
              <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                Każda z naszych aktywności oferuje wyjątkowe doświadczenie. Kliknij na wybraną aktywność, 
                aby poznać szczegóły i zarezerwować termin już dziś!
              </p>
              <p className="text-white/70 text-sm">
                Wszystkie rezerwacje możesz również dokonać telefonicznie: +48 123 456 789
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}

