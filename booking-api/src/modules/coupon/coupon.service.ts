import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { 
  Coupon, CouponAllowedType, CouponEmailAssignment, CouponRedemption, ResourceType, CouponType
} from '../../database/entities';

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, '');
}

export type CartItem = {
  resourceType: ResourceType;
  totalAmount: number;
};

export type ValidateCouponInput = {
  code: string;
  email: string;
  items: CartItem[];
};

export type ValidateCouponResult = {
  ok: boolean;
  coupon: {
    id: number;
    code: string;
    type: string;
    value: number;
  };
  discount: {
    amount: number;
    breakdown: any;
  };
  totalBefore: number;
  totalAfter: number;
};

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
    @InjectRepository(CouponAllowedType)
    private couponAllowedTypeRepository: Repository<CouponAllowedType>,
    @InjectRepository(CouponEmailAssignment)
    private couponEmailAssignmentRepository: Repository<CouponEmailAssignment>,
    @InjectRepository(CouponRedemption)
    private couponRedemptionRepository: Repository<CouponRedemption>,
    @Inject(ConfigService)
    private configService: ConfigService,
  ) {}

  async validateCoupon(input: ValidateCouponInput): Promise<ValidateCouponResult> {
    const code = normalizeCode(input.code);
    const email = input.email.trim().toLowerCase();
    const items = input.items;

    if (!code) {
      throw new BadRequestException('Coupon code is required');
    }
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    if (!items || items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const coupon = await this.couponRepository.findOne({
      where: { code },
      relations: ['allowedTypes', 'assignments', 'redemptions'],
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    if (!coupon.isActive) {
      throw new BadRequestException('Coupon is not active');
    }

    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      throw new BadRequestException('Coupon is not yet valid');
    }
    if (coupon.validTo && now > coupon.validTo) {
      throw new BadRequestException('Coupon has expired');
    }

    // Check email assignment if required
    // Note: The assignments check is optional based on business logic

    // Check allowed resource types
    let eligibleItems = items;
    if (!coupon.appliesToAll) {
      const allowedTypes = coupon.allowedTypes || [];
      const allowedSet = new Set(allowedTypes.map((t) => t.resourceType));
      eligibleItems = items.filter((i) => allowedSet.has(i.resourceType));
      
      if (eligibleItems.length === 0) {
        throw new BadRequestException('Coupon is not applicable to selected items');
      }
    }

    // Compute discount
    const eligibleSubtotal = eligibleItems.reduce((sum, i) => sum + i.totalAmount, 0);
    let discountAmount = 0;

    if (coupon.type === CouponType.PERCENT) {
      discountAmount = Math.floor((eligibleSubtotal * coupon.value) / 10000);
    } else {
      discountAmount = coupon.value;
    }

    const cartTotal = items.reduce((sum, i) => sum + i.totalAmount, 0);
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }

    const totalAfter = cartTotal - discountAmount;

    return {
      ok: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      },
      discount: {
        amount: discountAmount,
        breakdown: {
          type: coupon.type === CouponType.PERCENT ? 'percent' : 'fixed',
          value: coupon.value,
          eligibleSubtotal,
        },
      },
      totalBefore: cartTotal,
      totalAfter,
    };
  }

  async getPublicCoupons(): Promise<Coupon[]> {
    const now = new Date();
    
    return this.couponRepository.find({
      where: {
        isActive: true,
        appliesToAll: true,
        showOnLandingPage: true,
      },
      order: {
        createdAt: 'DESC',
      },
    }).then(coupons => {
      // Filter by date validity
      return coupons.filter(coupon => {
        if (coupon.validFrom && now < coupon.validFrom) {
          return false;
        }
        if (coupon.validTo && now > coupon.validTo) {
          return false;
        }
        return true;
      });
    });
  }
}
