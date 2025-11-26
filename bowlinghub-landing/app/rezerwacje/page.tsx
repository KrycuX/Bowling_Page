import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import { Calendar, Clock, Users, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { cn } from '@/lib/utils';

export default function RezerwacjePage() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <HeroSection
          title="Rezerwacje"
          description="Zarezerwuj stolik lub aktywność już dziś!"
        />

        <div className="max-w-4xl mx-auto">

          <Card className="animate-fade-in">
            <CardContent className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-sky-400" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Rezerwacja online</h3>
                  <p className="text-white/70 text-sm">Zarezerwuj przez nasz system online</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-6 h-6 text-sky-400" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Telefonicznie (przykład)</h3>
                  <a href="tel:+48111222333" className="text-sky-300 hover:text-sky-100 transition-colors">
                    +48 111 222 333
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-sky-400" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Email (przykład)</h3>
                  <a href="mailto:rezerwacje@example-bowling.pl" className="text-sky-300 hover:text-sky-100 transition-colors">
                    rezerwacje@example-bowling.pl
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-purple-400" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Godziny rezerwacji</h3>
                  <p className="text-white/70 text-sm">Pn-Nd: 10:00 - 22:00</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 rounded-lg p-6 md:p-8 text-center mt-6 border border-sky-800/40">
              <h2 className="text-2xl font-bold text-white mb-4">System rezerwacji online</h2>
              <p className="text-white/80 mb-6">
                Tutaj będzie wbudowany system rezerwacji lub przekierowanie do platformy rezerwacyjnej
              </p>
              <Button size="lg">
                Zarezerwuj teraz
              </Button>
            </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
