'use client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Rejestracja pluginów GSAP
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  // Globalne ustawienia GSAP
  gsap.config({
    nullTargetWarn: false,
  });
}

export { gsap, ScrollTrigger };

