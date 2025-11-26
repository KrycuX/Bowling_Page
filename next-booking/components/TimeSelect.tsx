'use client';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { formatTimeRange } from '../lib/availability';

type Props = {
  times: string[];
  value: string | '';
  onChange: (time: string) => void;
  durationHours: number;
  disabled?: boolean;
};

export function TimeSelect({ times, value, onChange, durationHours, disabled }: Props) {
  return (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel id="time-select-label">Godzina startu</InputLabel>
      <Select
        labelId="time-select-label"
        label="Godzina startu"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {times.length === 0 && (
          <MenuItem disabled value="">
            Brak wolnych terminow
          </MenuItem>
        )}
        {times.map((time) => (
          <MenuItem key={time} value={time}>
            <Stack direction="row" justifyContent="space-between" width="100%">
              <Typography>{formatTimeRange(time, durationHours)}</Typography>
            </Stack>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
