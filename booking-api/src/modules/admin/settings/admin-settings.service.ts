import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSettings, AuditLog, AuditAction, AuditEntityType } from '../../../database/entities';

export type WeeklyHours = {
  monday: { openHour: number; closeHour: number; closed: boolean };
  tuesday: { openHour: number; closeHour: number; closed: boolean };
  wednesday: { openHour: number; closeHour: number; closed: boolean };
  thursday: { openHour: number; closeHour: number; closed: boolean };
  friday: { openHour: number; closeHour: number; closed: boolean };
  saturday: { openHour: number; closeHour: number; closed: boolean };
  sunday: { openHour: number; closeHour: number; closed: boolean };
};

export type SettingsInput = {
  timezone?: string;
  openHour?: number;
  closeHour?: number;
  slotIntervalMinutes?: number;
  holdDurationMinutes?: number;
  priceBowlingPerHour?: number;
  priceBilliardsPerHour?: number;
  priceKaraokePerPersonPerHour?: number;
  priceQuizPerPersonPerSession?: number;
  billiardsTablesCount?: number;
  bowlingMinDurationHours?: number;
  bowlingMaxDurationHours?: number;
  quizDurationHours?: number;
  quizMaxPeople?: number;
  karaokeMinDurationHours?: number;
  karaokeMaxDurationHours?: number;
  karaokeMaxPeople?: number;
  p24MerchantId?: string;
  p24PosId?: string;
  p24Crc?: string;
  p24ApiKey?: string;
  p24Mode?: string;
  p24ReturnUrl?: string;
  p24StatusUrl?: string;
  demoMode?: boolean;
  senderEmail?: string;
  senderName?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  contactFormEmailTemplate?: string;
  weeklyHours?: WeeklyHours;
};

@Injectable()
export class AdminSettingsService {
  private settingsCache: any = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minut cache

  constructor(
    @InjectRepository(AppSettings)
    private settingsRepository: Repository<AppSettings>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {
    console.log('AdminSettingsService constructor called');

  }

  async getSettings(): Promise<AppSettings> {
    let settings = await this.settingsRepository.findOne({
      where: { id: 1 },
    });

    if (!settings) {
      settings = this.settingsRepository.create({ id: 1 });
      await this.settingsRepository.save(settings);
    }

    return settings;
  }

  async updateSettings(input: SettingsInput): Promise<AppSettings> {
    // Validate weeklyHours if provided
    if (input.weeklyHours) {
      this.validateWeeklyHours(input.weeklyHours);
    }

    let settings = await this.settingsRepository.findOne({
      where: { id: 1 },
    });

    if (!settings) {
      settings = this.settingsRepository.create({ id: 1, ...input });
    } else {
      Object.assign(settings, input);
    }

    settings.updatedAt = new Date();

    // Invalidate cache
    this.invalidateSettingsCache();

    return this.settingsRepository.save(settings);
  }

  private validateWeeklyHours(weeklyHours: WeeklyHours): void {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
    
    for (const day of days) {
      const dayHours = weeklyHours[day];
      if (!dayHours) {
        throw new BadRequestException(`Missing hours for ${day}`);
      }

      if (dayHours.closed) {
        // If closed, hours don't matter
        continue;
      }

      // Validate openHour
      if (dayHours.openHour === undefined || dayHours.openHour < 0 || dayHours.openHour > 23) {
        throw new BadRequestException(`${day}: openHour must be 0-23`);
      }

      // Validate closeHour
      if (dayHours.closeHour === undefined || dayHours.closeHour < 1 || dayHours.closeHour > 23) {
        throw new BadRequestException(`${day}: closeHour must be 1-23`);
      }

      // Validate openHour < closeHour
      if (dayHours.openHour >= dayHours.closeHour) {
        throw new BadRequestException(`${day}: openHour must be less than closeHour`);
      }
    }
  }

  getWeeklyHoursForDay(settings: AppSettings, dayOfWeek: number): { openHour: number; closeHour: number; closed: boolean } | null {
    // dayOfWeek: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Convert to our format: monday = 1, ..., sunday = 0
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    const dayName = dayNames[dayOfWeek];

    if (!settings.weeklyHours) {
      // Fallback to legacy openHour/closeHour
      if (settings.openHour !== null && settings.closeHour !== null) {
        return {
          openHour: settings.openHour,
          closeHour: settings.closeHour,
          closed: false,
        };
      }
      return null;
    }

    const dayHours = settings.weeklyHours[dayName];
    if (!dayHours) {
      return null;
    }

    return dayHours;
  }

  async getCachedSettings(): Promise<any> {
    const now = Date.now();
    
    // Jeśli cache jest aktualny, zwróć go
    if (this.settingsCache && (now - this.cacheTimestamp) < this.CACHE_TTL) {
      return this.settingsCache;
    }

    // Pobierz nowe ustawienia z bazy danych
    const row = await this.settingsRepository.findOne({ where: { id: 1 } });

    this.settingsCache = {
      TIMEZONE: row?.timezone ?? 'Europe/Warsaw',
      OPEN_HOUR: row?.openHour ?? 10,
      CLOSE_HOUR: row?.closeHour ?? 22,
      SLOT_INTERVAL_MINUTES: row?.slotIntervalMinutes ?? 60,
      HOLD_DURATION_MINUTES: row?.holdDurationMinutes ?? 30,
      PRICE_BOWLING_PER_HOUR: row?.priceBowlingPerHour ?? 12000,
      PRICE_BILLIARDS_PER_HOUR: row?.priceBilliardsPerHour ?? 5000,
      PRICE_KARAOKE_PER_PERSON_PER_HOUR: row?.priceKaraokePerPersonPerHour ?? 4000,
      PRICE_QUIZ_PER_PERSON_PER_SESSION: row?.priceQuizPerPersonPerSession ?? 5000,
      BILLIARDS_TABLES_COUNT: row?.billiardsTablesCount ?? 4,
      BOWLING_MIN_DURATION_HOURS: row?.bowlingMinDurationHours ?? 1,
      BOWLING_MAX_DURATION_HOURS: row?.bowlingMaxDurationHours ?? 3,
      QUIZ_DURATION_HOURS: row?.quizDurationHours ?? 1,
      QUIZ_MAX_PEOPLE: row?.quizMaxPeople ?? 8,
      KARAOKE_MIN_DURATION_HOURS: row?.karaokeMinDurationHours ?? 1,
      KARAOKE_MAX_DURATION_HOURS: row?.karaokeMaxDurationHours ?? 4,
      KARAOKE_MAX_PEOPLE: row?.karaokeMaxPeople ?? 10,
      P24_MERCHANT_ID: row?.p24MerchantId ?? '',
      P24_POS_ID: row?.p24PosId ?? '',
      P24_CRC: row?.p24Crc ?? '',
      P24_API_KEY: row?.p24ApiKey ?? '',
      P24_MODE: row?.p24Mode ?? 'mock',
      P24_RETURN_URL: row?.p24ReturnUrl ?? '',
      P24_STATUS_URL: row?.p24StatusUrl ?? '',
      DEMO_MODE: row?.demoMode ?? true,
      SENDER_EMAIL: row?.senderEmail ?? '',
      SENDER_NAME: row?.senderName ?? '',
      SMTP_HOST: row?.smtpHost ?? '',
      SMTP_PORT: row?.smtpPort ?? null,
      SMTP_USER: row?.smtpUser ?? '',
      SMTP_PASSWORD: row?.smtpPassword ?? '',
      SMTP_SECURE: row?.smtpSecure ?? true,
      CONTACT_FORM_EMAIL_TEMPLATE: row?.contactFormEmailTemplate ?? null,
      WEEKLY_HOURS: row?.weeklyHours ?? null
    };

    this.cacheTimestamp = now;
    return this.settingsCache;
  }

  invalidateSettingsCache(): void {
    this.settingsCache = null;
    this.cacheTimestamp = 0;
  }

  async refreshSettingsCache(): Promise<any> {
    this.invalidateSettingsCache();
    return this.getCachedSettings();
  }

  async logAudit(payload: {
    actorUserId?: number | null;
    action: AuditAction;
    entityType: AuditEntityType;
    entityId: string;
    before?: unknown;
    after?: unknown;
    reason?: string | null;
  }): Promise<void> {
    try {
      const auditLog = this.auditLogRepository.create({
        actorUserId: payload.actorUserId ?? null,
        action: payload.action,
        entityType: payload.entityType,
        entityId: payload.entityId,
        before: payload.before ? JSON.stringify(payload.before) : null,
        after: payload.after ? JSON.stringify(payload.after) : null,
        reason: payload.reason ?? null,
        createdAt: new Date()
      });
      
      await this.auditLogRepository.save(auditLog);
    } catch (error) {
      // Audit logs must never break the main flow
      console.error('Failed to persist audit log', { error });
    }
  }
}
