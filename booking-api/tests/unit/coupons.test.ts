import { describe, it, expect, beforeAll, vi } from 'vitest';
import { PrismaClient, ResourceType, CouponType } from '@prisma/client';
import { computeDiscount, validateCoupon, normalizeCode } from '../../src/services/coupon.service';

const prisma = new PrismaClient();

describe('coupon utils', () => {
  it('normalizeCode trims and uppercases', () => {
    expect(normalizeCode('  zim a10 ')).toBe('ZIMA10');
  });

  it('computeDiscount percent with eligible items', () => {
    const coupon: any = { type: CouponType.PERCENT, value: 1000 };
    const items = [
      { resourceType: ResourceType.BOWLING_LANE, totalAmount: 10000 },
      { resourceType: ResourceType.QUIZ_ROOM, totalAmount: 5000 }
    ];
    const eligible = items;
    const res = computeDiscount({ coupon, items, eligibleItems: eligible });
    expect(res.amountApplied).toBe(1500);
  });

  it('computeDiscount fixed cannot reduce below zero', () => {
    const coupon: any = { type: CouponType.FIXED, value: 10000 };
    const items = [{ resourceType: ResourceType.BOWLING_LANE, totalAmount: 5000 }];
    const res = computeDiscount({ coupon, items, eligibleItems: items });
    expect(res.amountApplied).toBe(5000);
  });
});

// Skipping validateCoupon DB cases here for brevity; covered by API tests.
