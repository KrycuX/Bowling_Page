import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import * as path from 'path';
import express from 'express';

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
  console.log('[BOOT] Creating Nest application...');
  const creatingTimeout = setTimeout(() => {
    console.warn('[BOOT] Still creating Nest application after 5s...');
  }, 5000);

  let app;
  try {
    const createPromise = NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug'],
    });
    app = await createPromise;
  } catch (err) {
    console.error('[BOOT] Failed while creating Nest application', err);
    throw err;
  } finally {
    clearTimeout(creatingTimeout);
  }
  console.log('[BOOT] Nest application created');

  // Security
  console.log('[BOOT] Applying security middlewares (helmet, compression)');
  app.use(helmet({
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    contentSecurityPolicy: false, // Disable CSP (handled by Next.js frontend)
    xContentTypeOptions: true,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
    frameguard: {
      action: 'deny',
    },
  } as any));
  app.use(compression());
  console.log('[BOOT] Security middlewares applied');

  // CORS - only allow specific production domains
  const allowedOrigins = [
    'https://bowlinghub.pl',
    'https://www.bowlinghub.pl',
    'https://rezerwacje.bowlinghub.pl',
    'https://secure.przelewy24.pl',
    'https://sandbox.przelewy24.pl',
    'https://panel.przelewy24.pl',
  ];
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  console.log('[BOOT] Enabling CORS...');
  app.enableCors((req, callback) => {
    const origin = req.header('origin') ?? '';
    const corsOptions = {
      origin: true,
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] as const,
    };

    // Allow webhook calls without Origin header (server-to-server).
    if (!origin) {
      if (req.path === '/payments/p24/webhook') {
        callback(null, corsOptions);
        return;
      }

      if (isDevelopment) {
        callback(null, corsOptions);
        return;
      }

      console.warn(`CORS: Blocked request with no origin to ${req.path}`);
      callback(new Error('Not allowed by CORS'), { ...corsOptions, origin: false });
      return;
    }

    // Always allow localhost origins in development
    if (isDevelopment && isLocalhostOrigin(origin)) {
      callback(null, corsOptions);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, corsOptions);
      return;
    }

    console.warn(`CORS: Blocked origin: ${origin} for path ${req.path}`);
    callback(new Error('Not allowed by CORS'), { ...corsOptions, origin: false });
  });
  console.log('[BOOT] CORS enabled');

  // Get Express instance for body parsers and middleware
  const expressApp = app.getHttpAdapter().getInstance();

  // Body parser with size limits and content-type validation
  console.log('[BOOT] Configuring body parsers...');
  expressApp.use(express.json({ limit: '1mb' }));
  expressApp.use(express.urlencoded({ extended: true, limit: '1mb' }));
  
  // Middleware to validate Content-Type for POST requests
  expressApp.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      const contentType = req.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        return res.status(415).json({
          statusCode: 415,
          message: 'Unsupported Media Type. Content-Type must be application/json',
        });
      }
    }
    next();
  });
  console.log('[BOOT] Body parsers configured (1MB limit, JSON only)');

  // Cookie parser
  console.log('[BOOT] Adding cookie parser...');
  app.use(cookieParser());
  console.log('[BOOT] Cookie parser added');

  // Global pipes
  console.log('[BOOT] Registering global pipes...');
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
  console.log('[BOOT] Global pipes registered');

  // Global filters
  console.log('[BOOT] Registering global filters...');
  app.useGlobalFilters(new HttpExceptionFilter());
  console.log('[BOOT] Global filters registered');

  // Global interceptors
  console.log('[BOOT] Registering global interceptors...');
  app.useGlobalInterceptors(new LoggingInterceptor());
  
  // Rate limit interceptor
  const { RateLimitInterceptor } = await import('./common/ratelimit/rate-limit.interceptor');
  app.useGlobalInterceptors(new RateLimitInterceptor());
  
  console.log('[BOOT] Global interceptors registered');

  // Swagger documentation
  console.log('[BOOT] Building Swagger configuration...');
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
  console.log('[BOOT] Creating Swagger document...');
  const document = SwaggerModule.createDocument(app, config);
  console.log('[BOOT] Swagger document created, setting up UI...');
  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'Booking API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin-bottom: 30px; }
    `,
  });
  console.log('[BOOT] Swagger UI set up at /api-docs');

  // Trust proxy - using Express adapter
  console.log('[BOOT] Setting trust proxy on Express app...');
  expressApp.set('trust proxy', 1);
  console.log('[BOOT] Trust proxy set');

  // Serve static files from public/uploads/gallery
  console.log('[BOOT] Configuring static file serving...');
  expressApp.use('/uploads/gallery', express.static(path.join(process.cwd(), 'public', 'uploads', 'gallery')));
  console.log('[BOOT] Static files configured at /uploads/gallery');

  const port = process.env.APP_PORT || 4000;
  const host = process.env.APP_HOST || '0.0.0.0';

  console.log(`[BOOT] Starting HTTP server on http://${host}:${port} ...`);
  await app.listen(port, host);

  console.log(`🚀 NestJS Server running on http://${host}:${port}`);
  console.log(`📊 Health check: http://${host}:${port}/healthz`);
  console.log(`📚 API Documentation: http://${host}:${port}/api-docs`);
}

bootstrap();
