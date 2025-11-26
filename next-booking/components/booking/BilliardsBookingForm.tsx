'use client';

import { EnhancedBookingForm } from './EnhancedBookingForm';

type BilliardsBookingFormProps = {
  date: string;
};

export function BilliardsBookingForm({ date }: BilliardsBookingFormProps) {
  return (
    <EnhancedBookingForm
      date={date}
      resourceType="BILLIARDS_TABLE"
      title="Bilard"
      description="Zarezerwuj stół bilardowy i ciesz się grą z przyjaciółmi"
    />
  );
}