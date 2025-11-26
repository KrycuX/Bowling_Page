import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Resource } from './resource.entity';

export enum SlotStatus {
  HOLD = 'HOLD',
  BOOKED = 'BOOKED',
  RELEASED = 'RELEASED',
}

@Entity('reserved_slots')
@Index(['resourceId', 'status', 'startTime', 'endTime'])
@Index(['resourceId', 'startTime', 'endTime'])
@Index(['status'])
@Index(['expiresAt'])
@Index(['status', 'expiresAt'])
export class ReservedSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  orderId: string;

  @Column({ type: 'int' })
  resourceId: number;

  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ type: 'datetime' })
  endTime: Date;

  @Column({ type: 'enum', enum: SlotStatus, default: SlotStatus.HOLD })
  status: SlotStatus;

  @Column({ type: 'datetime', nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => Resource)
  @JoinColumn({ name: 'resourceId' })
  resource: Resource;
}
