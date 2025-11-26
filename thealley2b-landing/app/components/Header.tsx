'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Gift, Images, Mail, Instagram, Facebook } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/menu', label: 'Menu', icon: null },
    { href: '/rezerwacje', label: 'Rezerwacje', icon: Calendar },
    { href: '/event', label: 'Event', icon: null },
    { href: '/promocje', label: 'Promocje', icon: Gift },
    { href: '/galeria', label: 'Galeria', icon: Images },
    { href: '/kontakt', label: 'Kontakt', icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#1A1A2E]/95 backdrop-blur-md border-b border-[#2D2D44] shadow-lg">
      <div className="container mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 group transition-all hover:scale-105"
          >
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-[#A78BFA] rounded-full"></div>
              <div className="w-3 h-3 bg-[#8B5CF6] rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-[#A78BFA] rounded-full"></div>
            </div>
            <span className="text-white font-bold text-xl md:text-2xl group-hover:text-[#A78BFA] transition-colors duration-200">
              TheAlley2B
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:ring-offset-2 focus:ring-offset-[#1A1A2E]',
                    isActive
                      ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/50'
                      : 'text-white/90 hover:bg-[#2D2D44] hover:text-white hover:shadow-md'
                  )}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/90 hover:text-[#A78BFA] transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] rounded-full p-1"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/90 hover:text-[#A78BFA] transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] rounded-full p-1"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] rounded p-1"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="lg:hidden pb-4 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200',
                    isActive
                      ? 'bg-[#8B5CF6] text-white shadow-md'
                      : 'text-white/90 hover:bg-[#2D2D44] hover:text-white'
                  )}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
