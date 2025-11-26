'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { Dayjs } from 'dayjs';
import { useMemo } from 'react';

export type PlannerGridProps = {
  date: Dayjs;
  openHour: number;
  closeHour: number;
  resources: {
    resourceId: number;
    resourceName: string;
    bookings: Array<{
      from: string;
      to: string;
      status: 'BOOKED' | 'HOLD';
      peopleCount?: number | null;
      orderId?: string | number | null;
    }>;
  }[];
  admin?: boolean;
};

const LABEL_COLUMN_WIDTH = 180;
const ROW_HEIGHT = 48;

export function PlannerGrid({
  date,
  openHour,
  closeHour,
  resources,
  admin = false
}: PlannerGridProps) {
  const totalHours = Math.max(0, closeHour - openHour);
  const totalColumns = Math.max(totalHours, 1);
  const timelineMinWidth = Math.max(totalColumns * 60, 400); // Minimum 60px per hour, 400px total


  const hourLabels = useMemo(() => {
    return Array.from({ length: totalColumns }, (_, index) => openHour + index);
  }, [openHour, totalColumns]);

  const formattedDate = useMemo(() => date.format('D MMMM YYYY'), [date]);

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h6">Plan dnia - {formattedDate}</Typography>
        <Typography variant="body2" color="text.secondary">
          Godziny otwarcia: {formatHour(openHour)} - {formatHour(closeHour)}
        </Typography>
      </Stack>

      <Box sx={{ overflowX: 'auto' }}>
        <Stack spacing={1.5}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `minmax(${LABEL_COLUMN_WIDTH}px, 220px) minmax(${timelineMinWidth}px, 1fr)`,
              alignItems: 'center',
              columnGap: 2,
              minWidth: `${LABEL_COLUMN_WIDTH + timelineMinWidth + 32}px`
            }}
          >
            <Box />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${totalColumns}, 1fr)`
              }}
            >
              {hourLabels.map((hour) => (
                <Typography key={hour} variant="caption" color="text.secondary" align="center">
                  {formatHour(hour)}
                </Typography>
              ))}
            </Box>
          </Box>

          {resources.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Brak zasobów do wyświetlenia.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {resources.map((resource) => (
                <Box
                  key={resource.resourceId}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: `minmax(${LABEL_COLUMN_WIDTH}px, 220px) minmax(${timelineMinWidth}px, 1fr)`,
                    columnGap: 2,
                    alignItems: 'center',
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.5),
                    minWidth: `${LABEL_COLUMN_WIDTH + timelineMinWidth + 32}px`,
                    '&:hover': {
                      backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.8),
                      borderColor: 'primary.main'
                    },
                    transition: 'all 0.2s ease',
                    '@media (max-width: 768px)': {
                      gridTemplateColumns: '1fr',
                      gap: 1,
                      minWidth: 'auto'
                    }
                  }}
                >
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 600,
                      color: 'primary.main',
                      textAlign: { xs: 'center', md: 'left' }
                    }}
                  >
                    {resource.resourceName}
                  </Typography>
                  <Timeline
                    resourceName={resource.resourceName}
                    bookings={resource.bookings}
                    admin={admin}
                    openHour={openHour}
                    closeHour={closeHour}
                    totalColumns={totalColumns}
                  />
                </Box>
              ))}
            </Stack>
          )}
        </Stack>
      </Box>

      <Stack direction="row" spacing={2}>
        <LegendItem color="success.light" label="Zarezerwowane" />
        <LegendItem color="warning.light" label="Rezerwacja tymczasowa" />
      </Stack>
    </Stack>
  );
}

type TimelineProps = {
  resourceName: string;
  bookings: PlannerGridProps['resources'][number]['bookings'];
  openHour: number;
  closeHour: number;
  admin: boolean;
  totalColumns: number;
};

function Timeline({
  resourceName,
  bookings,
  openHour,
  closeHour,
  admin,
  totalColumns
}: TimelineProps) {
  const openMinutes = openHour * 60;
  const closeMinutes = closeHour * 60;

  return (
    <Box
      sx={{
        position: 'relative',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        minHeight: ROW_HEIGHT,
        backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.84),
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          gridTemplateColumns: `repeat(${totalColumns}, 1fr)`,
          pointerEvents: 'none'
        }}
      >
        {Array.from({ length: totalColumns }).map((_, index) => (
          <Box
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            component="span"
            sx={{
              borderLeft: '1px solid',
              borderColor: 'divider',
              '&:last-of-type': {
                borderRight: '1px solid',
                borderColor: 'divider'
              }
            }}
          />
        ))}
      </Box>

      {bookings.map((booking, index) => {
        const segment = clampBookingToDay(booking.from, booking.to, openMinutes, closeMinutes);
        if (!segment) {
          return null;
        }

        const offsetMinutes = segment.start - openMinutes;
        const durationMinutes = segment.end - segment.start;
        
        // Calculate position based on grid columns instead of percentages
        const startHour = Math.floor(offsetMinutes / 60);
        const startMinute = offsetMinutes % 60;
        const endHour = Math.floor((offsetMinutes + durationMinutes) / 60);
        const endMinute = (offsetMinutes + durationMinutes) % 60;
        
        // Position within the grid: each hour is 1fr, so we need to calculate sub-hour positioning
        const startColumn = startHour + (startMinute / 60);
        const endColumn = endHour + (endMinute / 60);
        
        const left = `${(startColumn / totalColumns) * 100}%`;
        const width = `${((endColumn - startColumn) / totalColumns) * 100}%`;
        
        
        const label = buildBookingLabel(booking, admin);
        const tooltip = buildTooltipContent({ booking, resourceName, admin });


        return (
          <Tooltip key={`${booking.from}-${booking.to}-${index}`} title={tooltip} placement="top">
            <Box
              sx={{
                position: 'absolute',
                top: 6,
                left,
                width,
                minWidth: 32,
                transform: 'translateX(2px)',
                paddingX: 1,
                paddingY: 0.5,
                borderRadius: 1,
                border: '1px solid',
                borderColor:
                  booking.status === 'BOOKED' ? 'success.main' : (theme) => theme.palette.warning.main,
                backgroundColor:
                  booking.status === 'BOOKED'
                    ? 'success.light'
                    : (theme) => alpha(theme.palette.warning.light, 0.9),
                color: 'text.primary',
                fontSize: 12,
                fontWeight: 600,
                textAlign: 'center',
                pointerEvents: 'auto',
                cursor: 'default',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
              }}
            >
              {label}
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: 0.75,
          backgroundColor: color,
          border: '1px solid',
          borderColor: color
        }}
      />
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

function clampBookingToDay(from: string, to: string, dayStart: number, dayEnd: number) {
  const startMinutes = timeStringToMinutes(from);
  const endMinutes = timeStringToMinutes(to);

  if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes) || endMinutes <= startMinutes) {
    return null;
  }

  const start = Math.max(startMinutes, dayStart);
  const end = Math.min(endMinutes, dayEnd);

  if (end <= start) {
    return null;
  }

  return { start, end };
}

function buildBookingLabel(
  booking: PlannerGridProps['resources'][number]['bookings'][number],
  admin: boolean
) {
  const parts = [`${booking.from}-${booking.to}`];

  if (booking.peopleCount != null && booking.peopleCount > 0) {
    parts.push(`(${booking.peopleCount} os.)`);
  }

  if (admin && booking.orderId) {
    parts.push(`#${booking.orderId}`);
  }

  return parts.join(' ');
}

function buildTooltipContent({
  booking,
  resourceName,
  admin
}: {
  booking: PlannerGridProps['resources'][number]['bookings'][number];
  resourceName: string;
  admin: boolean;
}) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="subtitle2">{resourceName}</Typography>
      <Typography variant="body2" color="text.secondary">
        Status: {booking.status === 'BOOKED' ? 'Zarezerwowane' : 'Rezerwacja tymczasowa'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Godziny: {booking.from} - {booking.to}
      </Typography>
      {booking.peopleCount != null && booking.peopleCount > 0 && (
        <Typography variant="body2" color="text.secondary">
          Liczba osob: {booking.peopleCount}
        </Typography>
      )}
      {admin && booking.orderId && (
        <Typography variant="body2" color="text.secondary">
          Zamowienie: #{booking.orderId}
        </Typography>
      )}
    </Stack>
  );
}

function timeStringToMinutes(time: string) {
  const [hoursRaw, minutesRaw] = time.split(':');
  const hours = Number.parseInt(hoursRaw ?? '', 10);
  const minutes = Number.parseInt(minutesRaw ?? '', 10);
  
  // Validate that we have valid numbers
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return Number.NaN;
  }
  
  // Validate time ranges
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return Number.NaN;
  }
  
  return hours * 60 + minutes;
}

function formatHour(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`;
}
