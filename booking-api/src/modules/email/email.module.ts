import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, ContactSubmission } from '../../database/entities';
import { EmailService } from './email.service';
import { GlobalSettingsModule } from '../settings/global-settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, ContactSubmission]),
    GlobalSettingsModule,
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

