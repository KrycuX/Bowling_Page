import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource, Order, OrderItem, ReservedSlot, MarketingConsent } from '../../database/entities';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { PaymentModule } from '../payment/payment.module';
import { GlobalSettingsModule } from '../settings/global-settings.module';
import { EmailModule } from '../email/email.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resource, Order, OrderItem, ReservedSlot, MarketingConsent]),
    PaymentModule,
    GlobalSettingsModule,
    EmailModule,
    AdminModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
