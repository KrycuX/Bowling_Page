'use client';

import { useState } from 'react';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';

import { dayjs, WARSAW_TZ } from '../../lib/dayjs';
import { BowlingBookingForm } from '../../components/booking/BowlingBookingForm';

export default function BowlingPage() {
  const [selectedDay] = useState(() => dayjs().tz(WARSAW_TZ).startOf('day'));
  const dateString = selectedDay.format('YYYY-MM-DD');

  return (
    <Container 
      component="main" 
      maxWidth="lg" 
      sx={{ 
        py: { xs: 3, sm: 6 },
        px: { xs: 2, sm: 3 },
        width: '100%',
        maxWidth: { xs: '100%', sm: 'lg' }
      }}
    >
      <Stack spacing={5}>
        <BowlingBookingForm date={dateString} />
      </Stack>
    </Container>
  );
}
