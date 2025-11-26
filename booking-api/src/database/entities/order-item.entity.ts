import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Order } from './order.entity';
import { Resource } from './resource.entity';

export enum PricingMode {
  PER_RESOURCE_PER_HOUR = 'PER_RESOURCE_PER_HOUR',
  PER_PERSON_PER_HOUR = 'PER_PERSON_PER_HOUR',
  PER_PERSON_PER_SESSION = 'PER_PERSON_PER_SESSION',
}

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  orderId: string;

  @Column({ type: 'int' })
  resourceId: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'int', nullable: true })
  peopleCount: number;

  @Column({ type: 'int' })
  unitAmount: number;

  @Column({ type: 'int' })
  totalAmount: number;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: PricingMode, default: PricingMode.PER_RESOURCE_PER_HOUR })
  pricingMode: PricingMode;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => Resource)
  @JoinColumn({ name: 'resourceId' })
  resource: Resource;
}
