import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Coupon } from './coupon.entity';

@Entity('coupon_redemptions')
@Index(['couponId'])
@Index(['email'])
export class CouponRedemption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  couponId: number;

  @Column({ type: 'varchar', nullable: true })
  orderId: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  usedAt: Date;

  // Relations
  @ManyToOne(() => Coupon, (coupon) => coupon.redemptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'couponId' })
  coupon: Coupon;
}
