'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type TimeCellKey = {
  resourceId: number;
  hour: number;
};

export type SelectionMap = Record<string, boolean>;

export type SelectionCorrection =
  | {
      type: 'out-of-range';
      key: string;
      reason: 'before-open' | 'after-close' | 'invalid';
    }
  | {
      type: 'gap-filled';
      resourceId: number;
      addedHours: number[];
    };

type Boundaries = {
  openHour: number;
  closeHour: number;
};

export type ContinuousRange = {
  startHour: number;
  endHour: number;
};

export function makeTimeCellKey(resourceId: number, hour: number): string {
  return `${resourceId}@${hour}`;
}

export function parseTimeCellKey(key: string): TimeCellKey {
  const [resource, hour] = key.split('@');
  const resourceId = Number.parseInt(resource ?? '', 10);
  const parsedHour = Number.parseInt(hour ?? '', 10);
  return { resourceId, hour: parsedHour };
}

export function isCellSelected(selection: SelectionMap, resourceId: number, hour: number): boolean {
  return Boolean(selection[makeTimeCellKey(resourceId, hour)]);
}

export function getContinuousRanges(selection: SelectionMap, resourceId: number): ContinuousRange[] {
  const selectedHours = Object.keys(selection)
    .filter((key) => selection[key])
    .map((key) => parseTimeCellKey(key))
    .filter(({ resourceId: currentId, hour }) => currentId === resourceId && Number.isInteger(hour))
    .map(({ hour }) => hour)
    .sort((a, b) => a - b);

  if (selectedHours.length === 0) {
    return [];
  }

  const ranges: ContinuousRange[] = [];
  let start = selectedHours[0];
  let end = start + 1;

  for (let index = 1; index < selectedHours.length; index += 1) {
    const currentHour = selectedHours[index];
    const previousHour = selectedHours[index - 1];

    if (currentHour === previousHour + 1) {
      end = currentHour + 1;
      continue;
    }

    ranges.push({ startHour: start, endHour: end });
    start = currentHour;
    end = currentHour + 1;
  }

  ranges.push({ startHour: start, endHour: end });
  return ranges;
}

export function getCommonRangeAcrossResources(
  selection: SelectionMap,
  resourceIds: number[]
): ContinuousRange | null {
  if (resourceIds.length === 0) {
    return null;
  }

  let baseRange: ContinuousRange | null = null;

  for (const resourceId of resourceIds) {
    const ranges = getContinuousRanges(selection, resourceId);
    if (ranges.length === 0) {
      return null;
    }

    const [currentRange] = ranges;
    if (!baseRange) {
      baseRange = currentRange;
      continue;
    }

    if (
      currentRange.startHour !== baseRange.startHour ||
      currentRange.endHour !== baseRange.endHour
    ) {
      return null;
    }
  }

  return baseRange;
}

export type UsePlannerSelectionOptions = {
  openHour: number;
  closeHour: number;
  stepMinutes?: number;
  initialSelection?: SelectionMap;
  initialEnabledResourceIds?: number[];
};

export type UsePlannerSelectionResult = {
  selection: SelectionMap;
  enabledResourceIds: number[];
  handleSelectionChange(next: SelectionMap): void;
  clearSelection(): void;
  replaceSelectionForResources(resourceIds: number[], startHour: number, endHour: number): void;
  removeResourceSelection(resourceId: number): void;
  setEnabledResourceIds(resourceIds: number[]): void;
  toggleResource(resourceId: number, enabled?: boolean): void;
  lastCorrections: SelectionCorrection[];
  isResourceSelected(resourceId: number): boolean;
};

export function usePlannerSelection(options: UsePlannerSelectionOptions): UsePlannerSelectionResult {
  const { openHour, closeHour, initialSelection = {}, initialEnabledResourceIds = [] } = options;

  const boundaries = useMemo<Boundaries>(
    () => ({
      openHour,
      closeHour
    }),
    [openHour, closeHour]
  );

  const initialSanitized = useMemo(
    () => sanitizeSelection(initialSelection, boundaries),
    [initialSelection, boundaries]
  );

  const [selection, setSelectionState] = useState<SelectionMap>(initialSanitized.selection);
  const [lastCorrections, setLastCorrections] = useState<SelectionCorrection[]>(
    initialSanitized.corrections
  );
  const [enabledResourceIds, setEnabledResourceIdsState] = useState<number[]>(
    Array.from(new Set(initialEnabledResourceIds))
  );

  const selectionRef = useRef(selection);
  useEffect(() => {
    selectionRef.current = selection;
  }, [selection]);

  const commitSelection = useCallback(
    (rawSelection: SelectionMap) => {
      const sanitized = sanitizeSelection(rawSelection, boundaries);
      selectionRef.current = sanitized.selection;
      setSelectionState(sanitized.selection);
      setLastCorrections(sanitized.corrections);
    },
    [boundaries]
  );

  const updateSelection = useCallback(
    (produce: SelectionMap | ((prev: SelectionMap) => SelectionMap)) => {
      const previous = selectionRef.current;
      const rawNext =
        typeof produce === 'function' ? (produce as (prev: SelectionMap) => SelectionMap)(previous) : produce;
      commitSelection(rawNext);
    },
    [commitSelection]
  );

  const handleSelectionChange = useCallback(
    (next: SelectionMap) => {
      commitSelection(next);
    },
    [commitSelection]
  );

  const clearSelection = useCallback(() => {
    commitSelection({});
  }, [commitSelection]);

  const removeResourceSelection = useCallback(
    (resourceId: number) => {
      updateSelection((prev) => removeResourceFromSelection(prev, resourceId));
    },
    [updateSelection]
  );

  const replaceSelectionForResources = useCallback(
    (resourceIds: number[], startHour: number, endHour: number) => {
      updateSelection((prev) => {
        let next = prev;

        for (const resourceId of resourceIds) {
          next = removeResourceFromSelection(next, resourceId);
        }

        if (endHour <= startHour) {
          return next;
        }

        const clampedStart = Math.max(boundaries.openHour, startHour);
        const clampedEnd = Math.min(boundaries.closeHour, endHour);

        if (clampedEnd <= clampedStart) {
          return next;
        }

        const draft: SelectionMap = { ...next };
        for (const resourceId of resourceIds) {
          for (let hour = clampedStart; hour < clampedEnd; hour += 1) {
            draft[makeTimeCellKey(resourceId, hour)] = true;
          }
        }
        return draft;
      });
    },
    [updateSelection, boundaries]
  );

  const toggleResource = useCallback(
    (resourceId: number, enabled?: boolean) => {
      setEnabledResourceIdsState((prev) => {
        const alreadyEnabled = prev.includes(resourceId);
        const shouldEnable = enabled ?? !alreadyEnabled;

        if (shouldEnable === alreadyEnabled) {
          return prev;
        }

        if (shouldEnable) {
          return [...prev, resourceId];
        }

        removeResourceSelection(resourceId);
        return prev.filter((id) => id !== resourceId);
      });
    },
    [removeResourceSelection]
  );

  const setEnabledResourceIds = useCallback(
    (resourceIds: number[]) => {
      const unique = Array.from(new Set(resourceIds));
      setEnabledResourceIdsState(unique);
      updateSelection((prev) => retainResourcesFromSelection(prev, new Set(unique)));
    },
    [updateSelection]
  );

  const isResourceSelected = useCallback(
    (resourceId: number) => {
      return Object.keys(selection).some((key) => {
        if (!selection[key]) {
          return false;
        }
        const parsed = parseTimeCellKey(key);
        return parsed.resourceId === resourceId;
      });
    },
    [selection]
  );

  return {
    selection,
    enabledResourceIds,
    handleSelectionChange,
    clearSelection,
    replaceSelectionForResources,
    removeResourceSelection,
    setEnabledResourceIds,
    toggleResource,
    lastCorrections,
    isResourceSelected
  };
}

function sanitizeSelection(selection: SelectionMap, boundaries: Boundaries) {
  const normalized: SelectionMap = {};
  const corrections: SelectionCorrection[] = [];
  const hoursByResource = new Map<number, Set<number>>();

  for (const [key, value] of Object.entries(selection)) {
    if (!value) {
      continue;
    }

    const { resourceId, hour } = parseTimeCellKey(key);
    if (!Number.isInteger(resourceId) || !Number.isInteger(hour)) {
      corrections.push({ type: 'out-of-range', key, reason: 'invalid' });
      continue;
    }

    if (hour < boundaries.openHour) {
      corrections.push({ type: 'out-of-range', key, reason: 'before-open' });
      continue;
    }

    if (hour >= boundaries.closeHour) {
      corrections.push({ type: 'out-of-range', key, reason: 'after-close' });
      continue;
    }

    const normalizedKey = makeTimeCellKey(resourceId, hour);
    normalized[normalizedKey] = true;

    if (!hoursByResource.has(resourceId)) {
      hoursByResource.set(resourceId, new Set());
    }
    hoursByResource.get(resourceId)!.add(hour);
  }

  for (const [resourceId, hoursSet] of hoursByResource) {
    if (hoursSet.size <= 1) {
      continue;
    }

    const sortedHours = Array.from(hoursSet).sort((a, b) => a - b);
    const minHour = sortedHours[0];
    const maxHour = sortedHours[sortedHours.length - 1];
    const added: number[] = [];

    for (let hour = minHour; hour <= maxHour; hour += 1) {
      if (!hoursSet.has(hour)) {
        normalized[makeTimeCellKey(resourceId, hour)] = true;
        added.push(hour);
      }
    }

    if (added.length > 0) {
      corrections.push({ type: 'gap-filled', resourceId, addedHours: added });
    }
  }

  return { selection: normalized, corrections };
}

function removeResourceFromSelection(selection: SelectionMap, resourceId: number): SelectionMap {
  if (Object.keys(selection).length === 0) {
    return selection;
  }
  const next: SelectionMap = {};

  for (const [key, value] of Object.entries(selection)) {
    if (!value) {
      continue;
    }
    const parsed = parseTimeCellKey(key);
    if (parsed.resourceId === resourceId) {
      continue;
    }
    next[key] = true;
  }

  return next;
}

function retainResourcesFromSelection(selection: SelectionMap, allowedResources: Set<number>): SelectionMap {
  if (allowedResources.size === 0) {
    return {};
  }

  const next: SelectionMap = {};
  for (const [key, value] of Object.entries(selection)) {
    if (!value) {
      continue;
    }
    const parsed = parseTimeCellKey(key);
    if (allowedResources.has(parsed.resourceId)) {
      next[key] = true;
    }
  }

  return next;
}

