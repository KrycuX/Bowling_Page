'use client';

import { useMemo } from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

import { formatTimeRange } from '../lib/availability';
import { calculatePrice, formatPrice } from '../lib/pricing';
import { usePublicSettings } from '../hooks/usePublicSettings';
import type { Resource } from '../lib/types';

type Props = {
  resources: Resource[];
  date: Date | null;
  startTime: string | '';
  durationHours: number;
};

export function SummaryCard({ resources, date, startTime, durationHours }: Props) {
  const { data: publicSettings } = usePublicSettings();
  const pricingOverrides = useMemo(() => {
    if (!publicSettings) {
      return undefined;
    }
    return {
      priceBowlingPerHour: publicSettings.priceBowlingPerHour,
      priceBilliardsPerHour: publicSettings.priceBilliardsPerHour,
      priceKaraokePerPersonPerHour: publicSettings.priceKaraokePerPersonPerHour,
      priceQuizPerPersonPerSession: publicSettings.priceQuizPerPersonPerSession,
      bowlingMinDurationHours: publicSettings.bowlingMinDurationHours,
      bowlingMaxDurationHours: publicSettings.bowlingMaxDurationHours,
      quizDurationHours: publicSettings.quizDurationHours,
      karaokeMinDurationHours: publicSettings.karaokeMinDurationHours,
      karaokeMaxDurationHours: publicSettings.karaokeMaxDurationHours,
      quizMaxPeople: publicSettings.quizMaxPeople,
      karaokeMaxPeople: publicSettings.karaokeMaxPeople
    };
  }, [publicSettings]);

  if (resources.length === 0 || !date || !startTime) {
    return null;
  }

  const formattedDate = format(date, 'EEEE, d MMMM yyyy', { locale: pl });
  const totalAmount = resources.reduce(
    (sum, resource) => sum + calculatePrice(resource, durationHours, undefined, pricingOverrides),
    0
  );

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="h6">Podsumowanie</Typography>
          <Stack spacing={0.5}>
            {resources.map((resource) => (
              <Typography key={resource.id} fontWeight={600}>
                {resource.name}
              </Typography>
            ))}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {formattedDate}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatTimeRange(startTime, durationHours)}
          </Typography>
          <Divider />
          <Typography variant="h5">{formatPrice(totalAmount)}</Typography>
          <Typography variant="caption" color="text.secondary">
            Płatność dostępna online przy składaniu zamówienia lub na miejscu przy kasie.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
