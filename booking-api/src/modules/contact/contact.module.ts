import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { ContactSubmission, MarketingConsent } from '../../database/entities';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContactSubmission, MarketingConsent]),
    EmailModule,
  ],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}

