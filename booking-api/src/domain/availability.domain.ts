import { addMinutesZoned, formatTimeInZone } from './time';

type SlotStatus = 'HOLD' | 'BOOKED' | 'RELEASED';

type ReservedSlotLike = {
  startTime: Date;
  endTime: Date;
  status: SlotStatus;
};

export type AvailabilitySlot = {
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'HOLD' | 'BOOKED';
};

export function buildAvailabilityGrid(
  dateStart: Date,
  openHour: number,
  closeHour: number,
  timezone: string,
  reservations: ReservedSlotLike[],
  intervalMinutes: number
): AvailabilitySlot[] {
  const segments: AvailabilitySlot[] = [];

  const totalMinutes = (closeHour - openHour) * 60;
  const startOffsetMinutes = openHour * 60;

  let currentStatus: AvailabilitySlot['status'] | null = null;
  let blockStart: Date | null = null;

  for (let offset = 0; offset < totalMinutes; offset += intervalMinutes) {
    const currentStart = addMinutesZoned(dateStart, startOffsetMinutes + offset);
    const currentEnd = addMinutesZoned(currentStart, intervalMinutes);

    const overlappingStatuses = reservations
      .filter((reserved) => currentStart < reserved.endTime && currentEnd > reserved.startTime)
      .map((reservation) => (reservation.status === 'BOOKED' ? 'BOOKED' : 'HOLD'));

    const slotStatus: AvailabilitySlot['status'] = overlappingStatuses.includes('BOOKED')
      ? 'BOOKED'
      : overlappingStatuses.includes('HOLD')
      ? 'HOLD'
      : 'AVAILABLE';

    if (currentStatus === null) {
      currentStatus = slotStatus;
      blockStart = currentStart;
      continue;
    }

    if (slotStatus === currentStatus) {
      continue;
    }

    if (blockStart) {
      segments.push({
        startTime: formatTimeInZone(blockStart, timezone),
        endTime: formatTimeInZone(currentStart, timezone),
        status: currentStatus
      });
    }

    currentStatus = slotStatus;
    blockStart = currentStart;
  }

  if (blockStart && currentStatus) {
    const dayEnd = addMinutesZoned(dateStart, startOffsetMinutes + totalMinutes);
    segments.push({
      startTime: formatTimeInZone(blockStart, timezone),
      endTime: formatTimeInZone(dayEnd, timezone),
      status: currentStatus
    });
  }

  return segments;
}
