import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ResourceType {
  BOWLING_LANE = 'BOWLING_LANE',
  QUIZ_ROOM = 'QUIZ_ROOM',
  KARAOKE_ROOM = 'KARAOKE_ROOM',
  BILLIARDS_TABLE = 'BILLIARDS_TABLE',
}

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'enum', enum: ResourceType })
  type: ResourceType;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pricePerHour: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceFlat: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
