import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { 
  Order, OrderItem, ReservedSlot, Resource, User, 
  Coupon, CouponAllowedType, CouponEmailAssignment, CouponRedemption,
  AppSettings, AuditLog, MarketingConsent, ContactSubmission, DayOff
} from '../../database/entities';
import { AuthModule } from '../auth/auth.module';
import { AdminOrdersController } from './orders/admin-orders.controller';
import { AdminOrdersService } from './orders/admin-orders.service';
import { AdminCouponsController } from './coupons/admin-coupons.controller';
import { AdminCouponsService } from './coupons/admin-coupons.service';
import { AdminUsersController } from './users/admin-users.controller';
import { AdminUsersService } from './users/admin-users.service';
import { AdminSettingsController } from './settings/admin-settings.controller';
import { AdminSettingsService } from './settings/admin-settings.service';
import { AdminMarketingConsentsController } from './marketing-consents/admin-marketing-consents.controller';
import { AdminMarketingConsentsService } from './marketing-consents/admin-marketing-consents.service';
import { AdminScheduleController } from './schedule/admin-schedule.controller';
import { AdminContactController } from './contact/admin-contact.controller';
import { AdminContactService } from './contact/admin-contact.service';
import { AdminGalleryModule } from './gallery/admin-gallery.module';
import { EmailModule } from '../email/email.module';
import { ScheduleModuleFeature } from '../schedule/schedule.module';
import { DayOffController } from './day-off/day-off.controller';
import { DayOffService } from './day-off/day-off.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order, OrderItem, ReservedSlot, Resource, User,
      Coupon, CouponAllowedType, CouponEmailAssignment, CouponRedemption,
      AppSettings, AuditLog, MarketingConsent, ContactSubmission, DayOff,
    ]),
    AuthModule,
    EmailModule,
    ScheduleModuleFeature,
    AdminGalleryModule,
  ],
  controllers: [
    AdminOrdersController,
    AdminCouponsController,
    AdminUsersController,
    AdminSettingsController,
    AdminMarketingConsentsController,
    AdminScheduleController,
    AdminContactController,
    DayOffController,
  ],
  providers: [
    AdminOrdersService,
    AdminCouponsService,
    AdminUsersService,
    AdminSettingsService,
    AdminMarketingConsentsService,
    AdminContactService,
    DayOffService,
  ],
  exports: [AdminSettingsService, DayOffService],
})
export class AdminModule {
  constructor() {
    console.log('AdminModule constructor called');
  }
}
