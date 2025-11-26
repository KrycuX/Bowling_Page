import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';
import { ReservedSlot } from './reserved-slot.entity';

export enum OrderStatus {
  HOLD = 'HOLD',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PENDING_ONSITE = 'PENDING_ONSITE',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  ONLINE = 'ONLINE',
  ON_SITE_CASH = 'ON_SITE_CASH',
  ON_SITE_CARD = 'ON_SITE_CARD',
}

@Entity('orders')
@Index(['customerEmail', 'status', 'createdAt'])
export class Order {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.HOLD })
  status: OrderStatus;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.ONLINE })
  paymentMethod: PaymentMethod;

  @Column({ type: 'int' })
  totalAmount: number;

  @Column({ type: 'int', default: 0 })
  discountAmount: number;

  @Column({ type: 'varchar', nullable: true })
  appliedCouponCode: string;

  @Column({ type: 'varchar', default: 'PLN' })
  currency: string;

  @Column({ type: 'varchar' })
  customerName: string;

  @Column({ type: 'varchar' })
  customerEmail: string;

  @Column({ type: 'varchar', nullable: true })
  customerPhone: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  p24SessionId: string;

  @Column({ type: 'int', nullable: true })
  p24OrderId: number;

  @Column({ type: 'varchar', unique: true, nullable: true })
  @Index('IDX_order_number', ['orderNumber'])
  orderNumber: string;

  @Column({ type: 'datetime', nullable: true })
  holdExpiresAt: Date;

  @Column({ type: 'datetime', nullable: true })
  paidAt: Date;

  @Column({ type: 'int', nullable: true })
  createdByUserId: number;

  @Column({ type: 'int', nullable: true })
  updatedByUserId: number;

  @Column({ type: 'datetime', nullable: true })
  cancelledAt: Date;

  @Column({ type: 'int', nullable: true })
  cancelledByUserId: number;

  @Column({ type: 'datetime', nullable: true })
  deletedAt: Date; // Soft delete

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdByUserId' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updatedByUserId' })
  updatedBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'cancelledByUserId' })
  cancelledBy: User;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @OneToMany(() => ReservedSlot, (slot) => slot.order)
  reservedSlots: ReservedSlot[];
}
