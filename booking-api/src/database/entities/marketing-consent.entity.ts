import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('marketing_consents')
@Index(['email', 'consentedAt'])
export class MarketingConsent {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'varchar', length: 256 })
  email: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  firstName: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  lastName: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phone: string;

  @Column({ type: 'boolean', default: true })
  consentGiven: boolean;

  @Column({ type: 'datetime' })
  consentedAt: Date;

  @Column({ type: 'varchar', length: 64, default: 'checkout' })
  source: string;

  @Column({ type: 'varchar', nullable: true })
  orderId: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  clientIp: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'orderId' })
  order: Order;
}

