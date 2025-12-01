'use client';
import { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { gsap, ScrollTrigger } from '@/lib/gsap-config';

export default function LocationSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !titleRef.current || !cardRef.current) return;

    // Animacja dla tytułu
    gsap.from(titleRef.current, {
      opacity: 0,
      x: -30,
      duration: 0.6,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    // Animacja dla karty z mapą
    gsap.from(cardRef.current, {
      opacity: 0,
      y: 40,
      scale: 0.95,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: cardRef.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === sectionRef.current || trigger.vars.trigger === cardRef.current) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <section ref={sectionRef} className="mb-12 md:mb-16">
      <h2
        ref={titleRef}
        className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-2"
      >
        <MapPin className="w-6 h-6 text-sky-400" />
        Lokalizacja (przykładowa)
      </h2>
      <Card ref={cardRef}>
        <CardContent className="p-6 md:p-8">
          <div className="aspect-video w-full bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-xl mb-4 flex items-center justify-center border border-slate-800">
            <p className="text-white/70">
              Mapa demonstracyjna – w docelowym projekcie wstaw mapę Google / innego dostawcy.
            </p>
          </div>
          <p className="text-white/90">
            Użyj mapy powyżej, aby znaleźć lokalizację swojego obiektu lub sprawdź dane adresowe
            w sekcji kontaktowej.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

