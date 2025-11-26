import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { logger } from './config/logger';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

function isAllowedTheAlleyDomain(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return hostname === 'bowlinghub.pl' || hostname.endsWith('.bowlinghub.pl');
  } catch {
    return false;
  }
}

function isLocalhostOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '[::1]';
  } catch {
    return false;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) || [];
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }
      
      // Always allow localhost origins
      if (isLocalhostOrigin(origin)) {
        callback(null, true);
        return;
      }
      
      // If no allowed origins are configured, allow localhost even in production
      // This is useful for development and testing
      if (allowedOrigins.length === 0 && isDevelopment) {
        callback(null, true);
        return;
      }
      
      // Check if origin is in allowed origins
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      
      // Allow the primary domain and subdomains of bowlinghub.pl
      if (isAllowedTheAlleyDomain(origin)) {
        callback(null, true);
        return;
      }
      
      // Log the blocked origin for debugging
      console.warn(`CORS: Blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  });

  // Cookie parser
  app.use(cookieParser());

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Booking API')
    .setDescription('API for managing reservations and bookings for bowling, billiards, karaoke, and quiz activities')
    .setVersion('2.0.0')
    .addTag('health', 'Health check endpoints')
    .addTag('availability', 'Resource availability checking')
    .addTag('schedule', 'Schedule and calendar endpoints')
    .addTag('booking', 'Booking and hold management')
    .addTag('payment', 'Payment processing')
    .addTag('coupons', 'Coupon validation')
    .addTag('admin-auth', 'Admin authentication')
    .addTag('admin-orders', 'Order management')
    .addTag('admin-coupons', 'Coupon management')
    .addTag('admin-users', 'User management')
    .addTag('admin-settings', 'Application settings')
    .addCookieAuth('session', {
      type: 'http',
      in: 'Cookie',
      scheme: 'bearer',
    })
    .addServer('http://localhost:4000', 'Local development server')
    .addServer('https://api.example.com', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'Booking API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin-bottom: 30px; }
    `,
  });

  // Trust proxy - using Express adapter
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  const port = process.env.APP_PORT || 4000;
  const host = process.env.APP_HOST || '0.0.0.0';

  await app.listen(port, host);

  logger.info({ port, host }, 'booking-api server is running');
  console.log(`🚀 NestJS Server running on http://${host}:${port}`);
  console.log(`📊 Health check: http://${host}:${port}/healthz`);
  console.log(`📚 API Documentation: http://${host}:${port}/api-docs`);
}

bootstrap().catch((error) => {
  logger.error({ error }, 'Failed to start server');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled rejection');
});

process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught exception');
  process.exit(1);
});
