import { addHours, addMinutes, isValid } from 'date-fns';
import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';
import { BadRequestException } from '@nestjs/common';

const ISO_TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export function parseDateTime(
  date: string,
  time: string,
  timezone: string,
  slotIntervalMinutes: number
): Date {
  if (!ISO_TIME_REGEX.test(time)) {
    throw new BadRequestException('Time must be in format HH:mm');
  }

  ensureTimeAlignment(time, slotIntervalMinutes);

  const dateTimeString = `${date}T${time}:00`;
  const dateInTz = zonedTimeToUtc(dateTimeString, timezone);

  if (!isValid(dateInTz)) {
    throw new BadRequestException(`Invalid date/time combination: ${date} ${time}`);
  }

  return dateInTz;
}

export function addHoursZoned(date: Date, hours: number): Date {
  return addHours(date, hours);
}

export function addMinutesZoned(date: Date, minutes: number): Date {
  return addMinutes(date, minutes);
}

export function formatTimeInZone(date: Date, timezone: string): string {
  return formatInTimeZone(date, timezone, 'HH:mm');
}

export function formatDateInZone(date: Date, timezone: string): string {
  return formatInTimeZone(date, timezone, 'yyyy-MM-dd');
}

export function getDayBoundaries(date: string, timezone: string) {
  const start = zonedTimeToUtc(`${date}T00:00:00`, timezone);
  const end = zonedTimeToUtc(`${date}T23:59:59`, timezone);
  return { start, end };
}

export function getDayRange(date: string, timezone: string) {
  const start = zonedTimeToUtc(`${date}T00:00:00`, timezone);
  const end = addHours(start, 24);
  return { start, end };
}

export function getDayStart(date: string, timezone: string) {
  return zonedTimeToUtc(`${date}T00:00:00`, timezone);
}

export function ensureTimeAlignment(time: string, slotIntervalMinutes: number) {
  const minutes = Number.parseInt(time.split(':')[1] ?? '0', 10);
  if (Number.isNaN(minutes) || minutes % slotIntervalMinutes !== 0) {
    throw new BadRequestException(`Time must align with ${slotIntervalMinutes}-minute increments`);
  }
}

export function minutesFromTimeString(time: string) {
  const [hours, minutes] = time.split(':').map((value) => Number.parseInt(value, 10));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    throw new BadRequestException('Invalid time format');
  }
  return hours * 60 + minutes;
}

/**
 * Validate that the start time is not in the past
 * @param startTime Start time to validate (UTC)
 * @param timezone Timezone string (e.g., 'Europe/Warsaw')
 * @param slotIntervalMinutes Slot interval in minutes (e.g., 60)
 */
export function validateStartTimeNotInPast(
  startTime: Date,
  timezone: string,
  slotIntervalMinutes: number
): void {
  const now = new Date();
  
  // Simple validation: if start time is in the past, it's invalid
  // For example, if it's 13:45 and trying to book 13:00, that's not allowed
  // But if it's 13:45 and trying to book 14:00, that's allowed
  
  if (startTime <= now) {
    throw new BadRequestException('Nie można rezerwować slotów w przeszłości');
  }
}