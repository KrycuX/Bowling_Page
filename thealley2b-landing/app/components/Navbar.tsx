'use client';

import { useEffect, useState } from 'react';
import NavbarNormal from './navbar/NavbarNormal';
import NavbarCompact from './navbar/NavbarCompact';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Jeśli przewinęliśmy więcej niż 100px, normal navbar zniknął z widoku
      // Wtedy pokaż compact navbar i trzymaj go widocznym cały czas
      if (currentScrollY > 100) {
        setIsScrolled(true);
      } else {
        // Na górze strony - pokaż normal navbar, ukryj compact navbar
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <NavbarNormal isHidden={isScrolled} />
      <NavbarCompact isVisible={isScrolled} />
    </>
  );
}
