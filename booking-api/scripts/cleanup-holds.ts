import 'dotenv/config';

import { AppDataSource } from '../src/database/data-source';
import { ReservedSlot, Order } from '../src/database/entities';

async function cleanupExpiredHolds() {
  console.log('🧹 Starting cleanup of expired holds...');
  
  try {
    const now = new Date();

    // Find expired hold slots
    const expiredSlots = await AppDataSource.getRepository(ReservedSlot)
      .createQueryBuilder('slot')
      .where('slot.status = :status', { status: 'HOLD' })
      .andWhere('slot.expiresAt < :now', { now })
      .select(['slot.id', 'slot.orderId'])
      .getMany();

    if (expiredSlots.length === 0) {
      console.log('✅ No expired holds to clean up.');
      return;
    }

    console.log(`📊 Found ${expiredSlots.length} expired hold slots`);

    const affectedOrders = Array.from(new Set(expiredSlots.map((slot) => slot.orderId)));

    // Process each affected order in a transaction
    for (const orderId of affectedOrders) {
      await AppDataSource.transaction(async (manager) => {
        // Delete expired hold slots for this order
        await manager
          .createQueryBuilder()
          .delete()
          .from(ReservedSlot)
          .where('orderId = :orderId', { orderId })
          .andWhere('status = :status', { status: 'HOLD' })
          .andWhere('expiresAt < :now', { now })
          .execute();

        // Check if any slots remain for this order
        const remainingCount = await manager
          .createQueryBuilder()
          .select('COUNT(*)', 'count')
          .from(ReservedSlot, 'slot')
          .where('slot.orderId = :orderId', { orderId })
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
            .where('id = :orderId', { orderId })
            .execute();
        }
      });
    }

    console.log(
      `✅ Expired holds cleaned. Removed ${expiredSlots.length} slots across ${affectedOrders.length} orders.`
    );

  } catch (error) {
    console.error('❌ Failed to clean holds:', error);
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
    
    await cleanupExpiredHolds();
    
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
