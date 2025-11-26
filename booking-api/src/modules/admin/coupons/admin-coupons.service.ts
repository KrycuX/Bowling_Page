import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Coupon, CouponAllowedType, CouponEmailAssignment, CouponRedemption, ResourceType, CouponType } from '../../../database/entities';

export type CreateCouponInput = {
  code: string;
  type: CouponType;
  value: number;
  validFrom?: Date | null;
  validTo?: Date | null;
  appliesToAll: boolean;
  allowedResourceTypes?: ResourceType[];
  minTotal?: number | null;
  maxUsesTotal?: number | null;
  isActive?: boolean;
  usePerEmail?: boolean;
  emailRestricted?: boolean;
  showOnLandingPage?: boolean;
};

export type UpdateCouponInput = Partial<CreateCouponInput>;

@Injectable()
export class AdminCouponsService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
    @InjectRepository(CouponAllowedType)
    private couponAllowedTypeRepository: Repository<CouponAllowedType>,
    @InjectRepository(CouponEmailAssignment)
    private couponEmailAssignmentRepository: Repository<CouponEmailAssignment>,
    @InjectRepository(CouponRedemption)
    private couponRedemptionRepository: Repository<CouponRedemption>,
    @Inject(DataSource)
    private dataSource: DataSource,
  ) {console.log('AdminCouponsService constructor called');}

  async listCoupons(): Promise<Coupon[]> {
    return this.couponRepository.find({
      relations: ['allowedTypes'],
      order: { id: 'DESC' },
    });
  }

  async getCoupon(id: number): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { id },
      relations: ['allowedTypes', 'assignments', 'redemptions'],
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  async createCoupon(input: CreateCouponInput): Promise<Coupon> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const coupon = this.couponRepository.create({
        code: input.code.toUpperCase().trim(),
        type: input.type,
        value: input.value,
        validFrom: input.validFrom ?? null,
        validTo: input.validTo ?? null,
        appliesToAll: input.appliesToAll,
        isActive: input.isActive ?? true,
        minTotal: input.minTotal ?? null,
        maxUsesTotal: input.maxUsesTotal ?? null,
        usePerEmail: input.usePerEmail ?? true,
        showOnLandingPage: input.showOnLandingPage ?? false,
      });

      const savedCoupon = await queryRunner.manager.save(coupon);

      if (!input.appliesToAll && input.allowedResourceTypes && input.allowedResourceTypes.length > 0) {
        for (const resourceType of input.allowedResourceTypes) {
          const allowedType = this.couponAllowedTypeRepository.create({
            couponId: savedCoupon.id,
            resourceType,
          });
          await queryRunner.manager.save(allowedType);
        }
      }

      await queryRunner.commitTransaction();

      return this.getCoupon(savedCoupon.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateCoupon(id: number, input: UpdateCouponInput): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({
      where: { id },
      relations: ['allowedTypes'],
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (input.code) {
        coupon.code = input.code.toUpperCase().trim();
      }
      if (input.type) coupon.type = input.type;
      if (input.value !== undefined) coupon.value = input.value;
      if (input.validFrom !== undefined) coupon.validFrom = input.validFrom;
      if (input.validTo !== undefined) coupon.validTo = input.validTo;
      if (input.appliesToAll !== undefined) coupon.appliesToAll = input.appliesToAll;
      if (input.isActive !== undefined) coupon.isActive = input.isActive;
      if (input.minTotal !== undefined) coupon.minTotal = input.minTotal;
      if (input.maxUsesTotal !== undefined) coupon.maxUsesTotal = input.maxUsesTotal;
      if (input.usePerEmail !== undefined) coupon.usePerEmail = input.usePerEmail;
      if (input.showOnLandingPage !== undefined) coupon.showOnLandingPage = input.showOnLandingPage;

      await queryRunner.manager.save(coupon);

      if (input.appliesToAll === false && input.allowedResourceTypes) {
        await queryRunner.manager.delete(CouponAllowedType, { couponId: id });
        for (const resourceType of input.allowedResourceTypes) {
          const allowedType = this.couponAllowedTypeRepository.create({
            couponId: id,
            resourceType,
          });
          await queryRunner.manager.save(allowedType);
        }
      } else if (input.appliesToAll === true) {
        await queryRunner.manager.delete(CouponAllowedType, { couponId: id });
      }

      await queryRunner.commitTransaction();

      return this.getCoupon(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async toggleCoupon(id: number): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ where: { id } });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    coupon.isActive = !coupon.isActive;
    return this.couponRepository.save(coupon);
  }

  async getCouponAssignments(id: number): Promise<CouponEmailAssignment[]> {
    return this.couponEmailAssignmentRepository.find({
      where: { couponId: id },
      order: { createdAt: 'DESC' },
    });
  }

  async importAssignments(id: number, emails: string[]): Promise<CouponEmailAssignment[]> {
    const coupon = await this.couponRepository.findOne({ where: { id } });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const assignments: CouponEmailAssignment[] = [];

      for (const email of emails) {
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) continue;

        const existing = await queryRunner.manager.findOne(CouponEmailAssignment, {
          where: { couponId: id, email: normalizedEmail },
        });

        if (!existing) {
          const assignment = this.couponEmailAssignmentRepository.create({
            couponId: id,
            email: normalizedEmail,
          });
          const saved = await queryRunner.manager.save(assignment);
          assignments.push(saved);
        }
      }

      await queryRunner.commitTransaction();

      return assignments;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteAssignment(id: number, assignmentId: number): Promise<void> {
    const assignment = await this.couponEmailAssignmentRepository.findOne({
      where: { id: assignmentId, couponId: id },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    await this.couponEmailAssignmentRepository.remove(assignment);
  }

  async getCouponRedemptions(id: number): Promise<CouponRedemption[]> {
    return this.couponRedemptionRepository.find({
      where: { couponId: id },
      relations: ['coupon'],
      order: { usedAt: 'DESC' },
    });
  }
}
