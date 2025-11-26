import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository,InjectDataSource } from '@nestjs/typeorm';
import { Repository, LessThan, DataSource, In } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Order, ReservedSlot, OrderItem, SlotStatus, OrderStatus, PaymentTransaction, PaymentTransactionStatus, Session } from '../../database/entities';
import { GlobalSettingsService } from '../settings/global-settings.service';
import { differenceInMinutes } from 'date-fns';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(ReservedSlot)
    private reservedSlotRepository: Repository<ReservedSlot>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectDataSource()
    private dataSource: DataSource,
    private readonly globalSettingsService: GlobalSettingsService,
  ) {}

  @Cron('*/1 * * * *') // Every minute
  async cleanupExpiredHolds() {
    this.logger.log('Running cleanup of expired holds...');
    const now = new Date();

    try {
      const expiredSlots = await this.reservedSlotRepository.find({
        where: {
          status: SlotStatus.HOLD,
          expiresAt: LessThan(now),
        },
        select: ['id', 'orderId'],
      });

      if (expiredSlots.length === 0) {
        this.logger.log('No expired holds to clean up.');
        return;
      }

      const affectedOrders = Array.from(new Set(expiredSlots.map((slot) => slot.orderId)));

      // Get order statuses to filter out PENDING_ONSITE orders (confirmed reservations waiting for on-site payment)
      const orders = await this.orderRepository.find({
        where: { id: In(affectedOrders) },
        select: ['id', 'status'],
      });

      const orderStatusMap = new Map(orders.map(order => [order.id, order.status]));

      for (const orderId of affectedOrders) {
        if (!orderId) continue;

        // Skip cleanup for PENDING_ONSITE orders - these are confirmed reservations waiting for payment
        const orderStatus = orderStatusMap.get(orderId);
        if (orderStatus === OrderStatus.PENDING_ONSITE) {
          continue;
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          await queryRunner.manager.delete(ReservedSlot, {
            orderId,
            status: SlotStatus.HOLD,
            expiresAt: LessThan(now),
          });

          const remainingSlots = await queryRunner.manager.count(ReservedSlot, {
            where: { orderId },
          });

          if (remainingSlots === 0) {
            await queryRunner.manager.update(Order, { id: orderId }, {
              status: OrderStatus.EXPIRED,
            });
          }

          await queryRunner.commitTransaction();
        } catch (error) {
          await queryRunner.rollbackTransaction();
          throw error;
        } finally {
          await queryRunner.release();
        }
      }

      this.logger.log(
        `Expired holds cleaned. Removed ${expiredSlots.length} slots across ${affectedOrders.length} orders.`
      );
    } catch (error) {
      this.logger.error('Failed to cleanup expired holds', error);
    }
  }

  @Cron('*/1 * * * *') // Every minute
  async cleanupStalePendingPayments() {
    this.logger.log('Running cleanup of stale pending payments...');
    const now = new Date();

    try {
      const staleOrders = await this.orderRepository.find({
        where: {
          status: OrderStatus.PENDING_PAYMENT,
          holdExpiresAt: LessThan(now),
        },
        relations: ['reservedSlots'],
      });

      if (staleOrders.length === 0) {
        this.logger.log('No stale PENDING_PAYMENT orders.');
        return;
      }

      for (const order of staleOrders) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          await queryRunner.manager.delete(ReservedSlot, {
            orderId: order.id,
            status: SlotStatus.HOLD,
          });

          const remaining = await queryRunner.manager.count(ReservedSlot, {
            where: { orderId: order.id },
          });

          if (remaining === 0) {
            await queryRunner.manager.update(Order, { id: order.id }, {
              status: OrderStatus.EXPIRED,
            });
          }

          // Mark payment transactions as TIMED_OUT
          if (order.p24SessionId) {
            await queryRunner.manager.update(
              PaymentTransaction,
              { orderId: order.id, sessionId: order.p24SessionId, status: PaymentTransactionStatus.PENDING },
              { status: PaymentTransactionStatus.TIMED_OUT }
            );
          }

          await queryRunner.commitTransaction();
        } catch (error) {
          await queryRunner.rollbackTransaction();
          throw error;
        } finally {
          await queryRunner.release();
        }
      }

      this.logger.log(`Expired ${staleOrders.length} PENDING_PAYMENT orders (hold expired).`);
    } catch (error) {
      this.logger.error('Failed to cleanup stale pending payments', error);
    }
  }

  @Cron('*/1 * * * *') // Every minute
  async cleanupPendingOnsitePayments() {
    this.logger.log('Running cleanup of pending onsite payments...');
    const now = new Date();
    const settings = await this.globalSettingsService.getGlobalSettings();
    const gracePeriodMinutes = settings.holdTtlOnsiteGraceAfterStartMinutes || 7;

    try {
      // Find PENDING_ONSITE orders with reserved slots
      const pendingOnsiteOrders = await this.orderRepository.find({
        where: {
          status: OrderStatus.PENDING_ONSITE,
        },
        relations: ['reservedSlots'],
      });

      if (pendingOnsiteOrders.length === 0) {
        this.logger.log('No pending onsite payments to clean up.');
        return;
      }

      let cancelledCount = 0;

      for (const order of pendingOnsiteOrders) {
        if (!order.reservedSlots || order.reservedSlots.length === 0) {
          continue;
        }

        // Find the earliest start time
        const earliestStartTime = new Date(
          Math.min(...order.reservedSlots.map(slot => new Date(slot.startTime).getTime()))
        );

        // Check if reservation has started
        const minutesSinceStart = differenceInMinutes(now, earliestStartTime);

        // If reservation hasn't started yet, check if hold expired
        if (minutesSinceStart < 0) {
          // Check if hold expired (for onsite, use holdExpiresAt if set)
          if (order.holdExpiresAt && order.holdExpiresAt < now) {
            // Hold expired before start - cancel the reservation
            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();

            try {
              await queryRunner.manager.delete(ReservedSlot, {
                orderId: order.id,
              });

              await queryRunner.manager.update(Order, { id: order.id }, {
                status: OrderStatus.EXPIRED,
              });

              await queryRunner.commitTransaction();
              cancelledCount++;
            } catch (error) {
              await queryRunner.rollbackTransaction();
              this.logger.error(`Failed to cancel onsite order ${order.id}`, error);
            } finally {
              await queryRunner.release();
            }
          }
          continue;
        }

        // Reservation has started - check grace period
        if (minutesSinceStart > gracePeriodMinutes) {
          // Grace period expired - cancel the reservation
          const queryRunner = this.dataSource.createQueryRunner();
          await queryRunner.connect();
          await queryRunner.startTransaction();

          try {
            await queryRunner.manager.delete(ReservedSlot, {
              orderId: order.id,
            });

            await queryRunner.manager.update(Order, { id: order.id }, {
              status: OrderStatus.EXPIRED,
            });

            await queryRunner.commitTransaction();
            cancelledCount++;
          } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to cancel onsite order ${order.id} after grace period`, error);
          } finally {
            await queryRunner.release();
          }
        }
      }

      if (cancelledCount > 0) {
        this.logger.log(`Cancelled ${cancelledCount} pending onsite payments (grace period expired or hold expired).`);
      }
    } catch (error) {
      this.logger.error('Failed to cleanup pending onsite payments', error);
    }
  }

  @Cron('0 * * * *') // Every hour
  async cleanupExpiredSessions() {
    this.logger.log('Running cleanup of expired sessions...');

    try {
      const now = new Date();
      const result = await this.sessionRepository
        .createQueryBuilder()
        .delete()
        .where('expiresAt < :now', { now })
        .execute();

      if (result.affected && result.affected > 0) {
        this.logger.log(`Deleted ${result.affected} expired sessions.`);
      } else {
        this.logger.log('No expired sessions to clean up.');
      }
    } catch (error) {
      this.logger.error('Failed to cleanup expired sessions', error);
    }
  }
}
