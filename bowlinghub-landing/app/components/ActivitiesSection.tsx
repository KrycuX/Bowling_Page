'use client';
import { useEffect, useRef } from 'react';
import { Circle, Target, Music, Brain } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import Button from './ui/Button';
import { gsap, ScrollTrigger } from '@/lib/gsap-config';

const activities = [
  {
    id: 'kregle',
    icon: Circle,
    title: 'Kregle',
    description: 'Rezerwacja jednego lub kilku torów od 1 godziny w górę (jeden slot = 1 godzina). Idealne dla grup przyjaciół i rodzinnych spotkań.',
    link: 'https://rezerwacje.twoja-kręgielnia.pl/kregle',
  },
  {
    id: 'bilard',
    icon: Target,
    title: 'Bilard',
    description: 'Stoły bilardowe rezerwowane od 1 godziny w górę (jeden slot = 1 godzina). Wybierz ile stołów potrzebujesz dla swojej rozgrywki.',
    link: 'https://rezerwacje.twoja-kręgielnia.pl/bilard',
  },
  {
    id: 'quiz',
    icon: Brain,
    title: 'Quiz Room',
    description: 'Pokój quizowy na 60 minut. Cena zależy od liczby uczestników (do 8 osób). Sprawdź swoją wiedzę!',
    link: 'https://rezerwacje.twoja-kręgielnia.pl/quiz',
  },
  {
    id: 'karaoke',
    icon: Music,
    title: 'Karaoke Room',
    description: 'Kameralny pokój karaoke na 1-4 godziny, maksymalnie 10 uczestników. Śpiewaj swoje ulubione hity!',
    link: 'https://rezerwacje.twoja-kręgielnia.pl/karaoke',
  },
];

export default function ActivitiesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current || !titleRef.current || !cardsRef.current) return;

    // Animacja dla tytułu sekcji
    gsap.from(titleRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    // Stagger animation dla kart
    const cards = cardRefs.current.filter(Boolean);
    if (cards.length > 0) {
      gsap.from(cards, {
        opacity: 0,
        y: 50,
        scale: 0.9,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: cardsRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }

    // Hover effects dla kart
    const cleanupFunctions: Array<() => void> = [];
    cards.forEach((card) => {
      if (!card) return;

      const handleMouseEnter = () => {
        gsap.to(card, {
          scale: 1.05,
          y: -8,
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      const handleMouseLeave = () => {
        gsap.to(card, {
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      card.addEventListener('mouseenter', handleMouseEnter);
      card.addEventListener('mouseleave', handleMouseLeave);

      cleanupFunctions.push(() => {
        card.removeEventListener('mouseenter', handleMouseEnter);
        card.removeEventListener('mouseleave', handleMouseLeave);
      });
    });

    return () => {
      // Cleanup event listeners
      cleanupFunctions.forEach((cleanup) => cleanup());
      
      // Cleanup ScrollTriggers
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === sectionRef.current || trigger.vars.trigger === cardsRef.current) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <section ref={sectionRef} className="mb-12 md:mb-16">
      <h2
        ref={titleRef}
        className="text-2xl md:text-3xl font-bold text-white mb-6 text-center"
      >
        Nasze aktywności
      </h2>
      <div
        ref={cardsRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <Card
              key={activity.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              variant="hover"
              className="group h-full flex flex-col cursor-pointer"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-lg">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="group-hover:text-sky-300 transition-colors duration-200">
                    {activity.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <p className="text-white/70 mb-4 flex-grow">
                  {activity.description}
                </p>
                <Link
                  href={activity.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="default"
                    className="w-full group-hover:bg-sky-400 transition-colors"
                  >
                    Rezerwuj
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

