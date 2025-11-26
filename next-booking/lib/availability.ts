import type { AvailabilitySlot, Resource } from './types';

export function filterAvailableSlots(slots: AvailabilitySlot[]): AvailabilitySlot[] {
  return slots.filter((slot) => slot.status === 'AVAILABLE');
}

export function getAvailableStartTimes(
  resource: Resource,
  durationHours: number,
  slotIntervalMinutes: number
): string[] {
  const availableSlots = filterAvailableSlots(resource.slots);
  const durationMinutes = durationHours * 60;
  const startTimes = new Set<string>();

  availableSlots.forEach((slot) => {
    const slotStart = toMinutes(slot.startTime);
    const slotEnd = toMinutes(slot.endTime);

    for (let minute = slotStart; minute + durationMinutes <= slotEnd; minute += slotIntervalMinutes) {
      startTimes.add(minutesToTime(minute));
    }
  });

  const sorted = Array.from(startTimes).sort();

  if (resource.type === 'BOWLING_LANE') {
    return sorted.filter((time) => time.endsWith(':00'));
  }

  return sorted;
}

// New: check if a single resource can accommodate start+duration
export function resourceSupportsWindow(
  resource: Resource,
  start: string,
  durationHours: number,
  slotIntervalMinutes: number
): boolean {
  const durationMinutes = durationHours * 60;
  const startMinutes = toMinutes(start);
  const endMinutes = startMinutes + durationMinutes;

  // Find an AVAILABLE slot block that fully covers [start, end)
  for (const slot of resource.slots) {
    if (slot.status !== 'AVAILABLE') continue;
    const s = toMinutes(slot.startTime);
    const e = toMinutes(slot.endTime);
    if (s <= startMinutes && e >= endMinutes) {
      // Align to grid: ensure start aligns with slotInterval
      const aligns = (startMinutes - s) % slotIntervalMinutes === 0;
      if (!aligns) return false;
      return true;
    }
  }
  return false;
}

// New: get start times where at least `quantity` resources are free for the window
export function getStartTimesForQuantity(
  resources: Resource[],
  quantity: number,
  durationHours: number,
  slotIntervalMinutes: number
): string[] {
  if (resources.length === 0 || quantity < 1) return [];

  // Build a superset of candidate start times from all resources
  const candidateTimes = new Set<string>();
  for (const r of resources) {
    getAvailableStartTimes(r, durationHours, slotIntervalMinutes).forEach((t) => candidateTimes.add(t));
  }

  const result: string[] = [];
  for (const t of Array.from(candidateTimes)) {
    let count = 0;
    for (const r of resources) {
      if (resourceSupportsWindow(r, t, durationHours, slotIntervalMinutes)) {
        count += 1;
        if (count >= quantity) break;
      }
    }
    if (count >= quantity) {
      result.push(t);
    }
  }

  return result.sort();
}

// New: pick concrete resource IDs for a given start time and quantity
export function pickResourcesForStart(
  resources: Resource[],
  quantity: number,
  start: string,
  durationHours: number,
  slotIntervalMinutes: number
): number[] {
  const picked: number[] = [];
  for (const r of resources) {
    if (resourceSupportsWindow(r, start, durationHours, slotIntervalMinutes)) {
      picked.push(r.id);
      if (picked.length === quantity) break;
    }
  }
  return picked;
}

export function formatTimeRange(start: string, durationHours: number): string {
  const startMinutes = toMinutes(start);
  const endMinutes = startMinutes + durationHours * 60;
  return `${start} - ${minutesToTime(endMinutes)}`;
}

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
