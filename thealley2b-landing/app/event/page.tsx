import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import { PartyPopper, Calendar, Users } from 'lucide-react';

export default function EventPage() {
  const events = [
    {
      title: 'Wieczór karaoke',
      date: '2025-11-15',
      time: '20:00',
      description: 'Wspólne śpiewanie w naszych prywatnych salach karaoke',
    },
    {
      title: 'Turniej bowlingowy',
      date: '2025-11-20',
      time: '18:00',
      description: 'Miesięczny turniej bowlingowy z nagrodami',
    },
    {
      title: 'Wieczór gier planszowych',
      date: '2025-11-25',
      time: '19:00',
      description: 'Gry planszowe dla całej rodziny',
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <HeroSection
          title="Wydarzenia"
          description="Dołącz do naszych wyjątkowych wydarzeń"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {events.map((event, idx) => (
            <div key={idx} className="bg-purple-900/30 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-purple-700/30 hover:bg-purple-900/50 transition-all">
              <div className="flex items-center gap-2 mb-4">
                <PartyPopper className="w-5 h-5 text-purple-400" />
                <h3 className="text-xl font-bold text-white">{event.title}</h3>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-white/80">
                  <Calendar className="w-4 h-4" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Users className="w-4 h-4" />
                  <span>{event.time}</span>
                </div>
              </div>
              <p className="text-white/70 text-sm mb-4">{event.description}</p>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                Zarezerwuj miejsce
              </button>
            </div>
          ))}
        </div>

        <div className="bg-purple-900/30 backdrop-blur-sm rounded-lg p-8 md:p-10 border border-purple-700/30 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Organizujesz wydarzenie?</h2>
          <p className="text-white/80 mb-6">
            Skontaktuj się z nami, aby zorganizować prywatne wydarzenie w naszym obiekcie
          </p>
          <a 
            href="/kontakt"
            className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            Skontaktuj się
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
