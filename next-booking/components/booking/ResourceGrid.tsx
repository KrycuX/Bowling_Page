'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useEffect, useRef } from 'react';
import { dayjs, WARSAW_TZ } from '../../lib/dayjs';

type ResourceGridProps = {
  resources: Array<{
    id: number;
    name: string;
    slots: Array<{
      startTime: string;
      endTime: string;
      status: 'AVAILABLE' | 'HOLD' | 'BOOKED';
    }>;
  }>;
  openHour: number;
  closeHour: number;
  selectedResourceIds: number[];
  onResourceClick: (resourceId: number) => void;
  selectedSlots: Set<string>; // Set of "resourceId:hour" strings
  onSlotClick: (resourceId: number, hour: number) => void;
  selectedDate: string; // YYYY-MM-DD format
};

export function ResourceGrid({
  resources,
  openHour,
  closeHour,
  selectedResourceIds,
  selectedSlots,
  onResourceClick,
  onSlotClick,
  selectedDate
}: ResourceGridProps) {
  const totalHours = closeHour - openHour;
  const hourLabels = useMemo(() => {
    return Array.from({ length: totalHours }, (_, index) => openHour + index);
  }, [openHour, totalHours]);

  const getSlotKey = (resourceId: number, hour: number) => `${resourceId}:${hour}`;

  const isSlotInPast = (hour: number) => {
    if (!selectedDate) return false;
    const slotDateTime = dayjs.tz(`${selectedDate} ${hour}:00`, WARSAW_TZ);
    const now = dayjs().tz(WARSAW_TZ);
    return slotDateTime.isBefore(now);
  };

  const isSlotAvailable = (resourceId: number, hour: number, slots: ResourceGridProps['resources'][number]['slots']) => {
    const start = `${hour}:00`;
    const end = `${hour + 1}:00`;
    
    // Check if there's an AVAILABLE slot that covers this hour
    return slots.some(slot => {
      if (slot.status !== 'AVAILABLE') return false;
      return slot.startTime <= start && slot.endTime >= end;
    });
  };

  const isSlotSelected = (resourceId: number, hour: number) => {
    return selectedSlots.has(getSlotKey(resourceId, hour));
  };

  const isSlotBooked = (resourceId: number, hour: number, slots: ResourceGridProps['resources'][number]['slots']) => {
    const start = `${hour}:00`;
    const end = `${hour + 1}:00`;
    
    // Check if there's any BOOKED or HOLD slot in this hour
    return slots.some(slot => {
      if (slot.status === 'BOOKED') return slot.startTime < end && slot.endTime > start;
      if (slot.status === 'HOLD') return slot.startTime < end && slot.endTime > start;
      return false;
    });
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure scroll starts at the beginning (lane 1) on mobile
    if (scrollContainerRef.current && window.innerWidth < 960) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [resources]);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2}>
        <LegendItem color="#4CAF50" label="Dostępne" />
        <LegendItem color="#9E9E9E" label="Zajęte" />
        <LegendItem color="#E91E63" label="Wybrane" />
      </Stack>

      <Box 
        ref={scrollContainerRef}
        sx={{ 
          overflowX: 'auto',
          overflowY: 'hidden',
          width: '100%',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': {
            height: 8,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#1A1A2E',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#4A4A6A',
            borderRadius: 4,
            '&:hover': {
              backgroundColor: '#5A5A7A',
            }
          }
        }}
      >
        <Box sx={{ minWidth: 'fit-content', display: 'inline-block' }}>
          <Stack spacing={2}>
            {/* Hour labels row */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: `auto repeat(${totalHours}, minmax(60px, 80px))`,
                gap: 1,
                minWidth: 'fit-content',
                px: 1,
                alignItems: 'stretch'
              }}
            >
              {/* Empty cell for resource name column */}
              <Box sx={{ minWidth: { xs: 80, md: 120 } }} />
              
              {hourLabels.map((hour) => (
                <Box
                  key={hour}
                  sx={{
                    p: 1,
                    textAlign: 'center',
                    border: '1px solid #2D2D44',
                    borderRadius: 1,
                    backgroundColor: '#1A1A2E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#FFFFFF',
                      fontSize: { xs: '0.75rem', md: '0.8rem' }
                    }}
                  >
                    {formatHour(hour)}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Resource rows */}
            {resources.map((resource) => (
              <Box
                key={resource.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: `auto repeat(${totalHours}, minmax(60px, 80px))`,
                  gap: 1,
                  minWidth: 'fit-content',
                  px: 1,
                  alignItems: 'center'
                }}
              >
                {/* Resource name in first column */}
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    onResourceClick(resource.id);
                  }}
                  sx={{
                    p: { xs: 2, md: 3 },
                    border: '1px solid',
                    borderColor: selectedResourceIds.includes(resource.id) ? '#8B5CF6' : '#2D2D44',
                    borderRadius: 2,
                    backgroundColor: selectedResourceIds.includes(resource.id) ? 'rgba(139, 92, 246, 0.1)' : '#1A1A2E',
                    transition: 'all 0.2s ease',
                    minWidth: { xs: 80, md: 120 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: '#8B5CF6',
                      backgroundColor: 'rgba(139, 92, 246, 0.05)'
                    }
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 600,
                      color: selectedResourceIds.includes(resource.id) ? '#8B5CF6' : '#FFFFFF',
                      textAlign: 'center',
                      fontSize: { xs: '0.85rem', md: '0.8rem' }
                    }}
                  >
                    {resource.name}
                  </Typography>
                </Box>

                {/* Time slots going horizontally */}
                {hourLabels.map((hour) => {
                  const isAvailable = isSlotAvailable(resource.id, hour, resource.slots);
                  const isSelected = isSlotSelected(resource.id, hour);
                  const isBooked = isSlotBooked(resource.id, hour, resource.slots);
                  const inPast = isSlotInPast(hour);
                  const isClickable = isAvailable && !isBooked && !inPast;

                  let backgroundColor = '#2D2D44';
                  let borderColor = '#4A4A6A';
                  let cursor = 'default';

                  if (isSelected) {
                    backgroundColor = '#E91E63';
                    borderColor = '#E91E63';
                    cursor = 'pointer';
                  } else if (isBooked || !isAvailable || inPast) {
                    backgroundColor = '#9E9E9E';
                    borderColor = '#9E9E9E';
                  } else if (isClickable) {
                    backgroundColor = '#4CAF50';
                    borderColor = '#4CAF50';
                    cursor = 'pointer';
                  }

                  return (
                    <Box
                      key={hour}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isClickable || isSelected) {
                          onSlotClick(resource.id, hour);
                        }
                      }}
                      sx={{
                        width: '100%',
                        aspectRatio: '1',
                        minHeight: { xs: '45px', md: '60px' },
                        border: '2px solid',
                        borderColor,
                        borderRadius: 1,
                        backgroundColor,
                        cursor,
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': isClickable || isSelected ? {
                          transform: 'scale(1.05)',
                          boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
                        } : {}
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: isSelected ? '#FFFFFF' : isBooked ? '#CCCCCC' : '#FFFFFF',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        {formatHour(hour)}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Stack>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{
          width: 16,
          height: 16,
          borderRadius: 1,
          backgroundColor: color,
          border: '2px solid',
          borderColor: color
        }}
      />
      <Typography variant="caption" sx={{ color: '#B8BCC8' }}>
        {label}
      </Typography>
    </Stack>
  );
}

function formatHour(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`;
}

