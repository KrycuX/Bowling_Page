import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Request } from 'express';

import { addMinutes } from 'date-fns';
import { createId } from '@paralleldrive/cuid2';
import {
  Resource, Order, OrderItem, ReservedSlot, SlotStatus, OrderStatus, PaymentMethod, PricingMode, MarketingConsent
} from '../../database/entities';
import { calculatePriceWithSettings, getExpectedPricingMode, sumOrder } from '../../domain/pricing.domain';
import {
  ensureTimeAlignment,
  formatTimeInZone,
  minutesFromTimeString,
  parseDateTime,
  validateStartTimeNotInPast
} from '../../domain/time';
import { CreateHoldDto } from './dto/create-hold.dto';
import { PaymentService } from '../payment/payment.service';
import { GlobalSettingsService } from '../settings/global-settings.service';
import { EmailService } from '../email/email.service';
import { getClientIp } from '../../utils/security';
import { AdminSettingsService } from '../admin/settings/admin-settings.service';
import { DayOffService } from '../admin/day-off/day-off.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(ReservedSlot)
    private reservedSlotRepository: Repository<ReservedSlot>,
    @InjectRepository(MarketingConsent)
    private marketingConsentRepository: Repository<MarketingConsent>,
    @Inject(DataSource)
    private dataSource: DataSource,

    @Inject(PaymentService)
    private readonly paymentService: PaymentService,

    @Inject(GlobalSettingsService)
    private readonly globalSettingsService: GlobalSettingsService,

    @Inject(EmailService)
    private readonly emailService: EmailService,

    @Inject(AdminSettingsService)
    private readonly adminSettingsService: AdminSettingsService,

    @Inject(DayOffService)
    private readonly dayOffService: DayOffService,
  ) {

    console.log('BookingService constructor called');
    console.log('PaymentService:', !!this.paymentService);
    console.log('GlobalSettingsService:', !!this.globalSettingsService);
  }

  /**
   * Generates a user-friendly order number in format YYYY-MM-XXX
   * Thread-safe: uses SELECT FOR UPDATE to prevent race conditions
   */
  private async generateOrderNumber(queryRunner: any): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `${year}-${month}-`;

    // Find the highest order number for this month using SELECT FOR UPDATE
    // This locks the rows to prevent concurrent access
    const result = await queryRunner.manager.query(
      `SELECT orderNumber 
       FROM orders 
       WHERE orderNumber LIKE ? 
       ORDER BY orderNumber DESC 
       LIMIT 1 
       FOR UPDATE`,
      [`${prefix}%`]
    );

    let nextNumber = 1;

    if (result && result.length > 0 && result[0].orderNumber) {
      // Extract the number part (last 3 digits)
      const lastOrderNumber = result[0].orderNumber;
      const numberPart = lastOrderNumber.substring(prefix.length);
      const lastNumber = Number.parseInt(numberPart, 10);
      
      if (!Number.isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    // Format as YYYY-MM-XXX (3 digits with leading zeros)
    const formattedNumber = String(nextNumber).padStart(3, '0');
    return `${prefix}${formattedNumber}`;
  }

  async createHold(payload: CreateHoldDto, request?: Request): Promise<any> {
    const appSettings = await this.globalSettingsService.getGlobalSettings();
    const settings = {
      timezone: appSettings.timezone,
      OPEN_HOUR: appSettings.openHour,
      CLOSE_HOUR: appSettings.closeHour,
      SLOT_INTERVAL_MINUTES: appSettings.slotIntervalMinutes,
      HOLD_DURATION_MINUTES: appSettings.holdDurationMinutes,
    };

    if (payload.items.length === 0) {
      throw new BadRequestException('Select at least one resource to reserve');
    }

    // Fetch resources
    const resourceIds = Array.from(new Set(payload.items.map((item) => item.resourceId)));
    const resources = await this.resourceRepository.findByIds(resourceIds);

    if (resources.length !== resourceIds.length) {
      throw new NotFoundException('One or more resources were not found');
    }

    const resourceMap = new Map(resources.map((resource) => [resource.id, resource]));
    const now = new Date();

    // Validate and prepare items
    const itemContexts = await Promise.all(payload.items.map(async (item, index) => {
      const resource = resourceMap.get(item.resourceId);
      if (!resource) {
        throw new NotFoundException(`Resource with id ${item.resourceId} was not found`);
      }

      if (!Number.isInteger(item.duration) || item.duration <= 0) {
        throw new BadRequestException(`Item ${index + 1} duration must be a positive whole number of hours`);
      }

      // Check if date is a day off
      const isDayOff = await this.dayOffService.isDayOff(item.date);
      if (isDayOff) {
        const dayOff = await this.dayOffService.getDayOff(item.date);
        const reason = dayOff?.reason ? ` (${dayOff.reason})` : '';
        throw new BadRequestException(`Ten dzień jest zamknięty${reason}`);
      }

      // Get day-specific hours
      const dateObj = new Date(item.date + 'T12:00:00');
      const dayOfWeek = dateObj.getDay();
      const dayHours = this.adminSettingsService.getWeeklyHoursForDay(appSettings, dayOfWeek);

      let dayOpenHour: number;
      let dayCloseHour: number;
      let dayClosed = false;

      if (dayHours && dayHours.closed) {
        dayClosed = true;
      } else if (dayHours && !dayHours.closed) {
        dayOpenHour = dayHours.openHour;
        dayCloseHour = dayHours.closeHour;
      } else {
        // Fallback to legacy hours
        if (appSettings.openHour === null || appSettings.closeHour === null) {
          throw new BadRequestException(`Brak skonfigurowanych godzin otwarcia dla dnia ${item.date}`);
        }
        dayOpenHour = appSettings.openHour;
        dayCloseHour = appSettings.closeHour;
      }

      if (dayClosed) {
        throw new BadRequestException(`Ten dzień jest zamknięty zgodnie z konfiguracją godzin otwarcia`);
      }

      // Parse date and time into a Date object
      const startTime = parseDateTime(
        item.date,
        item.start,
        settings.timezone,
        settings.SLOT_INTERVAL_MINUTES
      );

      // Validate that the start time is not in the past
      validateStartTimeNotInPast(startTime, settings.timezone, settings.SLOT_INTERVAL_MINUTES);

      // Validate start time is within business hours
      const startHour = Number.parseInt(item.start.split(':')[0], 10);
      if (startHour < dayOpenHour || startHour >= dayCloseHour) {
        throw new BadRequestException(
          `Godzina rozpoczęcia ${item.start} jest poza godzinami otwarcia (${dayOpenHour}:00 - ${dayCloseHour}:00)`
        );
      }

      // Calculate end time and validate it doesn't exceed close hour
      const endTime = addMinutes(startTime, item.duration * 60);
      const endHour = Number.parseInt(formatTimeInZone(endTime, settings.timezone).split(':')[0], 10);
      if (endHour > dayCloseHour || (endHour === dayCloseHour && formatTimeInZone(endTime, settings.timezone).split(':')[1] !== '00')) {
        throw new BadRequestException(
          `Rezerwacja przekracza godzinę zamknięcia (${dayCloseHour}:00)`
        );
      }

      const pricingMode = getExpectedPricingMode(resource.type);
      const pricing = calculatePriceWithSettings({
        resourceType: resource.type,
        pricingMode,
        durationHours: item.duration,
        peopleCount: item.peopleCount ?? undefined,
        settings: appSettings,
      });

      return {
        resource,
        pricing,
        pricingMode,
        peopleCount: item.peopleCount,
        duration: item.duration,
        startTime: startTime.toISOString(),
        resourceId: item.resourceId,
      };
    }));

    // Create order in transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const orderId = createId();
      const totalAmount = sumOrder(itemContexts.map((context) => context.pricing.totalAmount));

      // Generate user-friendly order number
      const orderNumber = await this.generateOrderNumber(queryRunner);

      // Determine order status based on payment method
      const paymentMethod = (payload.paymentMethod || 'ONLINE') as PaymentMethod;
      const isOnSitePayment = paymentMethod === PaymentMethod.ON_SITE_CASH || paymentMethod === PaymentMethod.ON_SITE_CARD;
      const orderStatus = isOnSitePayment ? OrderStatus.PENDING_ONSITE : OrderStatus.HOLD;

      // Create order
      const order = this.orderRepository.create({
        id: orderId,
        orderNumber,
        customerName: `${payload.customer.firstName} ${payload.customer.lastName}`,
        customerEmail: payload.customer.email,
        customerPhone: payload.customer.phone || null,
        totalAmount,
        currency: 'PLN',
        status: orderStatus,
        paymentMethod,
      });

      await queryRunner.manager.save(order);

      // Create order items and reserved slots
      const reservedSlots = [];
      for (const context of itemContexts) {
        const item = this.orderItemRepository.create({
          orderId: order.id,
          resourceId: context.resourceId,
          quantity: context.pricing.quantity,
          unitAmount: context.pricing.unitAmount,
          totalAmount: context.pricing.totalAmount,
          description: `${context.resource.name}`,
          peopleCount: context.peopleCount,
          pricingMode: PricingMode[context.pricingMode as keyof typeof PricingMode] || PricingMode.PER_RESOURCE_PER_HOUR,
        });
        await queryRunner.manager.save(item);

        // Create reserved slot
        const slot = this.reservedSlotRepository.create({
          resourceId: context.resourceId,
          orderId: order.id,
          startTime: new Date(context.startTime),
          endTime: addMinutes(new Date(context.startTime), context.duration * 60),
          status: SlotStatus.HOLD,
          expiresAt: addMinutes(now, settings.HOLD_DURATION_MINUTES),
        });
        const savedSlot = await queryRunner.manager.save(slot);
        
        // Add to reserved slots array for response
        reservedSlots.push({
          id: savedSlot.id,
          resourceId: savedSlot.resourceId,
          startTime: savedSlot.startTime.toISOString(),
          endTime: savedSlot.endTime.toISOString(),
          status: savedSlot.status,
          expiresAt: savedSlot.expiresAt ? savedSlot.expiresAt.toISOString() : null,
        });
      }

      // Save marketing consent if provided
      if (payload.marketingConsent === true) {
        const consentId = createId();
        const clientIp = request ? getClientIp(request) : null;
        const userAgent = request?.headers?.['user-agent'] || null;
        
        const consent = this.marketingConsentRepository.create({
          id: consentId,
          email: payload.customer.email,
          firstName: payload.customer.firstName,
          lastName: payload.customer.lastName,
          phone: payload.customer.phone || null,
          consentGiven: true,
          consentedAt: new Date(),
          source: 'checkout',
          orderId: order.id,
          clientIp,
          userAgent,
        });
        
        await queryRunner.manager.save(consent);
      }

      await queryRunner.commitTransaction();

      // Send confirmation email for on-site payment reservations
      if ((payload.paymentMethod || 'ONLINE') === 'ON_SITE_CASH') {
        // Send confirmation email asynchronously (fire-and-forget)
        this.emailService.sendOrderConfirmationEmail(order.id).catch((emailError) => {
          // Email errors are already logged in EmailService, just catch to prevent unhandled rejection
        });
      }

      return {
        orderId: order.id,
        holdExpiresAt: addMinutes(now, settings.HOLD_DURATION_MINUTES).toISOString(),
        totalAmount,
        currency: 'PLN',
        reservedSlots,
        requiresOnlinePayment: (payload.paymentMethod || 'ONLINE') === 'ONLINE',
        status: orderStatus,
        paymentMethod: paymentMethod,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async initiateCheckout(orderId: string): Promise<any> {
    return this.paymentService.initiateCheckout(orderId);
  }
}
