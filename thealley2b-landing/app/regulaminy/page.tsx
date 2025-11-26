import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import { Scroll } from 'lucide-react';

export default function RegulaminyPage() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <HeroSection
          title="Regulaminy"
          variant="with-icon"
          icon={Scroll}
          iconGradient={{ from: '#8B5CF6', to: '#7C3AED' }}
        />

        <div className="max-w-4xl mx-auto">

          <div className="space-y-8">
            <div className="bg-purple-900/30 backdrop-blur-sm rounded-lg p-8 border border-purple-700/30">
              <h2 className="text-2xl font-bold text-white mb-4">Regulamin korzystania z obiektu</h2>
              <div className="space-y-4 text-white/90">
                <p>
                  Regulamin określa zasady korzystania z obiektu TheAlley2B - Premium Entertainment Hub.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Obiekt jest dostępny dla osób pełnoletnich oraz nieletnich pod opieką osób dorosłych</li>
                  <li>Zakaz palenia tytoniu i spożywania alkoholu przez osoby niepełnoletnie</li>
                  <li>Klienci zobowiązani są do zachowania porządku i kultury</li>
                  <li>Administracja zastrzega sobie prawo do odmowy obsługi klienta</li>
                  <li>Uszkodzenia sprzętu należy zgłaszać niezwłocznie personelowi</li>
                </ul>
              </div>
            </div>

            <div className="bg-purple-900/30 backdrop-blur-sm rounded-lg p-8 border border-purple-700/30">
              <h2 className="text-2xl font-bold text-white mb-4">Regulamin rezerwacji</h2>
              <div className="space-y-4 text-white/90">
                <p>
                  Zasady dokonywania i anulowania rezerwacji.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Rezerwacja wymaga podania danych kontaktowych</li>
                  <li>Rezerwacje można anulować do 24h przed wydarzeniem</li>
                  <li>Brak pojawienia się może skutkować naliczeniem opłaty</li>
                  <li>Opłata za rezerwację jest pobierana w momencie potwierdzenia</li>
                  <li>Zmiana terminu możliwa po uzgodnieniu z obsługą</li>
                </ul>
              </div>
            </div>

            <div className="bg-purple-900/30 backdrop-blur-sm rounded-lg p-8 border border-purple-700/30">
              <h2 className="text-2xl font-bold text-white mb-4">Regulamin wydarzeń</h2>
              <div className="space-y-4 text-white/90">
                <p>
                  Zasady uczestnictwa w organizowanych wydarzeniach.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Uczestnictwo w wydarzeniach wymaga wcześniejszej rezerwacji</li>
                  <li>Organizator zastrzega sobie prawo do zmiany programu</li>
                  <li>Nagrody w konkursach przyznawane są według regulaminu konkretnego wydarzenia</li>
                  <li>Uczestnicy zobowiązani są do przestrzegania zasad bezpieczeństwa</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
