import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource, ReservedSlot } from '../../database/entities';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { GlobalSettingsModule } from '../settings/global-settings.module';
@Module({
  imports: [ TypeOrmModule.forFeature([Resource, ReservedSlot]),GlobalSettingsModule],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModuleFeature {
  constructor() {
    console.log('ScheduleModuleFeature constructor called');
  }
}