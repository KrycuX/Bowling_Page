import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppSettings } from '../../database/entities';
import { GlobalSettingsController } from './global-settings.controller';
import {  GlobalSettingsService } from './global-settings.service';


@Module({
  imports: [ TypeOrmModule.forFeature([AppSettings]),],
  controllers: [GlobalSettingsController],
  providers: [GlobalSettingsService],
  exports: [GlobalSettingsService],
})
export class GlobalSettingsModule {
  constructor() {
    console.log('GlobalSettingsModule constructor called');
  }
}