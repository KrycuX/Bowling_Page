'use client';

import { useQuery } from '@tanstack/react-query';

import { apiClient } from '../lib/apiClient';
import {
  dayScheduleSchema,
  type DaySchedule,
  type DayScheduleResource,
  type ResourceType
} from '../lib/types';

type ScheduleParams = {
  date: string;
  resourceType?: ResourceType;
  resourceId?: number;
};

const REFRESH_INTERVAL_MS = 60_000;

async function fetchDaySchedule(params: ScheduleParams): Promise<DaySchedule> {
  const queryParams: Record<string, unknown> = { date: params.date };

  if (params.resourceType) {
    queryParams.resourceType = params.resourceType.toLowerCase();
  }

  if (params.resourceId) {
    queryParams.resourceId = params.resourceId;
  }

  const { data } = await apiClient.get('/schedule', { params: queryParams });
  return dayScheduleSchema.parse(data);
}

export function useDaySchedule({
  date,
  resourceType,
  resourceId
}: {
  date: string | null;
  resourceType?: ResourceType;
  resourceId?: number;
}) {
  return useQuery({
    queryKey: ['schedule', date, resourceType, resourceId],
    queryFn: () => {
      if (!date) {
        throw new Error('Date is required');
      }
      return fetchDaySchedule({ date, resourceType, resourceId });
    },
    enabled: Boolean(date),
    refetchInterval: REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true
  });
}

export type { DaySchedule, DayScheduleResource };
