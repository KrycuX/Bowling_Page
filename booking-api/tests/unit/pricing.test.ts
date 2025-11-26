import { PricingMode, ResourceType } from '@prisma/client';
import { describe, expect, it, beforeEach } from 'vitest';

import { env } from '../../src/config/env';
import { calculatePrice, getExpectedPricingMode } from '../../src/domain/pricing';
import { ValidationError } from '../../src/utils/errors';

describe('calculatePrice', () => {
  beforeEach(() => {
    env.PRICE_BOWLING_PER_HOUR = 1000;
    env.PRICE_BILLIARDS_PER_HOUR = 1500;
    env.PRICE_QUIZ_PER_PERSON_PER_SESSION = 2000;
    env.PRICE_KARAOKE_PER_PERSON_PER_HOUR = 500;
  });

  it('computes bowling price using duration and env rate', () => {
    const result = calculatePrice({
      resourceType: ResourceType.BOWLING_LANE,
      pricingMode: PricingMode.PER_RESOURCE_PER_HOUR,
      durationHours: 2
    });

    expect(result).toEqual({
      unitAmount: 1000,
      quantity: 2,
      totalAmount: 2000
    });
  });

  it('computes billiards price using dedicated rate', () => {
    const result = calculatePrice({
      resourceType: ResourceType.BILLIARDS_TABLE,
      pricingMode: PricingMode.PER_RESOURCE_PER_HOUR,
      durationHours: 3
    });

    expect(result).toEqual({
      unitAmount: 1500,
      quantity: 3,
      totalAmount: 4500
    });
  });

  it('requires people count for quiz room', () => {
    const result = calculatePrice({
      resourceType: ResourceType.QUIZ_ROOM,
      pricingMode: PricingMode.PER_PERSON_PER_SESSION,
      durationHours: 1,
      peopleCount: 5
    });

    expect(result).toEqual({
      unitAmount: 2000,
      quantity: 5,
      totalAmount: 10_000
    });
  });

  it('throws when pricing mode does not match expected resource mode', () => {
    expect(() =>
      calculatePrice({
        resourceType: ResourceType.BOWLING_LANE,
        pricingMode: PricingMode.PER_PERSON_PER_SESSION,
        durationHours: 1
      })
    ).toThrow(ValidationError);
  });
});

describe('getExpectedPricingMode', () => {
  it('returns correct mode for billiards', () => {
    expect(getExpectedPricingMode(ResourceType.BILLIARDS_TABLE)).toBe(
      PricingMode.PER_RESOURCE_PER_HOUR
    );
  });
});
