import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Coupon } from './coupon.entity';
import { ResourceType } from './resource.entity';

@Entity('coupon_allowed_resource_types')
export class CouponAllowedType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  couponId: number;

  @Column({ type: 'enum', enum: ResourceType })
  resourceType: ResourceType;

  // Relations
  @ManyToOne(() => Coupon, (coupon) => coupon.allowedTypes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'couponId' })
  coupon: Coupon;
}
