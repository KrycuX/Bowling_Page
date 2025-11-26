import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Resource, ReservedSlot } from '../../database/entities';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { GlobalSettingsModule } from '../settings/global-settings.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    ConfigModule, 
    TypeOrmModule.forFeature([Resource, ReservedSlot]),
    GlobalSettingsModule,
    AdminModule,
  ],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
