import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { configValidationSchema } from './config/env.validation';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { BookingModule } from './modules/booking/booking.module';
import { ScheduleModuleFeature  } from './modules/schedule/schedule.module';
import { PaymentModule } from './modules/payment/payment.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { AdminModule } from './modules/admin/admin.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { CleanupModule } from './modules/cleanup/cleanup.module';
import { GlobalSettingsModule } from './modules/settings/global-settings.module';
import { ContactModule } from './modules/contact/contact.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';
import { BusinessHoursModule } from './modules/business-hours/business-hours.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      envFilePath: ['.env.local', '.env'],
    }),
    GlobalSettingsModule,
    // Throttling - commented out for now
    // ThrottlerModule.forRoot({
    //   ttl: 60,
    //   limit: 50,
    // }),

    // Scheduler
    NestScheduleModule.forRoot(),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        url: configService.get<string>('DATABASE_URL'),
        entities: [
          __dirname + '/database/entities/**/*.entity{.ts,.js}',
        ],
        synchronize: false, // Use migrations
        logging: configService.get<string>('NODE_ENV') === 'development',
        // Prevent startup from hanging indefinitely on DB connection issues
        retryAttempts: 3,
        retryDelay: 3000,
        extra: {
          connectionLimit: 10,
          // mysql2 driver option (ms)
          connectTimeout: 10000,
        },
      }),
    }),

    // Feature modules (conditional to help diagnose startup issues)
    HealthModule,
    AuthModule,
    AvailabilityModule,
    BookingModule,
   ScheduleModuleFeature,
   PaymentModule,
    CouponModule,
   ResourcesModule,
    AdminModule,
    CleanupModule,
    GlobalSettingsModule,
    ContactModule,
    GalleryModule,
    NewsletterModule,
    BusinessHoursModule,
  ],
})
export class AppModule {}
