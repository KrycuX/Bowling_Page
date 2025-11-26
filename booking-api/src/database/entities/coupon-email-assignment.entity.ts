import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index, CreateDateColumn } from 'typeorm';
import { Coupon } from './coupon.entity';

@Entity('coupon_email_assignments')
@Index(['email'])
export class CouponEmailAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  couponId: number;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'datetime', nullable: true })
  usedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Coupon, (coupon) => coupon.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'couponId' })
  coupon: Coupon;
}
