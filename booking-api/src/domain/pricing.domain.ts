
type PricingMode = 'PER_RESOURCE_PER_HOUR' | 'PER_PERSON_PER_HOUR' | 'PER_PERSON_PER_SESSION';
type ResourceType = 'BOWLING_LANE' | 'QUIZ_ROOM' | 'KARAOKE_ROOM' | 'BILLIARDS_TABLE';

export type PricingInput = {
  resourceType: ResourceType;
  pricingMode: PricingMode;
  durationHours: number;
  peopleCount?: number | null;
};

export type PricingResult = {
  unitAmount: number;
  quantity: number;
  totalAmount: number;
};

export type PricingSettings = {
  priceBowlingPerHour: number;
  priceBilliardsPerHour: number;
  priceKaraokePerPersonPerHour: number;
  priceQuizPerPersonPerSession: number;
};

export function getExpectedPricingMode(resourceType: ResourceType): PricingMode {
  switch (resourceType) {
    case 'BOWLING_LANE':
      return 'PER_RESOURCE_PER_HOUR';
    case 'BILLIARDS_TABLE':
      return 'PER_RESOURCE_PER_HOUR';
    case 'QUIZ_ROOM':
      return 'PER_PERSON_PER_SESSION';
    case 'KARAOKE_ROOM':
      return 'PER_PERSON_PER_HOUR';
    default:
      throw new Error('Unsupported resource type');
  }
}

export function calculatePriceWithSettings({
  resourceType,
  pricingMode,
  durationHours,
  peopleCount,
  settings
}: PricingInput & { settings: PricingSettings }): PricingResult {
  const expectedMode = getExpectedPricingMode(resourceType);

  if (pricingMode !== expectedMode) {
    throw new Error('Invalid pricing mode for selected resource');
  }

  if (resourceType === 'BOWLING_LANE' || resourceType === 'BILLIARDS_TABLE') {
    if (durationHours < 1) {
      throw new Error('Duration must be at least 1 hour');
    }
    const unitAmount =
      resourceType === 'BOWLING_LANE'
        ? settings.priceBowlingPerHour
        : settings.priceBilliardsPerHour;
    const quantity = durationHours;
    const totalAmount = unitAmount * quantity;
    return { unitAmount, quantity, totalAmount };
  }

  if (!peopleCount || peopleCount < 1) {
    throw new Error('People count must be provided for this resource');
  }

  if (resourceType === 'QUIZ_ROOM') {
    const unitAmount = settings.priceQuizPerPersonPerSession;
    const quantity = peopleCount;
    const totalAmount = unitAmount * quantity;
    return { unitAmount, quantity, totalAmount };
  }

  if (resourceType === 'KARAOKE_ROOM') {
    const unitAmount = settings.priceKaraokePerPersonPerHour;
    const quantity = peopleCount * durationHours;
    const totalAmount = unitAmount * quantity;
    return { unitAmount, quantity, totalAmount };
  }

  throw new Error('Unsupported resource type');
}

// Deprecated: Use calculatePriceWithSettings instead
export function calculatePrice({
  resourceType,
  pricingMode,
  durationHours,
  peopleCount
}: PricingInput): PricingResult {
  const expectedMode = getExpectedPricingMode(resourceType);

  if (pricingMode !== expectedMode) {
    throw new Error('Invalid pricing mode for selected resource');
  }

  if (resourceType === 'BOWLING_LANE' || resourceType === 'BILLIARDS_TABLE') {
    if (durationHours < 1) {
      throw new Error('Duration must be at least 1 hour');
    }
    // Default fallback values
    const unitAmount =
      resourceType === 'BOWLING_LANE'
        ? 12000
        : 5000;
    const quantity = durationHours;
    const totalAmount = unitAmount * quantity;
    return { unitAmount, quantity, totalAmount };
  }

  if (!peopleCount || peopleCount < 1) {
    throw new Error('People count must be provided for this resource');
  }

  if (resourceType === 'QUIZ_ROOM') {
    const unitAmount = 5000;
    const quantity = peopleCount;
    const totalAmount = unitAmount * quantity;
    return { unitAmount, quantity, totalAmount };
  }

  if (resourceType === 'KARAOKE_ROOM') {
    const unitAmount = 4000;
    const quantity = peopleCount * durationHours;
    const totalAmount = unitAmount * quantity;
    return { unitAmount, quantity, totalAmount };
  }

  throw new Error('Unsupported resource type');
}

export function sumOrder(items: number[]): number {
  return items.reduce((acc, item) => acc + item, 0);
}
