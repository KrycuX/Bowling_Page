import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, ReservedSlot, OrderItem, Session, PaymentTransaction } from '../../database/entities';
import { CleanupService } from './cleanup.service';
import { GlobalSettingsModule } from '../settings/global-settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, ReservedSlot, OrderItem, Session, PaymentTransaction]),
    GlobalSettingsModule,
  ],
  providers: [CleanupService],
})
export class CleanupModule {}
