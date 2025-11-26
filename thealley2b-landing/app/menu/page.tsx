'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import { Clock } from 'lucide-react';
import MenuSection from '../components/menu/MenuSection';
import MenuToggle from '../components/menu/MenuToggle';

export default function MenuPage() {
  const [activeSection, setActiveSection] = useState<'menu' | 'napoje'>('menu');
  const menuCategories = [
    {
      name: 'Przystawki',
      items: [
        { name: 'Frytki belgijskie', price: '18 zł', description: 'Z solą morską i sosem' },
        { name: 'Nachos z sosami', price: '22 zł', description: 'Z guacamole, sour cream i salsą' },
        { name: 'Skrzydełka', price: '28 zł', description: '8 sztuk w wybranym sosie' },
      ],
    },
    {
      name: 'Sałatki',
      items: [
        { name: 'Sałatka Cezar', price: '32 zł', description: 'Z kurczakiem i grzankami' },
        { name: 'Sałatka grecka', price: '28 zł', description: 'Z fetą i oliwkami' },
        { name: 'Sałatka z tuńczykiem', price: '30 zł', description: 'Z jajkiem i warzywami' },
      ],
    },
    {
      name: 'Pizza',
      items: [
        { name: 'Margherita', price: '24 zł', description: 'Pomidor, mozzarella, bazylia' },
        { name: 'Pepperoni', price: '32 zł', description: 'Salami pepperoni, ser, oregano' },
        { name: 'Hawajska', price: '30 zł', description: 'Szynka, ananas, ser' },
        { name: 'Capricciosa', price: '36 zł', description: 'Szynka, pieczarki, oliwki, ser' },
      ],
    },
    {
      name: 'Burgery',
      items: [
        { name: 'Classic Burger', price: '35 zł', description: 'Wołowina, sałata, pomidor, cebula' },
        { name: 'BBQ Burger', price: '38 zł', description: 'Wołowina, boczek, cebulka, sos BBQ' },
        { name: 'Chicken Burger', price: '33 zł', description: 'Filet z kurczaka, sałata, majonez' },
      ],
    },
    {
      name: 'Quesadilla',
      items: [
        { name: 'Quesadilla z kurczakiem', price: '28 zł', description: 'Z kurczakiem i warzywami' },
        { name: 'Quesadilla z wołowiną', price: '32 zł', description: 'Z wołowiną i serem' },
      ],
    },
    {
      name: 'Sosy',
      items: [
        { name: 'Sos BBQ', price: '5 zł', description: '' },
        { name: 'Sos czosnkowy', price: '5 zł', description: '' },
        { name: 'Sos pomidorowy', price: '4 zł', description: '' },
        { name: 'Keczup', price: '4 zł', description: '' },
      ],
    },
  ];

  const drinkCategories = [
    {
      name: 'Kawa i herbata',
      items: [
        { name: 'Espresso', price: '8 zł', description: '' },
        { name: 'Cappuccino', price: '12 zł', description: '' },
        { name: 'Latte', price: '14 zł', description: '' },
        { name: 'Herbata czarna', price: '10 zł', description: '' },
        { name: 'Herbata zielona', price: '10 zł', description: '' },
      ],
    },
    {
      name: 'Napoje bezalkoholowe',
      items: [
        { name: 'Cola', price: '8 zł', description: '0.33l' },
        { name: 'Woda gazowana', price: '6 zł', description: '0.5l' },
        { name: 'Sok pomarańczowy', price: '10 zł', description: '0.3l' },
        { name: 'Sok jabłkowy', price: '10 zł', description: '0.3l' },
      ],
    },
    {
      name: 'Oferta piwa',
      items: [
        { name: 'Piwo jasne', price: '12 zł', description: '0.5l' },
        { name: 'Piwo ciemne', price: '12 zł', description: '0.5l' },
        { name: 'Piwo bezalkoholowe', price: '10 zł', description: '0.5l' },
      ],
    },
    {
      name: 'Shoty',
      items: [
        { name: 'Vodka', price: '15 zł', description: '4cl' },
        { name: 'Whiskey', price: '20 zł', description: '4cl' },
        { name: 'Rum', price: '18 zł', description: '4cl' },
      ],
    },
    {
      name: 'Koktajle',
      items: [
        { name: 'Mojito', price: '25 zł', description: '' },
        { name: 'Cosmopolitan', price: '28 zł', description: '' },
        { name: 'Margarita', price: '26 zł', description: '' },
        { name: 'Pina Colada', price: '27 zł', description: '' },
      ],
    },
    {
      name: 'Wina',
      items: [
        { name: 'Wino czerwone', price: '12 zł', description: 'kieliszek' },
        { name: 'Wino białe', price: '12 zł', description: 'kieliszek' },
        { name: 'Wino różowe', price: '12 zł', description: 'kieliszek' },
      ],
    },
    {
      name: 'Butelki',
      items: [
        { name: 'Wino czerwone', price: '80 zł', description: 'butelka' },
        { name: 'Wino białe', price: '80 zł', description: 'butelka' },
        { name: 'Szampan', price: '150 zł', description: 'butelka' },
      ],
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <HeroSection
          title="Menu"
          description="Wybierz coś dla siebie z naszej bogatej oferty"
        />

        {/* Opening Hours */}
        <div className="bg-[#1A1A2E]/80 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-[#2D2D44]/50 mb-8 md:mb-12">
          <div className="flex items-center gap-3 justify-center">
            <Clock className="w-5 h-5 text-[#A78BFA]" />
            <p className="text-white font-semibold">Godziny otwarcia: Pon-Niedz 14:00 - 23:00</p>
          </div>
        </div>

        {/* Menu/Napoje Toggle */}
        <MenuToggle 
          onToggle={setActiveSection} 
          activeSection={activeSection} 
        />

        {/* Menu Section */}
        {activeSection === 'menu' && (
          <MenuSection
            title="Menu"
            categories={menuCategories}
            className="mb-16"
          />
        )}

        {/* Drinks Section */}
        {activeSection === 'napoje' && (
          <MenuSection
            title="Napoje"
            categories={drinkCategories}
            className="mb-16"
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
