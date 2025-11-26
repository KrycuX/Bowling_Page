'use client';

import Box from '@mui/material/Box';
import type { Dayjs } from 'dayjs';
import { useState, useEffect } from 'react';
import 'dayjs/locale/pl';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { dayjs, WARSAW_TZ } from '../../../lib/dayjs';

type CalendarInlineProps = {
  value: Dayjs;
  onChange: (day: Dayjs) => void;
};

export function CalendarInline({ value, onChange }: CalendarInlineProps) {
  const [today, setToday] = useState<Dayjs | null>(null);

  useEffect(() => {
    setToday(dayjs().tz(WARSAW_TZ).startOf('day'));
  }, []);

  if (!today) {
    return null;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pl">
      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', md: 360 },
          mx: 'auto',
          '& .MuiPickersDay-root.Mui-selected': {
            fontWeight: 600
          }
        }}
      >
        <DateCalendar
          value={value}
          onChange={(newValue) => {
            if (!newValue) {
              return;
            }
            onChange(newValue.tz(WARSAW_TZ).startOf('day'));
          }}
          minDate={today}
          disablePast
          shouldDisableDate={(date) => {
            if (!date) {
              return false;
            }
            return date.tz(WARSAW_TZ).startOf('day').isBefore(today);
          }}
          views={['day']}
          slotProps={{
            leftArrowIcon: { fontSize: 'small' },
            rightArrowIcon: { fontSize: 'small' }
          }}
          sx={{
            width: '100%',
            '& .MuiDayCalendar-weekDayLabel': { fontWeight: 500 },
            '& .MuiDayCalendar-header': { px: 1 },
            '& .MuiDayCalendar-monthContainer': { px: 1 }
          }}
        />
      </Box>
    </LocalizationProvider>
  );
}
