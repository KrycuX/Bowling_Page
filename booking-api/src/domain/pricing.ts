import { ValidationError } from '../utils/errors';

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
      throw new ValidationError('Unsupported resource type');
  }
}

export function calculatePrice({
  resourceType,
  pricingMode,
  durationHours,
  peopleCount
}: PricingInput): PricingResult {
  const expectedMode = getExpectedPricingMode(resourceType);

  if (pricingMode !== expectedMode) {
    throw new ValidationError('Invalid pricing mode for selected resource');
  }

  if (resourceType === 'BOWLING_LANE' || resourceType === 'BILLIARDS_TABLE') {
    if (durationHours < 1) {
      throw new ValidationError('Duration must be at least 1 hour');
    }
    const unitAmount =
      resourceType === 'BOWLING_LANE'
        ? parseInt(process.env.PRICE_BOWLING_PER_HOUR || '12000', 10)
        : parseInt(process.env.PRICE_BILLIARDS_PER_HOUR || '5000', 10);
    const quantity = durationHours;
    const totalAmount = unitAmount * quantity;
    return { unitAmount, quantity, totalAmount };
  }

  if (!peopleCount || peopleCount < 1) {
    throw new ValidationError('People count must be provided for this resource');
  }

  if (resourceType === 'QUIZ_ROOM') {
    const unitAmount = parseInt(process.env.PRICE_QUIZ_PER_PERSON_PER_SESSION || '5000', 10);
    const quantity = peopleCount;
    const totalAmount = unitAmount * quantity;
    return { unitAmount, quantity, totalAmount };
  }

  if (resourceType === 'KARAOKE_ROOM') {
    const unitAmount = parseInt(process.env.PRICE_KARAOKE_PER_PERSON_PER_HOUR || '4000', 10);
    const quantity = peopleCount * durationHours;
    const totalAmount = unitAmount * quantity;
    return { unitAmount, quantity, totalAmount };
  }

  throw new ValidationError('Unsupported resource type');
}

export function sumOrder(items: number[]): number {
  return items.reduce((acc, item) => acc + item, 0);
}
