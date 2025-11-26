import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'node:crypto';
import axios from 'axios';
import { addMinutes, differenceInMinutes } from 'date-fns';
import { Order, ReservedSlot, OrderStatus, SlotStatus, PaymentMethod, PaymentTransaction, PaymentTransactionStatus } from '../../database/entities';
import { GlobalSettingsService } from '../settings/global-settings.service';
import { EmailService } from '../email/email.service';

export type RegisterPayload = {
  sessionId: string;
  amount: number;
  currency: string;
  description: string;
  email: string;
  country?: string;
  language?: string;
};

export type RegisterResult = {
  sessionId: string;
  redirectUrl: string;
};

export type WebhookPayload = {
  merchantId: number;
  posId: number;
  sessionId: string;
  orderId: number;
  amount: number;
  currency: string;
  sign: string;
  // Dodatkowe pola wymagane dla podpisu webhooka
  originAmount?: number;
  methodId?: number;
  statement?: string;
};

export type CheckoutResult = {
  orderId: string;
  redirectUrl: string;
  sessionId: string;
};

const ENDPOINTS = {
  production: 'https://secure.przelewy24.pl',
  sandbox: 'https://sandbox.przelewy24.pl'
} as const;

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(ReservedSlot)
    private reservedSlotRepository: Repository<ReservedSlot>,
    @InjectRepository(PaymentTransaction)
    private paymentTransactionRepository: Repository<PaymentTransaction>,
 
    @Inject(ConfigService)
    private configService: ConfigService,
    @Inject(DataSource)
    private dataSource: DataSource,
    @Inject(GlobalSettingsService)
    private readonly globalSettingsService: GlobalSettingsService,
    @Inject(EmailService)
    private readonly emailService: EmailService,
  ) {}

  /**
   * Calculates dynamic TTL for hold based on order type, payment method, and timing
   */
  async calculateHoldTTL(order: Order, reservedSlots: ReservedSlot[]): Promise<number> {
    const settings = await this.globalSettingsService.getGlobalSettings();
    const now = new Date();

    // Find the earliest start time from reserved slots
    const earliestStartTime = reservedSlots.length > 0
      ? new Date(Math.min(...reservedSlots.map(slot => new Date(slot.startTime).getTime())))
      : null;

    // For onsite payments (PENDING_ONSITE), use special logic
    if (order.paymentMethod === PaymentMethod.ON_SITE_CASH || order.paymentMethod === PaymentMethod.ON_SITE_CARD) {
      if (!earliestStartTime) {
        // Fallback to default if no slots
        return settings.holdTtlOnsiteBeforeStartMinutes || 45;
      }

      const minutesUntilStart = differenceInMinutes(earliestStartTime, now);
      
      // If reservation has already started, use grace period
      if (minutesUntilStart <= 0) {
        return settings.holdTtlOnsiteGraceAfterStartMinutes || 7;
      }

      // Calculate TTL: time until start + grace period
      // But cap it at holdTtlOnsiteBeforeStartMinutes before start
      const ttlBeforeStart = Math.min(
        minutesUntilStart,
        settings.holdTtlOnsiteBeforeStartMinutes || 45
      );
      return ttlBeforeStart;
    }

    // For online payments
    let ttl = settings.holdTtlOnlineMinutes || 15;

    // Check if it's a last-minute reservation
    if (earliestStartTime) {
      const minutesUntilStart = differenceInMinutes(earliestStartTime, now);
      const lastMinuteThreshold = settings.lastMinuteThresholdMinutes || 60;

      if (this.isLastMinuteReservation(earliestStartTime, lastMinuteThreshold)) {
        ttl = settings.holdTtlLastMinuteMinutes || 7;
      }
    }

    // Check if it's peak hours
    if (this.isPeakHours(now, {
      start: settings.peakHoursStart || 17,
      end: settings.peakHoursEnd || 22,
    })) {
      // Use the shorter of peak hours TTL or current TTL
      const peakHoursTtl = settings.holdTtlPeakHoursMinutes || 10;
      ttl = Math.min(ttl, peakHoursTtl);
    }

    return ttl;
  }

  /**
   * Checks if reservation is last-minute (within threshold)
   */
  isLastMinuteReservation(startTime: Date, thresholdMinutes: number): boolean {
    const now = new Date();
    const minutesUntilStart = differenceInMinutes(startTime, now);
    return minutesUntilStart > 0 && minutesUntilStart <= thresholdMinutes;
  }

  /**
   * Checks if current time is within peak hours
   */
  isPeakHours(now: Date, peakHoursConfig: { start: number; end: number }): boolean {
    const currentHour = now.getHours();
    return currentHour >= peakHoursConfig.start && currentHour < peakHoursConfig.end;
  }

  /**
   * Logs or updates a payment transaction with status history
   */
  private async logPaymentTransaction(
    orderId: string,
    sessionId: string,
    status: PaymentTransactionStatus,
    data: {
      p24OrderId?: number;
      amount?: number;
      currency?: string;
      method?: string;
      webhookSignature?: string;
      verifyResponse?: Record<string, unknown>;
      reason?: string;
    } = {},
  ): Promise<PaymentTransaction> {
    const now = new Date();
    
    // Find existing transaction by orderId and sessionId
    let transaction = await this.paymentTransactionRepository.findOne({
      where: { orderId, sessionId },
    });

    const statusHistoryEntry = {
      status,
      timestamp: now,
      ...(data.reason ? { reason: data.reason } : {}),
    };

    if (transaction) {
      // Update existing transaction
      const existingHistory = transaction.statusHistory || [];
      transaction.status = status;
      transaction.statusHistory = [...existingHistory, statusHistoryEntry];
      if (data.p24OrderId !== undefined) transaction.p24OrderId = data.p24OrderId;
      if (data.amount !== undefined) transaction.amount = data.amount;
      if (data.currency !== undefined) transaction.currency = data.currency;
      if (data.method !== undefined) transaction.method = data.method;
      if (data.webhookSignature !== undefined) transaction.webhookSignature = data.webhookSignature;
      if (data.verifyResponse !== undefined) transaction.verifyResponse = data.verifyResponse;
    } else {
      // Create new transaction
      transaction = this.paymentTransactionRepository.create({
        orderId,
        sessionId,
        p24OrderId: data.p24OrderId,
        amount: data.amount || 0,
        currency: data.currency || 'PLN',
        method: data.method,
        status,
        statusHistory: [statusHistoryEntry],
        webhookSignature: data.webhookSignature,
        verifyResponse: data.verifyResponse,
      });
    }

    return await this.paymentTransactionRepository.save(transaction);
  }

  async initiateCheckout(orderId: string): Promise<CheckoutResult> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'reservedSlots'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException('Order is already paid');
    }

    const now = new Date();

    if (order.holdExpiresAt && order.holdExpiresAt <= now) {
      throw new BadRequestException('Hold has expired');
    }

    // Use orderId as part of sessionId for idempotency
    const rawSessionId = order.p24SessionId ?? `ORD-${order.id}-${now.getTime()}`;
    const sessionId = rawSessionId.replace(/-/g, '');

    const payment = await this.registerTransaction({
      sessionId,
      amount: order.totalAmount,
      currency: order.currency,
      description: order.items[0]?.description ?? `Order ${order.id}`,
      email: order.customerEmail,
      language: 'pl',
      country: 'PL',
    });

    // Calculate dynamic TTL based on order and slots
    const holdDurationMinutes = await this.calculateHoldTTL(order, order.reservedSlots || []);
    const extendedHold = addMinutes(now, holdDurationMinutes);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(Order, { id: order.id }, {
        status: OrderStatus.PENDING_PAYMENT,
        paymentMethod: PaymentMethod.ONLINE,
        p24SessionId: payment.sessionId,
        holdExpiresAt: extendedHold,
      });

      await queryRunner.manager.update(ReservedSlot, { orderId: order.id }, {
        status: SlotStatus.HOLD,
        expiresAt: extendedHold,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    // Log payment transaction creation
    await this.logPaymentTransaction(order.id, payment.sessionId, PaymentTransactionStatus.PENDING, {
      amount: order.totalAmount,
      currency: order.currency,
    });

    return {
      orderId: order.id,
      redirectUrl: payment.redirectUrl,
      sessionId: payment.sessionId,
    };
  }

  async handleP24Webhook(payload: WebhookPayload): Promise<void> {
    if (!(await this.verifyWebhookSignature(payload))) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const settings = await this.globalSettingsService.getGlobalSettings();
    const merchantId = settings.p24MerchantId;
    const posId = settings.p24PosId;

    if (merchantId && Number(merchantId) !== payload.merchantId) {
      throw new BadRequestException('Merchant ID mismatch');
    }

    if (posId && Number(posId) !== payload.posId) {
      throw new BadRequestException('POS ID mismatch');
    }

    const order = await this.orderRepository.findOne({
      where: { p24SessionId: payload.sessionId },
      relations: ['reservedSlots'],
    });

    if (!order) {
      throw new NotFoundException('Order not found for provided session');
    }

    if (order.totalAmount !== payload.amount || order.currency !== payload.currency) {
      throw new BadRequestException('Amount or currency mismatch');
    }

    // WERYFIKACJA TRANSAKCJI przez API Przelewy24 (trnVerify)
    // Zgodnie z dokumentacją: weryfikacja musi być w webhooku (urlStatus), nie w return
    let verifyResponse: Record<string, unknown> = {};
    if (settings.p24Mode === 'production' || settings.p24Mode === 'sandbox') {
      verifyResponse = await this.verifyTransaction(payload);
    }

    // Log webhook received
    const webhookSignature = payload.sign;
    await this.logPaymentTransaction(order.id, payload.sessionId, PaymentTransactionStatus.PENDING, {
      p24OrderId: payload.orderId,
      amount: payload.amount,
      currency: payload.currency,
      method: payload.methodId?.toString(),
      webhookSignature,
      verifyResponse,
    });

    // Idempotency check: if already paid, log success and return
    if (order.status === OrderStatus.PAID) {
      await this.logPaymentTransaction(order.id, payload.sessionId, PaymentTransactionStatus.SUCCESS, {
        p24OrderId: payload.orderId,
        amount: payload.amount,
        currency: payload.currency,
        method: payload.methodId?.toString(),
        webhookSignature,
        verifyResponse,
        reason: 'Already paid (idempotency)',
      });
      return;
    }

    const now = new Date();
    const isLatePayment = order.holdExpiresAt && order.holdExpiresAt < now;

    // Handle late payment success
    if (isLatePayment) {
      await this.processLatePaymentSuccess(order, payload, verifyResponse);
      return;
    }

    // Normal payment success flow
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Use SELECT FOR UPDATE to lock the order and prevent race conditions
      const lockedOrder = await queryRunner.manager.findOne(Order, {
        where: { id: order.id },
        lock: { mode: 'pessimistic_write' },
        relations: ['reservedSlots'],
      });

      if (!lockedOrder) {
        throw new NotFoundException('Order not found');
      }

      // Double-check idempotency after acquiring lock
      if (lockedOrder.status === OrderStatus.PAID) {
        await queryRunner.rollbackTransaction();
        await this.logPaymentTransaction(order.id, payload.sessionId, PaymentTransactionStatus.SUCCESS, {
          p24OrderId: payload.orderId,
          amount: payload.amount,
          currency: payload.currency,
          method: payload.methodId?.toString(),
          webhookSignature,
          verifyResponse,
          reason: 'Already paid (idempotency after lock)',
        });
        return;
      }

      await queryRunner.manager.update(Order, { id: order.id }, {
        status: OrderStatus.PAID,
        paymentMethod: PaymentMethod.ONLINE,
        paidAt: new Date(),
        p24OrderId: payload.orderId,
      });

      await queryRunner.manager.update(ReservedSlot, { orderId: order.id }, {
        status: SlotStatus.BOOKED,
        expiresAt: null,
      });

      await queryRunner.commitTransaction();

      // Log successful payment
      await this.logPaymentTransaction(order.id, payload.sessionId, PaymentTransactionStatus.SUCCESS, {
        p24OrderId: payload.orderId,
        amount: payload.amount,
        currency: payload.currency,
        method: payload.methodId?.toString(),
        webhookSignature,
        verifyResponse,
      });

      // Send confirmation email asynchronously
      setTimeout(() => {
        this.emailService.sendOrderConfirmationEmail(order.id).catch((emailError) => {
          // Email errors are already logged in EmailService
        });
      }, 1000);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      // Log failed payment
      await this.logPaymentTransaction(order.id, payload.sessionId, PaymentTransactionStatus.FAILED, {
        p24OrderId: payload.orderId,
        amount: payload.amount,
        currency: payload.currency,
        method: payload.methodId?.toString(),
        webhookSignature,
        verifyResponse,
        reason: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Processes late payment success (payment after hold expired)
   */
  private async processLatePaymentSuccess(
    order: Order,
    payload: WebhookPayload,
    verifyResponse: Record<string, unknown>,
  ): Promise<void> {
    const webhookSignature = payload.sign;

    // Try to rebook the expired order
    const rebooked = await this.tryRebookExpiredOrder(order.id, order.reservedSlots || []);

    if (rebooked) {
      // Successfully rebooked - mark as paid
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await queryRunner.manager.update(Order, { id: order.id }, {
          status: OrderStatus.PAID,
          paymentMethod: PaymentMethod.ONLINE,
          paidAt: new Date(),
          p24OrderId: payload.orderId,
        });

        await queryRunner.manager.update(ReservedSlot, { orderId: order.id }, {
          status: SlotStatus.BOOKED,
          expiresAt: null,
        });

        await queryRunner.commitTransaction();

        // Log successful rebook
        await this.logPaymentTransaction(order.id, payload.sessionId, PaymentTransactionStatus.SUCCESS, {
          p24OrderId: payload.orderId,
          amount: payload.amount,
          currency: payload.currency,
          method: payload.methodId?.toString(),
          webhookSignature,
          verifyResponse,
          reason: 'Late payment - successfully rebooked',
        });

        // Send confirmation email
        setTimeout(() => {
          this.emailService.sendOrderConfirmationEmail(order.id).catch(() => {});
        }, 1000);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } else {
      // Slot is taken - refund the payment
      await this.refundTransaction(payload.orderId, payload.amount, 'Late payment - slot no longer available');
      
      // Log refund
      await this.logPaymentTransaction(order.id, payload.sessionId, PaymentTransactionStatus.REFUNDED, {
        p24OrderId: payload.orderId,
        amount: payload.amount,
        currency: payload.currency,
        method: payload.methodId?.toString(),
        webhookSignature,
        verifyResponse,
        reason: 'Late payment - slot taken, refunded',
      });

      // Send late payment slot taken email
      await this.emailService.sendLatePaymentSlotTakenEmail(order.id);
    }
  }

  /**
   * Attempts to rebook an expired order if slots are still available
   * Uses SELECT FOR UPDATE to lock resources and prevent race conditions
   */
  private async tryRebookExpiredOrder(orderId: string, reservedSlots: ReservedSlot[]): Promise<boolean> {
    if (reservedSlots.length === 0) {
      return false;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock all affected resources and check availability
      const resourceIds = Array.from(new Set(reservedSlots.map(slot => slot.resourceId)));
      
      for (const resourceId of resourceIds) {
        // Lock the resource
        await queryRunner.query(
          'SELECT * FROM resources WHERE id = ? FOR UPDATE',
          [resourceId]
        );

        // Check if any slots for this resource are still available
        const slotsForResource = reservedSlots.filter(slot => slot.resourceId === resourceId);
        
        for (const slot of slotsForResource) {
          // Check if slot is still available (not booked by another order)
          const conflictingSlots = await queryRunner.query(
            `SELECT * FROM reserved_slots 
             WHERE resourceId = ? 
             AND status = 'BOOKED'
             AND startTime < ? 
             AND endTime > ?`,
            [resourceId, slot.endTime, slot.startTime]
          );

          if (conflictingSlots.length > 0) {
            // Slot is taken
            await queryRunner.rollbackTransaction();
            return false;
          }
        }
      }

      // All slots are available - rebook them
      await queryRunner.manager.update(ReservedSlot, { orderId }, {
        status: SlotStatus.BOOKED,
        expiresAt: null,
      });

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Refunds a transaction through P24 API
   */
  private async refundTransaction(p24OrderId: number, amount: number, reason: string): Promise<void> {
    const settings = await this.globalSettingsService.getGlobalSettings();
    const mode = settings.p24Mode;
    const merchantId = settings.p24MerchantId;
    const posId = settings.p24PosId;
    const apiKey = settings.p24ApiKey;

    if (mode === 'mock' || !merchantId || !posId || !apiKey) {
      // In mock mode, just log the refund
      return;
    }

    const baseUrl = mode === 'production' ? ENDPOINTS.production : ENDPOINTS.sandbox;

    // Calculate refund signature according to P24 documentation
    const refundPayload = {
      orderId: p24OrderId,
      amount,
      currency: 'PLN',
      crc: settings.p24Crc,
    };

    const jsonString = JSON.stringify(refundPayload);
    const sign = createHash('sha384').update(jsonString).digest('hex');

    const refundBody = {
      orderId: p24OrderId,
      amount,
      currency: 'PLN',
      sign,
    };

    const auth = Buffer.from(`${posId}:${apiKey}`, 'utf-8').toString('base64');

    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/transaction/refund`,
        refundBody,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${auth}`,
          },
          timeout: 10_000,
        }
      );

      if (!response.data?.data || response.data.data.status !== 'success') {
        throw new Error('Refund failed: ' + JSON.stringify(response.data));
      }
    } catch (error) {
      throw new Error(`Failed to refund transaction ${p24OrderId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async verifyWebhookSignature(payload: WebhookPayload): Promise<boolean> {
    try {
      const expected = await this.computeWebhookSignature(payload);
      return expected === payload.sign;
    } catch (error) {
      return false;
    }
  }

  private async computeWebhookSignature(payload: WebhookPayload): Promise<string> {
    const settings = await this.globalSettingsService.getGlobalSettings();
    const merchantId = settings.p24MerchantId;
    const posId = settings.p24PosId;
    const crc = settings.p24Crc;
    
    if (!crc || !merchantId || !posId) {
      throw new Error('Przelewy24 credentials are not configured');
    }
    
    // Kolejność pól zgodna z dokumentacją Przelewy24 dla webhooka:
    // merchantId, posId, sessionId, amount, originAmount, currency, orderId, methodId, statement, crc
    const signaturePayload = {
      merchantId: Number(merchantId),
      posId: Number(posId),
      sessionId: payload.sessionId,
      amount: payload.amount,
      originAmount: payload.originAmount ?? payload.amount, // Jeśli nie ma originAmount, użyj amount
      currency: payload.currency,
      orderId: payload.orderId,
      methodId: payload.methodId ?? 0, // Jeśli nie ma methodId, użyj 0
      statement: payload.statement ?? '', // Jeśli nie ma statement, użyj pustego stringa
      crc: crc,
    };
    
    // JSON.stringify w Node.js domyślnie nie escapuje slashów i poprawnie obsługuje unicode
    // Odpowiednik JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES z PHP
    const jsonString = JSON.stringify(signaturePayload);
    const signature = createHash('sha384').update(jsonString).digest('hex');
    return signature;
  }

  private async registerTransaction(payload: RegisterPayload): Promise<RegisterResult> {
    const sessionId = payload.sessionId || randomUUID();

    const settings = await this.globalSettingsService.getGlobalSettings();
    const mode = settings.p24Mode;
    const merchantId = settings.p24MerchantId;
    const posId = settings.p24PosId;
    const apiKey = settings.p24ApiKey;
    
    // urlReturn powinien wskazywać na FRONTEND (urlReturn = powrót klienta/UI)
    // urlStatus wskazuje na backend webhook (urlStatus = webhook/logika/verify)
    const allowedOrigins = this.configService.get<string>('ALLOWED_ORIGINS', '');
    const frontendUrl = allowedOrigins ? allowedOrigins.split(',')[0].trim() : 'http://localhost:3000';
    const returnUrl = settings.p24ReturnUrl || `${frontendUrl}/rezerwacje/powrot`;
    const statusUrl = settings.p24StatusUrl || `${this.configService.get('APP_URL')}/payments/p24/webhook`;

    if (
      mode === 'mock' ||
      !merchantId ||
      !posId ||
      !apiKey
    ) {
      const redirectUrl = `${returnUrl}?sessionId=${sessionId}&status=mock`;
      return { sessionId, redirectUrl };
    }

    const baseUrl = mode === 'production' ? ENDPOINTS.production : ENDPOINTS.sandbox;

    const registerBody = {
      merchantId: Number(merchantId),
      posId: Number(posId),
      sessionId,
      amount: payload.amount,
      currency: payload.currency,
      description: payload.description,
      email: payload.email,
      country: payload.country ?? 'PL',
      language: payload.language ?? 'pl',
      urlReturn: returnUrl,
      urlStatus: statusUrl,
      waitForResult:true,
      sign: await this.computeRegisterSignature({
        sessionId,
        amount: payload.amount,
        currency: payload.currency,
      }),
    };

    const auth = Buffer.from(`${posId}:${apiKey}`, 'utf-8').toString('base64');

    const response = await axios.post(
      `${baseUrl}/api/v1/transaction/register`,
      registerBody,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        timeout: 10_000,
      }
    );

    if (!response.data?.data) {
      throw new Error('Unexpected Przelewy24 response');
    }

    const { token, redirectUrl } = response.data.data;
    const finalRedirect = redirectUrl ?? `${baseUrl}/trnRequest/${token}`;

    return { sessionId, redirectUrl: finalRedirect };
  }

  private async computeRegisterSignature({
    sessionId,
    amount,
    currency,
  }: {
    sessionId: string;
    amount: number;
    currency: string;
  }): Promise<string> {
    const settings = await this.globalSettingsService.getGlobalSettings();
    const merchantId = settings.p24MerchantId;
    const crc = settings.p24Crc;

    if (!crc || Number.isNaN(merchantId)) {
      throw new Error('Przelewy24 credentials are not configured');
    }

    // Create signature with fixed order as per P24 documentation
    const signaturePayload = {
      sessionId,
      merchantId: Number(merchantId),
      amount,
      currency,
      crc,
    };
    
    const json = JSON.stringify(signaturePayload);
    const signature = createHash('sha384').update(json).digest('hex');
    return signature;
  }

  private createSignature(payload: Record<string, unknown>): string {
    const normalized = Object.fromEntries(
      Object.entries(payload).sort(([a], [b]) => a.localeCompare(b))
    );
    const json = JSON.stringify(normalized);
    const signature = createHash('sha384').update(json).digest('hex');
    return signature;
  }

  private async verifyTransaction(payload: WebhookPayload): Promise<Record<string, unknown>> {
    const settings = await this.globalSettingsService.getGlobalSettings();
    const mode = settings.p24Mode;
    const merchantId = settings.p24MerchantId;
    const posId = settings.p24PosId;
    const apiKey = settings.p24ApiKey;

    if (mode === 'mock' || !merchantId || !posId || !apiKey) {
      return { status: 'mock', data: {} }; // Skip verification in mock mode
    }

    const baseUrl = mode === 'production' ? ENDPOINTS.production : ENDPOINTS.sandbox;

    // Oblicz podpis do weryfikacji (trnVerify)
    const sign = await this.computeVerifySignature({
      sessionId: payload.sessionId,
      orderId: payload.orderId,
      amount: payload.amount,
      currency: payload.currency,
    });

    const verifyBody = {
      merchantId: Number(merchantId),
      posId: Number(posId),
      sessionId: payload.sessionId,
      amount: payload.amount,
      currency: payload.currency,
      orderId: payload.orderId,
      sign,
    };

    const auth = Buffer.from(`${posId}:${apiKey}`, 'utf-8').toString('base64');

    try {
      const response = await axios.put(
        `${baseUrl}/api/v1/transaction/verify`,
        verifyBody,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${auth}`,
          },
          timeout: 10_000,
        }
      );

      if (!response.data?.data || response.data.data.status !== 'success') {
        throw new BadRequestException('Transaction verification failed');
      }

      return response.data;
    } catch (error) {
      throw new BadRequestException('Failed to verify transaction with Przelewy24');
    }
  }

  private async computeVerifySignature({
    sessionId,
    orderId,
    amount,
    currency,
  }: {
    sessionId: string;
    orderId: number;
    amount: number;
    currency: string;
  }): Promise<string> {
    const settings = await this.globalSettingsService.getGlobalSettings();
    const crc = settings.p24Crc;
    if (!crc) {
      throw new Error('Przelewy24 credentials are not configured');
    }
    
    // Sign dla verify: {"sessionId":"str","orderId":int,"amount":int,"currency":"str","crc":"str"}
    // Według dokumentacji P24, kolejność jest ważna i nie sortujemy
    const jsonString = JSON.stringify({
      sessionId,
      orderId,
      amount,
      currency,
      crc,
    }, null, 0); // Brak indentacji, brak escapowania
    
    const signature = createHash('sha384').update(jsonString).digest('hex');
    return signature;
  }

  async getPaymentStatusBySessionId(sessionId: string): Promise<{ status: string; orderId?: string; paidAt?: Date }> {
    const order = await this.orderRepository.findOne({
      where: { p24SessionId: sessionId },
      select: ['id', 'status', 'paidAt'],
    });

    if (!order) {
      throw new NotFoundException('Order not found for provided session');
    }

    return {
      status: order.status,
      orderId: order.id,
      paidAt: order.paidAt || undefined,
    };
  }

  async handleMockPaymentReturn(sessionId: string): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { p24SessionId: sessionId }
    });

    if (!order) {
      throw new NotFoundException('Order not found for mock payment return');
    }

    if (order.status === OrderStatus.PENDING_PAYMENT) {
      const now = new Date();
      
      await this.dataSource.transaction(async (manager) => {
        await manager.update(Order, order.id, {
          status: OrderStatus.PAID,
          paymentMethod: PaymentMethod.ONLINE,
          paidAt: now,
          updatedAt: now
        });

        await manager.update(ReservedSlot, 
          { orderId: order.id },
          {
            status: SlotStatus.BOOKED,
            expiresAt: null,
            updatedAt: now
          }
        );
      });

      // Send confirmation email asynchronously (fire-and-forget)
      this.emailService.sendOrderConfirmationEmail(order.id).catch((emailError) => {
        // Email errors are already logged in EmailService, just catch to prevent unhandled rejection
      });
    }
  }
}
