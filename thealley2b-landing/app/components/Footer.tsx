import Link from 'next/link';
import { FileText, Scroll, Clock, MapPin, Phone, Mail } from 'lucide-react';
import BusinessHours from './BusinessHours';

export default function Footer() {
  return (
    <footer className="bg-[#1A1A2E]/50 backdrop-blur-sm border-t border-[#2D2D44]/50 mt-16 w-full relative z-10">
      {/* Border z poświatą na górze */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent shadow-[0_0_8px_rgba(139,92,246,0.3)]" />
      <div className="container mx-auto w-full px-4 sm:px-6 lg:px-8">
        {/* Pierwszy poziom - 3 sekcje */}
        <div className="py-6 md:py-8 border-b border-[#2D2D44]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 md:gap-12">
            {/* Godziny otwarcia */}
            <div className="relative">
              <h3 className="text-base md:text-lg font-bold text-white mb-5 md:mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-[#8B5CF6]" />
                Godziny otwarcia
              </h3>
              <BusinessHours />
            </div>

            {/* Dane kontaktowe */}
            <div className="relative md:pl-8">
              {/* Kreska rozdzielająca - przed sekcją */}
              <div className="hidden md:block absolute left-0 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-[#8B5CF6]/30 to-transparent shadow-[0_0_8px_rgba(139,92,246,0.3)]" />
              
              <h3 className="text-base md:text-lg font-bold text-white mb-5 md:mb-6 flex items-center gap-2">
                <Phone className="w-4 h-4 md:w-5 md:h-5 text-[#8B5CF6]" />
                Dane kontaktowe
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#8B5CF6] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white/90 font-medium mb-0.5">Adres</p>
                    <p className="text-white/70 text-xs leading-relaxed">
                      ul. Przykładowa 123<br />
                      00-000 Warszawa
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-[#8B5CF6] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white/90 font-medium mb-0.5">Telefon</p>
                    <a href="tel:+48123456789" className="text-white/70 hover:text-[#A78BFA] transition-colors text-xs">
                      +48 123 456 789
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-[#8B5CF6] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white/90 font-medium mb-0.5">Email</p>
                    <a href="mailto:kontakt@thealley2b.pl" className="text-white/70 hover:text-[#A78BFA] transition-colors text-xs break-all">
                      kontakt@thealley2b.pl
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Informacje prawne */}
            <div className="relative md:pl-8">
              {/* Kreska rozdzielająca - przed sekcją */}
              <div className="hidden md:block absolute left-0 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-[#8B5CF6]/30 to-transparent shadow-[0_0_8px_rgba(139,92,246,0.3)]" />
              
              <h3 className="text-base md:text-lg font-bold text-white mb-5 md:mb-6 flex items-center gap-2">
                <FileText className="w-4 h-4 md:w-5 md:h-5 text-[#8B5CF6]" />
                Informacje prawne
              </h3>
              <div className="space-y-3">
                <Link 
                  href="/polityka-prywatnosci"
                  className="group flex items-start gap-2.5 p-3 rounded-lg bg-[#1A1A2E]/60 border border-[#2D2D44] hover:border-[#8B5CF6]/50 hover:bg-[#2D2D44]/30 transition-all duration-300"
                >
                  <FileText className="w-4 h-4 text-[#8B5CF6] mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="flex-1">
                    <p className="text-white/90 font-medium mb-0.5 text-sm group-hover:text-[#A78BFA] transition-colors">
                      Polityka prywatności
                    </p>
                    <p className="text-white/60 text-xs leading-relaxed">
                      Polityka prywatności i ochrony danych
                    </p>
                  </div>
                </Link>

                <Link 
                  href="/regulaminy"
                  className="group flex items-start gap-2.5 p-3 rounded-lg bg-[#1A1A2E]/60 border border-[#2D2D44] hover:border-[#8B5CF6]/50 hover:bg-[#2D2D44]/30 transition-all duration-300"
                >
                  <Scroll className="w-4 h-4 text-[#8B5CF6] mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="flex-1">
                    <p className="text-white/90 font-medium mb-0.5 text-sm group-hover:text-[#A78BFA] transition-colors">
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
          <p>&copy; {new Date().getFullYear()} TheAlley2B - Premium Entertainment Hub. Wszelkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  );
}

