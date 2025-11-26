'use client';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

type Props = {
  value: number;
  options: number[];
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function DurationSelect({ value, options, onChange, disabled }: Props) {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(_event, newValue) => {
        if (newValue !== null) {
          onChange(newValue);
        }
      }}
      fullWidth
      size="small"
      color="primary"
      disabled={disabled}
    >
      {options.map((option) => (
        <ToggleButton key={option} value={option}>
          {option} h
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
