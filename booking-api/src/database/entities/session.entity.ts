import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, Index, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('sessions')
@Index(['expiresAt', 'userId'])
export class Session {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'varchar', unique: true })
  token: string;

  @Column({ type: 'varchar' })
  csrfToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime' })
  expiresAt: Date;

  @Column({ type: 'varchar', nullable: true })
  ipHash: string;

  @Column({ type: 'varchar', nullable: true })
  userAgentHash: string;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
