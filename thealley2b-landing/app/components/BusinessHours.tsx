'use client';

import { useEffect, useState } from 'react';

type WeeklyHours = {
  monday: { openHour: number; closeHour: number; closed: boolean };
  tuesday: { openHour: number; closeHour: number; closed: boolean };
  wednesday: { openHour: number; closeHour: number; closed: boolean };
  thursday: { openHour: number; closeHour: number; closed: boolean };
  friday: { openHour: number; closeHour: number; closed: boolean };
  saturday: { openHour: number; closeHour: number; closed: boolean };
  sunday: { openHour: number; closeHour: number; closed: boolean };
};

type BusinessHoursResponse = {
  weekly: WeeklyHours | null;
  dayOffs: Array<{ date: string; reason: string | null }>;
  todayStatus: {
    isOpen: boolean;
    openHour: number | null;
    closeHour: number | null;
    isDayOff: boolean;
  };
};

const DAY_NAMES = [
  { key: 'monday' as const, label: 'Poniedziałek' },
  { key: 'tuesday' as const, label: 'Wtorek' },
  { key: 'wednesday' as const, label: 'Środa' },
  { key: 'thursday' as const, label: 'Czwartek' },
  { key: 'friday' as const, label: 'Piątek' },
  { key: 'saturday' as const, label: 'Sobota' },
  { key: 'sunday' as const, label: 'Niedziela' },
];

export default function BusinessHours() {
  const [data, setData] = useState<BusinessHoursResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessHours = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_BOOKING_API_URL || 'https://api.thealley2b.pl';
        const response = await fetch(`${apiUrl}/business-hours`);
        if (response.ok) {
          const json = await response.json();
          setData(json);
        }
      } catch (error) {
        console.error('Failed to fetch business hours:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessHours();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2 text-sm">
        <div className="text-white/70">Ładowanie godzin otwarcia...</div>
      </div>
    );
  }

  if (!data?.weekly) {
    return (
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center py-1.5 border-b border-[#2D2D44]/50">
          <span className="text-white/90 font-medium">Poniedziałek - Niedziela</span>
          <span className="text-white/70">10:00 - 22:00</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 text-sm">
      {DAY_NAMES.map(({ key, label }) => {
        const dayHours = data.weekly![key];
        const hours = dayHours.closed
          ? 'Zamknięte'
          : `${dayHours.openHour.toString().padStart(2, '0')}:00 - ${dayHours.closeHour.toString().padStart(2, '0')}:00`;
        
        return (
          <div
            key={key}
            className="flex justify-between items-center py-1.5 border-b border-[#2D2D44]/50 last:border-0"
          >
            <span className="text-white/90 font-medium">{label}</span>
            <span className={dayHours.closed ? 'text-red-400' : 'text-white/70'}>
              {hours}
            </span>
          </div>
        );
      })}
    </div>
  );
}
