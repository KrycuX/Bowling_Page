import { Injectable, NotFoundException, BadRequestException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindOptionsWhere, ILike, In, Between, MoreThanOrEqual, LessThanOrEqual, LessThan, MoreThan } from 'typeorm';
import { addMinutes, subDays, startOfDay, endOfDay, parseISO } from 'date-fns';
import { Order, OrderItem, ReservedSlot, Resource, User, OrderStatus, SlotStatus, PaymentMethod } from '../../../database/entities';
import { calculatePrice, getExpectedPricingMode } from '../../../domain/pricing.domain';
import { AdminSettingsService } from '../settings/admin-settings.service';
import { parseDateTime, validateStartTimeNotInPast } from '../../../domain/time';
import { EmailService } from '../../email/email.service';

export type OrderListQuery = {
  dateFrom?: string;
  dateTo?: string;
  slotDateFrom?: string;
  slotDateTo?: string;
  resourceId?: number;
  resourceType?: string;
  status?: OrderStatus;
  q?: string;
  page?: number;
  pageSize?: number;
};

export type CreateOrderInput = {
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
  };
  items: Array<{
    resourceId: number;
    date: string;
    start: string;
    duration: number;
    peopleCount?: number | null;
    pricingMode: string;
  }>;
  payment: {
    method: 'ON_SITE_CASH' | 'ON_SITE_CARD';
  };
};

export type UpdateOrderInput = {
  customer?: Partial<CreateOrderInput['customer']>;
  items?: CreateOrderInput['items'];
};

@Injectable()
export class AdminOrdersService {
  private readonly DEFAULT_PAGE_SIZE = 20;
  private readonly MAX_PAGE_SIZE = 100;

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(ReservedSlot)
    private reservedSlotRepository: Repository<ReservedSlot>,
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
    @Inject(DataSource)
    private dataSource: DataSource,
    @Inject(AdminSettingsService)
    private adminSettingsService: AdminSettingsService,
    @Inject(EmailService)
    private readonly emailService: EmailService,
  ) {console.log('AdminOrdersService constructor called');}

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

  async listOrders(query: OrderListQuery): Promise<any> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(this.MAX_PAGE_SIZE, query.pageSize ?? this.DEFAULT_PAGE_SIZE);
    const skip = (page - 1) * pageSize;

    // If filtering by slot dates, we need QueryBuilder with join
    // Otherwise, use simpler findAndCount approach
    if (query.slotDateFrom || query.slotDateTo) {
      return this.listOrdersWithSlotDateFilter(query, page, pageSize, skip);
    }

    const where: FindOptionsWhere<Order> = {};

    // Date range filter (createdAt)
    if (query.dateFrom || query.dateTo) {
      if (query.dateFrom && query.dateTo) {
        // Use startOfDay for dateFrom and endOfDay for dateTo to include the full day
        const dateFromStart = startOfDay(parseISO(query.dateFrom));
        const dateToEnd = endOfDay(parseISO(query.dateTo));
        where.createdAt = Between(dateFromStart, dateToEnd);
      } else if (query.dateFrom) {
        // When filtering from a specific date, start from beginning of that day
        where.createdAt = MoreThanOrEqual(startOfDay(parseISO(query.dateFrom)));
      } else if (query.dateTo) {
        // When filtering to a specific date, include until end of that day
        where.createdAt = LessThanOrEqual(endOfDay(parseISO(query.dateTo)));
      }
    }

    // Status filter
    if (query.status) {
      where.status = query.status;
    }

    // Search query - email only
    if (query.q) {
      where.customerEmail = ILike(`%${query.q}%`) as any;
    }

    const [orders, total] = await this.orderRepository.findAndCount({
      where,
      relations: ['items', 'items.resource', 'reservedSlots'],
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    return {
      data: orders,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  private async listOrdersWithSlotDateFilter(
    query: OrderListQuery,
    page: number,
    pageSize: number,
    skip: number
  ): Promise<any> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.resource', 'resource')
      .leftJoinAndSelect('order.reservedSlots', 'slot');

    // Filter by slot startTime date
    if (query.slotDateFrom || query.slotDateTo) {
      if (query.slotDateFrom && query.slotDateTo) {
        queryBuilder.andWhere(
          'DATE(slot.startTime) BETWEEN :slotDateFrom AND :slotDateTo',
          { slotDateFrom: query.slotDateFrom, slotDateTo: query.slotDateTo }
        );
      } else if (query.slotDateFrom) {
        queryBuilder.andWhere('DATE(slot.startTime) >= :slotDateFrom', {
          slotDateFrom: query.slotDateFrom
        });
      } else if (query.slotDateTo) {
        queryBuilder.andWhere('DATE(slot.startTime) <= :slotDateTo', {
          slotDateTo: query.slotDateTo
        });
      }
    }

    // Filter by createdAt date
    if (query.dateFrom || query.dateTo) {
      if (query.dateFrom && query.dateTo) {
        // Use startOfDay for dateFrom and endOfDay for dateTo to include the full day
        const dateFromStart = startOfDay(parseISO(query.dateFrom));
        const dateToEnd = endOfDay(parseISO(query.dateTo));
        queryBuilder.andWhere('order.createdAt BETWEEN :dateFrom AND :dateTo', {
          dateFrom: dateFromStart,
          dateTo: dateToEnd
        });
      } else if (query.dateFrom) {
        // When filtering from a specific date, start from beginning of that day
        const dateFromStart = startOfDay(parseISO(query.dateFrom));
        queryBuilder.andWhere('order.createdAt >= :dateFrom', {
          dateFrom: dateFromStart
        });
      } else if (query.dateTo) {
        // When filtering to a specific date, include until end of that day
        const dateToEnd = endOfDay(parseISO(query.dateTo));
        queryBuilder.andWhere('order.createdAt <= :dateTo', {
          dateTo: dateToEnd
        });
      }
    }

    // Status filter
    if (query.status) {
      queryBuilder.andWhere('order.status = :status', { status: query.status });
    }

    // Search query - email only (case-insensitive)
    if (query.q) {
      queryBuilder.andWhere('LOWER(order.customerEmail) LIKE LOWER(:q)', { q: `%${query.q}%` });
    }

    // Resource type filter
    if (query.resourceType) {
      queryBuilder.andWhere('resource.type = :resourceType', { resourceType: query.resourceType });
    }

    // Resource ID filter
    if (query.resourceId) {
      queryBuilder.andWhere('resource.id = :resourceId', { resourceId: query.resourceId });
    }

    // Prevent duplicates from join
    queryBuilder.distinct(true);

    // Order by createdAt descending
    queryBuilder.orderBy('order.createdAt', 'DESC');

    // Get total count before pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    const orders = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .getMany();

    return {
      data: orders,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getOrder(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.resource', 'reservedSlots'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async createOrder(input: CreateOrderInput, adminId: number): Promise<{ orderId: string; order: Order }> {
    if (!input.items || input.items.length === 0) {
      throw new BadRequestException('At least one item is required');
    }

    // Fetch all resources
    const resourceIds = input.items.map((item) => item.resourceId);
    const resources = await this.resourceRepository.findBy({ id: In(resourceIds) });

    if (resources.length !== resourceIds.length) {
      throw new NotFoundException('One or more resources were not found');
    }

    const resourceMap = new Map(resources.map((r) => [r.id, r]));

    // Get settings for pricing
    const appSettings = await this.adminSettingsService.getCachedSettings();

    // Build item contexts
    const itemContexts = input.items.map((item) => {
      const resource = resourceMap.get(item.resourceId)!;
      const startTime = parseDateTime(
        item.date,
        item.start,
        appSettings.timezone,
        appSettings.slotIntervalMinutes
      );
      const endTime = addMinutes(startTime, item.duration * 60);
      
      // Validate that the start time is not in the past
      validateStartTimeNotInPast(startTime, appSettings.timezone, appSettings.slotIntervalMinutes);

      const pricingMode = getExpectedPricingMode(resource.type);
      const pricing = calculatePrice({
        resourceType: resource.type,
        pricingMode,
        durationHours: item.duration,
        peopleCount: item.peopleCount ?? undefined,
      });

      return {
        resource,
        startTime,
        endTime,
        pricingMode,
        pricing,
        peopleCount: item.peopleCount,
        item,
      };
    });

    // Check for conflicts
    for (const context of itemContexts) {
      const overlapping = await this.reservedSlotRepository.findOne({
        where: {
          resourceId: context.resource.id,
          startTime: LessThan(context.endTime),
          endTime: MoreThan(context.startTime),
          status: In([SlotStatus.BOOKED, SlotStatus.HOLD]),
        },
      });

      if (overlapping) {
        throw new ConflictException('Selected slot is no longer available');
      }
    }

    // Calculate total
    const totalAmount = itemContexts.reduce((sum, ctx) => sum + ctx.pricing.totalAmount, 0);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate user-friendly order number
      const orderNumber = await this.generateOrderNumber(queryRunner);

      // Determine order status based on payment method
      // For on-site payments, status should be PENDING_ONSITE until actually paid
      // For online payments, this would be PENDING_PAYMENT, but admin creates are usually on-site
      const isOnSitePayment = input.payment.method === 'ON_SITE_CASH' || input.payment.method === 'ON_SITE_CARD';
      const orderStatus = isOnSitePayment ? OrderStatus.PENDING_ONSITE : OrderStatus.PAID;
      
      // Create order
      const order = this.orderRepository.create({
        orderNumber,
        customerEmail: input.customer.email.toLowerCase(),
        customerName: `${input.customer.firstName} ${input.customer.lastName}`,
        customerPhone: input.customer.phone,
        totalAmount,
        currency: 'PLN',
        status: orderStatus,
        paymentMethod: input.payment.method as PaymentMethod,
        // Only set paidAt if status is PAID (not for PENDING_ONSITE)
        paidAt: orderStatus === OrderStatus.PAID ? new Date() : null,
        createdByUserId: adminId,
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      // Create order items and slots
      for (const context of itemContexts) {
        const item = this.orderItemRepository.create({
          orderId: savedOrder.id,
          resourceId: context.resource.id,
          quantity: context.pricing.quantity,
          unitAmount: context.pricing.unitAmount,
          totalAmount: context.pricing.totalAmount,
          description: `${context.resource.name}`,
          peopleCount: context.peopleCount,
          pricingMode: context.pricingMode as any,
        });
        await queryRunner.manager.save(item);

        const slot = this.reservedSlotRepository.create({
          resourceId: context.resource.id,
          orderId: savedOrder.id,
          startTime: context.startTime,
          endTime: context.endTime,
          status: SlotStatus.BOOKED,
        });
        await queryRunner.manager.save(ReservedSlot, slot);
      }

      await queryRunner.commitTransaction();

      const createdOrder = await this.getOrder(savedOrder.id);
      return {
        orderId: createdOrder.id,
        order: createdOrder
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateOrder(id: string, input: UpdateOrderInput, adminId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'reservedSlots'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // TODO: Implement update logic

    return this.getOrder(id);
  }

  async markOrderPaid(id: string, adminId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['reservedSlots'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException('Order is already paid');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(Order, { id }, {
        status: OrderStatus.PAID,
        paidAt: new Date(),
      });

      await queryRunner.manager.update(ReservedSlot, { orderId: id }, {
        status: SlotStatus.BOOKED,
        expiresAt: null,
      });

      await queryRunner.commitTransaction();

      // Send confirmation email asynchronously (fire-and-forget)
      this.emailService.sendOrderConfirmationEmail(id).catch((emailError) => {
        // Email errors are already logged in EmailService, just catch to prevent unhandled rejection
      });

      return this.getOrder(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelOrder(id: string, reason: string, adminId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['reservedSlots'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(Order, { id }, {
        status: OrderStatus.CANCELLED,
      });

      await queryRunner.manager.delete(ReservedSlot, { orderId: id });

      await queryRunner.commitTransaction();

      return this.getOrder(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteOrder(id: string, adminId: number): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['reservedSlots'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(ReservedSlot, { orderId: id });
      await queryRunner.manager.delete(OrderItem, { orderId: id });
      await queryRunner.manager.delete(Order, { id });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

// Export functions for compatibility - removed due to dependency injection issues