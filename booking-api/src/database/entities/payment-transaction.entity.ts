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

export enum PaymentTransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  ABANDONED = 'ABANDONED',
  TIMED_OUT = 'TIMED_OUT',
  REFUNDED = 'REFUNDED',
}

@Entity('payment_transactions')
@Index(['orderId'])
@Index(['sessionId'])
@Index(['status'])
@Index(['orderId', 'status'])
export class PaymentTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  orderId: string;

  @Column({ type: 'int', nullable: true })
  p24OrderId: number;

  @Column({ type: 'varchar' })
  sessionId: string;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'varchar', default: 'PLN' })
  currency: string;

  @Column({ type: 'varchar', nullable: true })
  method: string;

  @Column({ type: 'enum', enum: PaymentTransactionStatus, default: PaymentTransactionStatus.PENDING })
  status: PaymentTransactionStatus;

  @Column({ type: 'json', nullable: true })
  statusHistory: Array<{
    status: PaymentTransactionStatus;
    timestamp: Date;
    reason?: string;
  }>;

  @Column({ type: 'varchar', nullable: true })
  webhookSignature: string;

  @Column({ type: 'json', nullable: true })
  verifyResponse: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;
}
