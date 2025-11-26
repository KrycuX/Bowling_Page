import Link from 'next/link';
import { FileText, Scroll, Clock, MapPin, Phone, Mail } from 'lucide-react';
import BusinessHours from './BusinessHours';

export default function Footer() {
  return (
    <footer className="bg-slate-950/70 backdrop-blur-sm border-t border-slate-800/70 mt-16 w-full relative z-10">
      {/* Border z poświatą na górze */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500/30 to-transparent shadow-[0_0_8px_rgba(56,189,248,0.3)]" />
      <div className="container mx-auto w-full px-4 sm:px-6 lg:px-8">
        {/* Pierwszy poziom - 3 sekcje */}
        <div className="py-6 md:py-8 border-b border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 md:gap-12">
            {/* Godziny otwarcia */}
            <div className="relative">
              <h3 className="text-base md:text-lg font-bold text-white mb-5 md:mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-sky-400" />
                Godziny otwarcia
              </h3>
              <BusinessHours />
            </div>

            {/* Dane kontaktowe */}
            <div className="relative md:pl-8">
              {/* Kreska rozdzielająca - przed sekcją */}
              <div className="hidden md:block absolute left-0 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-sky-500/30 to-transparent shadow-[0_0_8px_rgba(56,189,248,0.3)]" />
              
              <h3 className="text-base md:text-lg font-bold text-white mb-5 md:mb-6 flex items-center gap-2">
                <Phone className="w-4 h-4 md:w-5 md:h-5 text-sky-400" />
                Dane kontaktowe
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white/90 font-medium mb-0.5">Adres (przykładowy)</p>
                    <p className="text-white/70 text-xs leading-relaxed">
                      ul. Demo 1<br />
                      00-000 Miasto
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white/90 font-medium mb-0.5">Telefon</p>
                    <a href="tel:+48111222333" className="text-white/70 hover:text-sky-300 transition-colors text-xs">
                      +48 111 222 333
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white/90 font-medium mb-0.5">Email</p>
                    <a href="mailto:kontakt@example-bowling.pl" className="text-white/70 hover:text-sky-300 transition-colors text-xs break-all">
                      kontakt@example-bowling.pl
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Informacje prawne */}
            <div className="relative md:pl-8">
              {/* Kreska rozdzielająca - przed sekcją */}
              <div className="hidden md:block absolute left-0 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-sky-500/30 to-transparent shadow-[0_0_8px_rgba(56,189,248,0.3)]" />
              
              <h3 className="text-base md:text-lg font-bold text-white mb-5 md:mb-6 flex items-center gap-2">
                <FileText className="w-4 h-4 md:w-5 md:h-5 text-sky-400" />
                Informacje prawne
              </h3>
              <div className="space-y-3">
                <Link 
                  href="/polityka-prywatnosci"
                  className="group flex items-start gap-2.5 p-3 rounded-lg bg-slate-900/70 border border-slate-800 hover:border-sky-500/60 hover:bg-slate-900/90 transition-all duration-300"
                >
                  <FileText className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="flex-1">
                    <p className="text-white/90 font-medium mb-0.5 text-sm group-hover:text-sky-300 transition-colors">
                      Polityka prywatności
                    </p>
                    <p className="text-white/60 text-xs leading-relaxed">
                      Przykładowa polityka prywatności dla wersji demo
                    </p>
                  </div>
                </Link>

                <Link 
                  href="/regulaminy"
                  className="group flex items-start gap-2.5 p-3 rounded-lg bg-slate-900/70 border border-slate-800 hover:border-sky-500/60 hover:bg-slate-900/90 transition-all duration-300"
                >
                  <Scroll className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="flex-1">
                    <p className="text-white/90 font-medium mb-0.5 text-sm group-hover:text-sky-300 transition-colors">
                      Regulaminy
                    </p>
                    <p className="text-white/60 text-xs leading-relaxed">
                      Regulaminy usług i obiektu
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Drugi poziom - Copyright */}
        <div className="py-4 md:py-6 text-center text-white/70 text-sm">
          <p>&copy; {new Date().getFullYear()} BowlingHub - Demo Booking Experience. Wszelkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  );
}

