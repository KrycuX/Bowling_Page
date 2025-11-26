'use client';

import { EnhancedBookingForm } from './EnhancedBookingForm';

type KaraokeBookingFormProps = {
  date: string;
};

export function KaraokeBookingForm({ date }: KaraokeBookingFormProps) {
  return (
    <EnhancedBookingForm
      date={date}
      resourceType="KARAOKE_ROOM"
      title="Karaoke"
      description="Zarezerwuj pokój karaoke i śpiewaj swoje ulubione piosenki"
    />
  );
}