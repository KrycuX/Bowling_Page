import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import { FileText } from 'lucide-react';

export default function PolitykaPrywatnosciPage() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <HeroSection
          title="Polityka prywatności"
          variant="with-icon"
          icon={FileText}
          iconGradient={{ from: '#8B5CF6', to: '#7C3AED' }}
        />

        <div className="max-w-4xl mx-auto">

          <div className="bg-purple-900/30 backdrop-blur-sm rounded-lg p-8 border border-purple-700/30 space-y-6 text-white/90">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Wprowadzenie</h2>
              <p>
                Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych 
                przekazanych przez Użytkowników w związku z korzystaniem przez nich z serwisu internetowego.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Administrator danych</h2>
              <p>
                Administratorem danych osobowych jest TheAlley2B - Premium Entertainment Hub, 
                z siedzibą przy ul. Przykładowa 123, 00-000 Warszawa.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Zakres przetwarzanych danych</h2>
              <p>
                Przetwarzamy następujące dane osobowe: imię i nazwisko, adres e-mail, numer telefonu, 
                adres zamieszkania (w przypadku rezerwacji).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Cel przetwarzania danych</h2>
              <p>
                Dane osobowe przetwarzane są w celu: realizacji rezerwacji, kontaktów z klientami, 
                wysyłki newslettera (za zgodą), realizacji obowiązków prawnych.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Prawa użytkownika</h2>
              <p>
                Użytkownik ma prawo do: dostępu do swoich danych, ich poprawiania, usunięcia, 
                ograniczenia przetwarzania, przenoszenia danych, wniesienia sprzeciwu, cofnięcia zgody.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Pliki cookies</h2>
              <p>
                Serwis wykorzystuje pliki cookies w celu dostosowania serwisu do potrzeb użytkowników 
                oraz w celach statystycznych. Użytkownik może zmienić ustawienia przeglądarki, 
                aby wyłączyć obsługę plików cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Kontakt</h2>
              <p>
                W sprawach związanych z ochroną danych osobowych można skontaktować się z Administratorem 
                pod adresem: kontakt@thealley2b.pl
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
