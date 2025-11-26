'use client';

import { EnhancedBookingForm } from './EnhancedBookingForm';

type BowlingBookingFormProps = {
  date: string;
};

export function BowlingBookingForm({ date }: BowlingBookingFormProps) {
  return (
    <EnhancedBookingForm
      date={date}
      resourceType="BOWLING_LANE"
      title="Kręgle"
      description="Zarezerwuj tor do kręgli i baw się świetnie z rodziną i przyjaciółmi"
    />
  );
}