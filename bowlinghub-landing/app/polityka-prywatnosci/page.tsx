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
          title="Polityka prywatności (wersja przykładowa)"
          variant="with-icon"
          icon={FileText}
          iconGradient={{ from: '#0EA5E9', to: '#3B82F6' }}
        />

          <div className="max-w-4xl mx-auto">

          <div className="bg-slate-900/60 backdrop-blur-sm rounded-lg p-8 border border-sky-800/40 space-y-6 text-white/90">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Charakter przykładowy</h2>
              <p>
                Niniejszy dokument jest przykładową polityką prywatności przygotowaną wyłącznie na potrzeby
                demonstracyjne. Nie stanowi porady prawnej ani gotowego wzoru do wdrożenia w rzeczywistym
                serwisie internetowym.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Administrator danych (przykładowy)</h2>
              <p>
                Przykładowym administratorem danych osobowych jest „Demo Bowling Center”, 
                z siedzibą przy ul. Demo 1, 00-000 Miasto (adres przykładowy).
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
              <h2 className="text-2xl font-bold text-white mb-4">7. Kontakt (przykładowy)</h2>
              <p>
                W sprawach związanych z ochroną danych osobowych w realnym projekcie należy podać prawdziwe
                dane kontaktowe administratora. W tej wersji demonstracyjnej można posłużyć się adresem
                technicznym, np.: <span className="font-mono">privacy@example-bowling.pl</span>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
