'use client';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';

type Props = {
  value: Date | null;
  onChange: (value: Date | null) => void;
  minDate?: Date;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
};

export function DatePickerField({ value, onChange, minDate, disabled, error, helperText }: Props) {
  return (
    <DatePicker
      label="Data rezerwacji"
      value={value}
      onChange={onChange}
      disablePast
      minDate={minDate}
      disabled={disabled}
      slotProps={{ textField: { fullWidth: true, error, helperText } }}
    />
  );
}
