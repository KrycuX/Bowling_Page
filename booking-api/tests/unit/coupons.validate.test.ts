import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '../../src/lib/prisma';
import { validateCoupon } from '../../src/services/coupon.service';

describe('validateCoupon scenarios', () => {
  it('rejects before validFrom', async () => {
    // Create a future coupon
    const coupon = await prisma.coupon.create({
      data: {
        code: 'FUTURE10',
        type: 'PERCENT',
        value: 1000,
        appliesToAll: true,
        isActive: true,
        validFrom: new Date(Date.now() + 7 * 24 * 3600 * 1000)
      }
    });

    await expect(
      validateCoupon({
        code: 'future10',
        email: 'x@example.com',
        items: [{ resourceType: 'BOWLING_LANE', totalAmount: 10000 }]
      })
    ).rejects.toThrow(/not yet valid/i);

    await prisma.coupon.delete({ where: { id: coupon.id } });
  });

  it('rejects when no eligible items for allowed types', async () => {
    const coupon = await prisma.coupon.create({
      data: {
        code: 'LANEONLY',
        type: 'FIXED',
        value: 1000,
        appliesToAll: false,
        isActive: true,
        allowedTypes: { create: [{ resourceType: 'BOWLING_LANE' }] }
      }
    });

    await expect(
      validateCoupon({
        code: 'laneonly',
        email: 'x@example.com',
        items: [{ resourceType: 'KARAOKE_ROOM', totalAmount: 10000 }]
      })
    ).rejects.toThrow(/does not apply/i);

    await prisma.coupon.delete({ where: { id: coupon.id } });
  });

  it('shared once per email blocks second use', async () => {
    const coupon = await prisma.coupon.create({
      data: {
        code: 'ONCEEMAIL',
        type: 'FIXED',
        value: 500,
        appliesToAll: true,
        isActive: true,
        usePerEmail: true
      }
    });

    // First validate ok
    const ok = await validateCoupon({
      code: 'ONCEEMAIL',
      email: 'shared@example.com',
      items: [{ resourceType: 'BOWLING_LANE', totalAmount: 10000 }]
    });
    expect(ok.totalAfter).toBe(9500);

    // Simulate redemption
    await prisma.couponRedemption.create({ data: { couponId: coupon.id, email: 'shared@example.com' } });

    // Second attempt rejected
    await expect(
      validateCoupon({ code: 'onceemail', email: 'shared@example.com', items: [{ resourceType: 'BOWLING_LANE', totalAmount: 10000 }] })
    ).rejects.toThrow(/already used/i);

    await prisma.coupon.delete({ where: { id: coupon.id } });
  });

  it('assignment-only requires assignment and blocks reuse', async () => {
    const coupon = await prisma.coupon.create({
      data: {
        code: 'ASSIGNME',
        type: 'PERCENT',
        value: 1000,
        appliesToAll: true,
        isActive: true,
        usePerEmail: false
      }
    });

    await expect(
      validateCoupon({ code: 'assignme', email: 'nope@example.com', items: [{ resourceType: 'BOWLING_LANE', totalAmount: 10000 }] })
    ).rejects.toThrow(/not assigned/i);

    await prisma.couponEmailAssignment.create({ data: { couponId: coupon.id, email: 'ok@example.com' } });

    const first = await validateCoupon({ code: 'assignme', email: 'ok@example.com', items: [{ resourceType: 'BOWLING_LANE', totalAmount: 10000 }] });
    expect(first.discount.amount).toBeGreaterThan(0);

    await prisma.couponEmailAssignment.update({ where: { couponId_email: { couponId: coupon.id, email: 'ok@example.com' } }, data: { usedAt: new Date() } });

    await expect(
      validateCoupon({ code: 'assignme', email: 'ok@example.com', items: [{ resourceType: 'BOWLING_LANE', totalAmount: 10000 }] })
    ).rejects.toThrow(/already used/i);

    await prisma.coupon.delete({ where: { id: coupon.id } });
  });
});
