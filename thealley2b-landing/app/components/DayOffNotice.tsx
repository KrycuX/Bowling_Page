'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

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

export default function DayOffNotice() {
  const [todayStatus, setTodayStatus] = useState<BusinessHoursResponse['todayStatus'] | null>(null);
  const [dayOffReason, setDayOffReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessHours = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_BOOKING_API_URL || 'https://api.thealley2b.pl';
        const response = await fetch(`${apiUrl}/business-hours`);
        if (response.ok) {
          const json: BusinessHoursResponse = await response.json();
          setTodayStatus(json.todayStatus);
          
          // Find today's day off reason if exists
          const today = new Date().toISOString().split('T')[0];
          const todayDayOff = json.dayOffs.find(d => d.date === today);
          if (todayDayOff) {
            setDayOffReason(todayDayOff.reason);
          }
        }
      } catch (error) {
        console.error('Failed to fetch business hours:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessHours();
  }, []);

  if (loading || !todayStatus || !todayStatus.isDayOff) {
    return null;
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="w-full bg-gradient-to-r from-red-600/90 to-orange-600/90 border-b-2 border-red-500/50 shadow-lg">
      <div className="container mx-auto w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-3 text-white">
          <AlertTriangle className="w-6 h-6 md:w-7 md:h-7 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-base md:text-lg mb-1">
              Uwaga! Dziś ({dateStr}) jesteśmy nieczynni.
            </p>
            {dayOffReason && (
              <p className="text-sm md:text-base text-white/90">
                Powód: {dayOffReason}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
