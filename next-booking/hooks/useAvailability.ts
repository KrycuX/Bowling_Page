'use client';

import { useQuery } from '@tanstack/react-query';

import {
  availabilityResponseSchema,
  type AvailabilityResponse,
  type ResourceType
} from '../lib/types';
import { apiClient } from '../lib/apiClient';

type AvailabilityParams = {
  date: string | null;
  resourceType?: ResourceType;
  resourceId?: number;
};

async function fetchAvailability(params: Required<Pick<AvailabilityParams, 'date'>> & {
  resourceType?: ResourceType;
  resourceId?: number;
}): Promise<AvailabilityResponse> {
  const queryParams: Record<string, unknown> = { date: params.date };
  if (params.resourceType) {
    queryParams.resourceType = params.resourceType;
  }
  if (params.resourceId) {
    queryParams.resourceId = params.resourceId;
  }

  const { data } = await apiClient.get('/availability', {
    params: queryParams
  });

  return availabilityResponseSchema.parse(data);
}

export function useAvailability({ date, resourceType, resourceId }: AvailabilityParams) {
  return useQuery({
    queryKey: ['availability', date, resourceType, resourceId],
    queryFn: () => {
      if (!date) {
        throw new Error('Date is required');
      }

      return fetchAvailability({ date, resourceType, resourceId });
    },
    enabled: Boolean(date),
    staleTime: 60_000
  });
}
