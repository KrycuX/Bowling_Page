'use client';

import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { Resource } from '../lib/types';

type Props = {
  resources: Resource[];
  selectedResourceIds: number[];
};

const STATUS_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  AVAILABLE: 'success',
  HOLD: 'warning',
  BOOKED: 'error'
};

export function AvailabilityPlanner({ resources, selectedResourceIds }: Props) {
  if (resources.length === 0) {
    return null;
  }

  return (
    <Stack spacing={2}>
      {resources.map((resource) => {
        const isSelected = selectedResourceIds.includes(resource.id);

        return (
          <Paper
            key={resource.id}
            variant={isSelected ? 'elevation' : 'outlined'}
            elevation={isSelected ? 2 : 0}
            sx={{ p: 2, borderColor: isSelected ? 'primary.main' : undefined }}
          >
            <Stack spacing={1}>
              <Typography fontWeight={600}>{resource.name}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {resource.slots.map((slot, index) => (
                  <Chip
                    key={`${resource.id}-${index}`}
                    label={`${slot.startTime} - ${slot.endTime}`}
                    color={STATUS_COLOR[slot.status] ?? 'default'}
                    variant={slot.status === 'AVAILABLE' ? 'outlined' : 'filled'}
                    size="small"
                  />
                ))}
              </Stack>
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
}
