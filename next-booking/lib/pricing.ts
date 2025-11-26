import type { PricingMode, Resource, ResourceType } from './types';

const PRICE_BOWLING_PER_HOUR = Number(process.env.NEXT_PUBLIC_PRICE_BOWLING_PER_HOUR ?? '12000');
const PRICE_QUIZ_PER_PERSON_PER_SESSION = Number(
  process.env.NEXT_PUBLIC_PRICE_QUIZ_PER_PERSON_PER_SESSION ?? '5000'
);
const PRICE_KARAOKE_PER_PERSON_PER_HOUR = Number(
  process.env.NEXT_PUBLIC_PRICE_KARAOKE_PER_PERSON_PER_HOUR ?? '4000'
);
const PRICE_BILLIARDS_PER_HOUR = Number(
  process.env.NEXT_PUBLIC_PRICE_BILLIARDS_PER_HOUR ?? '5000'
);

const BOWLING_MIN_DURATION = Number(process.env.NEXT_PUBLIC_BOWLING_MIN_DURATION_HOURS ?? '1');
const BOWLING_MAX_DURATION = Number(process.env.NEXT_PUBLIC_BOWLING_MAX_DURATION_HOURS ?? '3');
const QUIZ_DURATION = Number(process.env.NEXT_PUBLIC_QUIZ_DURATION_HOURS ?? '1');
const QUIZ_MAX_PEOPLE = Number(process.env.NEXT_PUBLIC_QUIZ_MAX_PEOPLE ?? '8');
const KARAOKE_MIN_DURATION = Number(process.env.NEXT_PUBLIC_KARAOKE_MIN_DURATION_HOURS ?? '1');
const KARAOKE_MAX_DURATION = Number(process.env.NEXT_PUBLIC_KARAOKE_MAX_DURATION_HOURS ?? '4');
const KARAOKE_MAX_PEOPLE = Number(process.env.NEXT_PUBLIC_KARAOKE_MAX_PEOPLE ?? '10');

export type PricingConfig = {
  priceBowlingPerHour: number;
  priceBilliardsPerHour: number;
  priceKaraokePerPersonPerHour: number;
  priceQuizPerPersonPerSession: number;
  bowlingMinDurationHours: number;
  bowlingMaxDurationHours: number;
  quizDurationHours: number;
  karaokeMinDurationHours: number;
  karaokeMaxDurationHours: number;
  quizMaxPeople: number;
  karaokeMaxPeople: number;
};

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  priceBowlingPerHour: PRICE_BOWLING_PER_HOUR,
  priceBilliardsPerHour: PRICE_BILLIARDS_PER_HOUR,
  priceKaraokePerPersonPerHour: PRICE_KARAOKE_PER_PERSON_PER_HOUR,
  priceQuizPerPersonPerSession: PRICE_QUIZ_PER_PERSON_PER_SESSION,
  bowlingMinDurationHours: BOWLING_MIN_DURATION,
  bowlingMaxDurationHours: BOWLING_MAX_DURATION,
  quizDurationHours: QUIZ_DURATION,
  karaokeMinDurationHours: KARAOKE_MIN_DURATION,
  karaokeMaxDurationHours: KARAOKE_MAX_DURATION,
  quizMaxPeople: QUIZ_MAX_PEOPLE,
  karaokeMaxPeople: KARAOKE_MAX_PEOPLE
};

export function buildPricingConfig(overrides?: Partial<PricingConfig>): PricingConfig {
  if (!overrides) {
    return DEFAULT_PRICING_CONFIG;
  }
  return {
    ...DEFAULT_PRICING_CONFIG,
    ...Object.fromEntries(
      Object.entries(overrides).filter(([, value]) => value != null)
    ) as Partial<PricingConfig>
  };
}

function range(start: number, end: number): number[] {
  const result: number[] = [];
  for (let value = start; value <= end; value += 1) {
    result.push(value);
  }
  return result;
}

export const pricingModeByResourceType: Record<ResourceType, PricingMode> = {
  BOWLING_LANE: 'PER_RESOURCE_PER_HOUR',
  BILLIARDS_TABLE: 'PER_RESOURCE_PER_HOUR',
  QUIZ_ROOM: 'PER_PERSON_PER_SESSION',
  KARAOKE_ROOM: 'PER_PERSON_PER_HOUR'
};

export function getPricingModeForResourceType(type: ResourceType): PricingMode {
  return pricingModeByResourceType[type];
}

export function getAvailableDurations(
  resource: Resource,
  configOverrides?: Partial<PricingConfig>
): number[] {
  const config = buildPricingConfig(configOverrides);

  if (resource.type === 'BOWLING_LANE' || resource.type === 'BILLIARDS_TABLE') {
    return range(config.bowlingMinDurationHours, config.bowlingMaxDurationHours);
  }

  if (resource.type === 'QUIZ_ROOM') {
    return [config.quizDurationHours];
  }

  if (resource.type === 'KARAOKE_ROOM') {
    return range(config.karaokeMinDurationHours, config.karaokeMaxDurationHours);
  }

  return [1];
}

export function calculatePriceForResource(
  resourceType: ResourceType,
  durationHours: number,
  peopleCount?: number,
  configOverrides?: Partial<PricingConfig>
): number {
  const config = buildPricingConfig(configOverrides);
  if (resourceType === 'BOWLING_LANE') {
    return durationHours * config.priceBowlingPerHour;
  }

  if (resourceType === 'BILLIARDS_TABLE') {
    return durationHours * config.priceBilliardsPerHour;
  }

  if (resourceType === 'QUIZ_ROOM') {
    const count = peopleCount ?? 1;
    return count * config.priceQuizPerPersonPerSession;
  }

  if (resourceType === 'KARAOKE_ROOM') {
    const count = peopleCount ?? 1;
    return count * durationHours * config.priceKaraokePerPersonPerHour;
  }

  return 0;
}

export function calculatePrice(
  resource: Resource,
  durationHours: number,
  peopleCount?: number,
  configOverrides?: Partial<PricingConfig>
): number {
  const config = buildPricingConfig(configOverrides);

  if (resource.type === 'BOWLING_LANE' || resource.type === 'BILLIARDS_TABLE') {
    const overridePrice =
      resource.type === 'BOWLING_LANE'
        ? configOverrides?.priceBowlingPerHour
        : configOverrides?.priceBilliardsPerHour;
    const pricePerHour =
      overridePrice ??
      resource.pricePerHour ??
      (resource.type === 'BOWLING_LANE'
        ? config.priceBowlingPerHour
        : config.priceBilliardsPerHour);
    return durationHours * pricePerHour;
  }

  if (resource.type === 'QUIZ_ROOM') {
    const perSession =
      configOverrides?.priceQuizPerPersonPerSession ??
      resource.priceFlat ??
      config.priceQuizPerPersonPerSession;
    const count = peopleCount ?? 1;
    return count * perSession;
  }

  if (resource.type === 'KARAOKE_ROOM') {
    const perPersonPerHour =
      configOverrides?.priceKaraokePerPersonPerHour ??
      resource.pricePerHour ??
      config.priceKaraokePerPersonPerHour;
    const count = peopleCount ?? 1;
    return count * durationHours * perPersonPerHour;
  }

  return calculatePriceForResource(resource.type, durationHours, peopleCount, config);
}

export function formatPrice(amount: number, currency = 'PLN'): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount / 100);
}

export function getQuizMaxPeople(configOverrides?: Partial<PricingConfig>): number {
  return buildPricingConfig(configOverrides).quizMaxPeople;
}

export function getKaraokeMaxPeople(configOverrides?: Partial<PricingConfig>): number {
  return buildPricingConfig(configOverrides).karaokeMaxPeople;
}

export const quizMaxPeople = QUIZ_MAX_PEOPLE;
export const karaokeMaxPeople = KARAOKE_MAX_PEOPLE;
export const karaokeMaxDuration = KARAOKE_MAX_DURATION;
export const bowlingMaxDuration = BOWLING_MAX_DURATION;
