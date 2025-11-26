import 'dotenv/config';

import { AppDataSource } from '../src/database/data-source';
import { ReservedSlot, Order } from '../src/database/entities';

async function cleanupStalePendingPayments() {
  console.log('🧹 Starting cleanup of stale pending payments...');
  
  try {
    const now = new Date();

    // Find orders in PENDING_PAYMENT where hold has expired
    const staleOrders = await AppDataSource.getRepository(Order)
      .createQueryBuilder('order')
      .where('order.status = :status', { status: 'PENDING_PAYMENT' })
      .andWhere('order.holdExpiresAt < :now', { now })
      .select(['order.id'])
      .getMany();

    if (staleOrders.length === 0) {
      console.log('✅ No stale PENDING_PAYMENT orders.');
      return;
    }

    console.log(`📊 Found ${staleOrders.length} stale pending payment orders`);

    // Process each stale order in a transaction
    for (const order of staleOrders) {
      await AppDataSource.transaction(async (manager) => {
        // Delete only HOLD slots (BOOKED might exist for admin/paid flows)
        await manager
          .createQueryBuilder()
          .delete()
          .from(ReservedSlot)
          .where('orderId = :orderId', { orderId: order.id })
          .andWhere('status = :status', { status: 'HOLD' })
          .execute();

        // Check if any slots remain for this order
        const remainingCount = await manager
          .createQueryBuilder()
          .select('COUNT(*)', 'count')
          .from(ReservedSlot, 'slot')
          .where('slot.orderId = :orderId', { orderId: order.id })
          .getRawOne();

        const count = Number(remainingCount?.count || 0);

        // If no slots remain, mark order as expired
        if (count === 0) {
          await manager
            .createQueryBuilder()
            .update(Order)
            .set({ 
              status: 'EXPIRED',
              updatedAt: now
            })
            .where('id = :orderId', { orderId: order.id })
            .execute();
        }
      });
    }

    console.log(`✅ Expired ${staleOrders.length} PENDING_PAYMENT orders (hold expired).`);

  } catch (error) {
    console.error('❌ Failed to cleanup pending payments:', error);
    throw error;
  }
}

async function main() {
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('🔌 Database connection initialized');
    }
    
    await cleanupStalePendingPayments();
    
    console.log('🎉 Cleanup completed successfully');
  } catch (error) {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  } finally {
    // Clean up connections
    try {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
        console.log('🔌 Database connections closed');
      }
    } catch (error) {
      console.error('❌ Error closing database connections:', error);
    }
  }
}

main();
