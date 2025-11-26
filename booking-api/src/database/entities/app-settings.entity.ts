import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('app_settings')
export class AppSettings {
  @PrimaryColumn({ type: 'int', default: 1 })
  id: number;

  @Column({ type: 'varchar', nullable: true })
  timezone: string;

  @Column({ type: 'int', nullable: true })
  openHour: number;

  @Column({ type: 'int', nullable: true })
  closeHour: number;

  @Column({ type: 'int', nullable: true })
  slotIntervalMinutes: number;

  @Column({ type: 'int', nullable: true })
  holdDurationMinutes: number;

  @Column({ type: 'int', nullable: true })
  priceBowlingPerHour: number;

  @Column({ type: 'int', nullable: true })
  priceBilliardsPerHour: number;

  @Column({ type: 'int', nullable: true })
  priceKaraokePerPersonPerHour: number;

  @Column({ type: 'int', nullable: true })
  priceQuizPerPersonPerSession: number;

  @Column({ type: 'int', nullable: true })
  billiardsTablesCount: number;

  @Column({ type: 'int', nullable: true })
  bowlingMinDurationHours: number;

  @Column({ type: 'int', nullable: true })
  bowlingMaxDurationHours: number;

  @Column({ type: 'int', nullable: true })
  quizDurationHours: number;

  @Column({ type: 'int', nullable: true })
  quizMaxPeople: number;

  @Column({ type: 'int', nullable: true })
  karaokeMinDurationHours: number;

  @Column({ type: 'int', nullable: true })
  karaokeMaxDurationHours: number;

  @Column({ type: 'int', nullable: true })
  karaokeMaxPeople: number;

  @Column({ type: 'varchar', nullable: true })
  p24MerchantId: string;

  @Column({ type: 'varchar', nullable: true })
  p24PosId: string;

  @Column({ type: 'varchar', nullable: true })
  p24Crc: string;

  @Column({ type: 'varchar', nullable: true })
  p24ApiKey: string;

  @Column({ type: 'varchar', nullable: true })
  p24Mode: string;

  @Column({ type: 'varchar', nullable: true })
  p24ReturnUrl: string;

  @Column({ type: 'varchar', nullable: true })
  p24StatusUrl: string;

  @Column({ type: 'boolean', default: true })
  demoMode: boolean;

  @Column({ type: 'varchar', nullable: true })
  senderEmail: string;

  @Column({ type: 'varchar', nullable: true })
  senderName: string;

  @Column({ type: 'varchar', nullable: true })
  smtpHost: string;

  @Column({ type: 'int', nullable: true })
  smtpPort: number;

  @Column({ type: 'varchar', nullable: true })
  smtpUser: string;

  @Column({ type: 'varchar', nullable: true })
  smtpPassword: string;

  @Column({ type: 'boolean', default: true })
  smtpSecure: boolean;

  @Column({ type: 'text', nullable: true })
  contactFormEmailTemplate: string;

  @Column({ type: 'json', nullable: true })
  weeklyHours: {
    monday: { openHour: number; closeHour: number; closed: boolean };
    tuesday: { openHour: number; closeHour: number; closed: boolean };
    wednesday: { openHour: number; closeHour: number; closed: boolean };
    thursday: { openHour: number; closeHour: number; closed: boolean };
    friday: { openHour: number; closeHour: number; closed: boolean };
    saturday: { openHour: number; closeHour: number; closed: boolean };
    sunday: { openHour: number; closeHour: number; closed: boolean };
  } | null;

  @Column({ type: 'int', nullable: true, default: 15 })
  holdTtlOnlineMinutes: number;

  @Column({ type: 'int', nullable: true, default: 7 })
  holdTtlLastMinuteMinutes: number;

  @Column({ type: 'int', nullable: true, default: 10 })
  holdTtlPeakHoursMinutes: number;

  @Column({ type: 'int', nullable: true, default: 45 })
  holdTtlOnsiteBeforeStartMinutes: number;

  @Column({ type: 'int', nullable: true, default: 7 })
  holdTtlOnsiteGraceAfterStartMinutes: number;

  @Column({ type: 'int', nullable: true, default: 17 })
  peakHoursStart: number;

  @Column({ type: 'int', nullable: true, default: 22 })
  peakHoursEnd: number;

  @Column({ type: 'int', nullable: true, default: 60 })
  lastMinuteThresholdMinutes: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
