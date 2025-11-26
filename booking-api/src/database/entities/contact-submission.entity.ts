import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('contact_submissions')
@Index(['email', 'createdAt'])
@Index(['createdAt'])
export class ContactSubmission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 256 })
  name: string;

  @Column({ type: 'varchar', length: 256 })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  phone: string | null;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'boolean' })
  rodoConsent: boolean;

  @Column({ type: 'boolean', default: false })
  marketingConsent: boolean;

  @Column({ type: 'varchar', length: 64 })
  clientIp: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  userAgent: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

