import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, ReservedSlot, PaymentTransaction } from '../../database/entities';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { GlobalSettingsModule } from '../settings/global-settings.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, ReservedSlot, PaymentTransaction]),
    GlobalSettingsModule,
    EmailModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
