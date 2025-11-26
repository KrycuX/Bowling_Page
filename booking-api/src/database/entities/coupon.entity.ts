import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { CouponAllowedType } from './coupon-allowed-type.entity';
import { CouponEmailAssignment } from './coupon-email-assignment.entity';
import { CouponRedemption } from './coupon-redemption.entity';

export enum CouponType {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
}

@Entity('coupons')
@Index(['code', 'isActive', 'validFrom', 'validTo'])
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'enum', enum: CouponType })
  type: CouponType;

  @Column({ type: 'int' })
  value: number;

  @Column({ type: 'datetime', nullable: true })
  validFrom: Date;

  @Column({ type: 'datetime', nullable: true })
  validTo: Date;

  @Column({ type: 'boolean', default: true })
  appliesToAll: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', nullable: true })
  minTotal: number;

  @Column({ type: 'int', nullable: true })
  maxUsesTotal: number;

  @Column({ type: 'boolean', default: true })
  usePerEmail: boolean;

  @Column({ type: 'boolean', default: false })
  showOnLandingPage: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => CouponAllowedType, (type) => type.coupon, { cascade: true })
  allowedTypes: CouponAllowedType[];

  @OneToMany(() => CouponEmailAssignment, (assignment) => assignment.coupon, { cascade: true })
  assignments: CouponEmailAssignment[];

  @OneToMany(() => CouponRedemption, (redemption) => redemption.coupon)
  redemptions: CouponRedemption[];
}
