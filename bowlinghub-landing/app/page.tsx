import dynamic from 'next/dynamic';
import HeroSection from './components/HeroSection';
import ActivitiesSection from './components/ActivitiesSection';
import LocationSection from './components/LocationSection';

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
        <ActivitiesSection />

        {/* Map Section */}
        <LocationSection />

      </main>

      <Footer />
    </div>
  );
}