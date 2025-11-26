import { Controller, Get, Put, Body, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminSettingsService, SettingsInput } from './admin-settings.service';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../database/entities';

@ApiTags('admin-settings')
@Controller('admin/settings')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminSettingsController {
  constructor(@Inject(AdminSettingsService) private adminSettingsService: AdminSettingsService) {console.log('AdminSettingsController constructor called');}

  @Get()
  @ApiOperation({ summary: 'Get application settings' })
  async getSettings() {
    const settings = await this.adminSettingsService.getSettings();
    // Convert camelCase to UPPER_SNAKE_CASE for frontend compatibility
    return { 
      settings: {
        TIMEZONE: settings.timezone,
        OPEN_HOUR: settings.openHour,
        CLOSE_HOUR: settings.closeHour,
        SLOT_INTERVAL_MINUTES: settings.slotIntervalMinutes,
        HOLD_DURATION_MINUTES: settings.holdDurationMinutes,
        PRICE_BOWLING_PER_HOUR: settings.priceBowlingPerHour,
        PRICE_BILLIARDS_PER_HOUR: settings.priceBilliardsPerHour,
        PRICE_KARAOKE_PER_PERSON_PER_HOUR: settings.priceKaraokePerPersonPerHour,
        PRICE_QUIZ_PER_PERSON_PER_SESSION: settings.priceQuizPerPersonPerSession,
        BILLIARDS_TABLES_COUNT: settings.billiardsTablesCount,
        BOWLING_MIN_DURATION_HOURS: settings.bowlingMinDurationHours,
        BOWLING_MAX_DURATION_HOURS: settings.bowlingMaxDurationHours,
        QUIZ_DURATION_HOURS: settings.quizDurationHours,
        QUIZ_MAX_PEOPLE: settings.quizMaxPeople,
        KARAOKE_MIN_DURATION_HOURS: settings.karaokeMinDurationHours,
        KARAOKE_MAX_DURATION_HOURS: settings.karaokeMaxDurationHours,
        KARAOKE_MAX_PEOPLE: settings.karaokeMaxPeople,
        P24_MERCHANT_ID: settings.p24MerchantId,
        P24_POS_ID: settings.p24PosId,
        P24_CRC: settings.p24Crc,
        P24_API_KEY: settings.p24ApiKey,
        P24_MODE: settings.p24Mode,
        P24_RETURN_URL: settings.p24ReturnUrl,
        P24_STATUS_URL: settings.p24StatusUrl,
        DEMO_MODE: settings.demoMode,
        SENDER_EMAIL: settings.senderEmail,
        SENDER_NAME: settings.senderName,
        SMTP_HOST: settings.smtpHost,
        SMTP_PORT: settings.smtpPort,
        SMTP_USER: settings.smtpUser,
        SMTP_PASSWORD: settings.smtpPassword,
        SMTP_SECURE: settings.smtpSecure,
        CONTACT_FORM_EMAIL_TEMPLATE: settings.contactFormEmailTemplate,
        WEEKLY_HOURS: settings.weeklyHours
      }
    };
  }

  @Put()
  @ApiOperation({ summary: 'Update application settings' })
  async updateSettings(@Body() input: any) {
    // Convert UPPER_SNAKE_CASE from frontend to camelCase for backend
    // Only include fields that are actually provided (not undefined)
    const camelCaseInput: SettingsInput = {};
    
    if (input.TIMEZONE !== undefined) camelCaseInput.timezone = input.TIMEZONE;
    if (input.OPEN_HOUR !== undefined) camelCaseInput.openHour = input.OPEN_HOUR;
    if (input.CLOSE_HOUR !== undefined) camelCaseInput.closeHour = input.CLOSE_HOUR;
    if (input.SLOT_INTERVAL_MINUTES !== undefined) camelCaseInput.slotIntervalMinutes = input.SLOT_INTERVAL_MINUTES;
    if (input.HOLD_DURATION_MINUTES !== undefined) camelCaseInput.holdDurationMinutes = input.HOLD_DURATION_MINUTES;
    if (input.PRICE_BOWLING_PER_HOUR !== undefined) camelCaseInput.priceBowlingPerHour = input.PRICE_BOWLING_PER_HOUR;
    if (input.PRICE_BILLIARDS_PER_HOUR !== undefined) camelCaseInput.priceBilliardsPerHour = input.PRICE_BILLIARDS_PER_HOUR;
    if (input.PRICE_KARAOKE_PER_PERSON_PER_HOUR !== undefined) camelCaseInput.priceKaraokePerPersonPerHour = input.PRICE_KARAOKE_PER_PERSON_PER_HOUR;
    if (input.PRICE_QUIZ_PER_PERSON_PER_SESSION !== undefined) camelCaseInput.priceQuizPerPersonPerSession = input.PRICE_QUIZ_PER_PERSON_PER_SESSION;
    if (input.BILLIARDS_TABLES_COUNT !== undefined) camelCaseInput.billiardsTablesCount = input.BILLIARDS_TABLES_COUNT;
    if (input.BOWLING_MIN_DURATION_HOURS !== undefined) camelCaseInput.bowlingMinDurationHours = input.BOWLING_MIN_DURATION_HOURS;
    if (input.BOWLING_MAX_DURATION_HOURS !== undefined) camelCaseInput.bowlingMaxDurationHours = input.BOWLING_MAX_DURATION_HOURS;
    if (input.QUIZ_DURATION_HOURS !== undefined) camelCaseInput.quizDurationHours = input.QUIZ_DURATION_HOURS;
    if (input.QUIZ_MAX_PEOPLE !== undefined) camelCaseInput.quizMaxPeople = input.QUIZ_MAX_PEOPLE;
    if (input.KARAOKE_MIN_DURATION_HOURS !== undefined) camelCaseInput.karaokeMinDurationHours = input.KARAOKE_MIN_DURATION_HOURS;
    if (input.KARAOKE_MAX_DURATION_HOURS !== undefined) camelCaseInput.karaokeMaxDurationHours = input.KARAOKE_MAX_DURATION_HOURS;
    if (input.KARAOKE_MAX_PEOPLE !== undefined) camelCaseInput.karaokeMaxPeople = input.KARAOKE_MAX_PEOPLE;
    if (input.P24_MERCHANT_ID !== undefined) camelCaseInput.p24MerchantId = input.P24_MERCHANT_ID;
    if (input.P24_POS_ID !== undefined) camelCaseInput.p24PosId = input.P24_POS_ID;
    if (input.P24_CRC !== undefined) camelCaseInput.p24Crc = input.P24_CRC;
    if (input.P24_API_KEY !== undefined) camelCaseInput.p24ApiKey = input.P24_API_KEY;
    if (input.P24_MODE !== undefined) camelCaseInput.p24Mode = input.P24_MODE;
    if (input.P24_RETURN_URL !== undefined) camelCaseInput.p24ReturnUrl = input.P24_RETURN_URL;
    if (input.P24_STATUS_URL !== undefined) camelCaseInput.p24StatusUrl = input.P24_STATUS_URL;
    if (input.DEMO_MODE !== undefined) camelCaseInput.demoMode = input.DEMO_MODE;
    if (input.SENDER_EMAIL !== undefined) camelCaseInput.senderEmail = input.SENDER_EMAIL;
    if (input.SENDER_NAME !== undefined) camelCaseInput.senderName = input.SENDER_NAME;
    if (input.SMTP_HOST !== undefined) camelCaseInput.smtpHost = input.SMTP_HOST;
    if (input.SMTP_PORT !== undefined) camelCaseInput.smtpPort = input.SMTP_PORT;
    if (input.SMTP_USER !== undefined) camelCaseInput.smtpUser = input.SMTP_USER;
    if (input.SMTP_PASSWORD !== undefined) camelCaseInput.smtpPassword = input.SMTP_PASSWORD;
    if (input.SMTP_SECURE !== undefined) camelCaseInput.smtpSecure = input.SMTP_SECURE;
    if (input.CONTACT_FORM_EMAIL_TEMPLATE !== undefined) camelCaseInput.contactFormEmailTemplate = input.CONTACT_FORM_EMAIL_TEMPLATE;
    if (input.WEEKLY_HOURS !== undefined) camelCaseInput.weeklyHours = input.WEEKLY_HOURS;
    
    const updated = await this.adminSettingsService.updateSettings(camelCaseInput);
    return { ok: true, updatedAt: updated.updatedAt };
  }
}
