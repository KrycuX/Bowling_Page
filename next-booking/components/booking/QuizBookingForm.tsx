'use client';

import { EnhancedBookingForm } from './EnhancedBookingForm';

type QuizBookingFormProps = {
  date: string;
};

export function QuizBookingForm({ date }: QuizBookingFormProps) {
  return (
    <EnhancedBookingForm
      date={date}
      resourceType="QUIZ_ROOM"
      title="Quiz"
      description="Zarezerwuj pokój quiz i sprawdź swoją wiedzę z przyjaciółmi"
    />
  );
}