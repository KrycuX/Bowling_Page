import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import axios from 'axios';

interface RateLimitConfig {
  windowSeconds: number;
  maxRequests: number;
  identifier?: string; // For account-based limits (e.g., email)
}

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  private readonly redisUrl: string;
  private readonly redisToken: string;

  constructor() {
    this.redisUrl = process.env.UPSTASH_REDIS_REST_URL || '';
    this.redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || '';
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const handler = context.getHandler();
    const controller = context.getClass();

    // Get rate limit config based on endpoint
    const config = this.getRateLimitConfig(request.path, request.method);

    if (!config) {
      // No rate limit for this endpoint
      return next.handle();
    }

    // Check if Upstash is configured
    if (!this.redisUrl || !this.redisToken) {
      console.warn('[RateLimitInterceptor] Upstash Redis not configured, skipping rate limit');
      return next.handle();
    }

    // Get identifier (IP or account-based)
    const identifier = config.identifier 
      ? await this.getAccountIdentifier(request, config.identifier)
      : this.getIpAddress(request);

    if (!identifier) {
      throw new HttpException('Unable to identify client', HttpStatus.BAD_REQUEST);
    }

    const key = `ratelimit:${config.windowSeconds}:${identifier}:${request.path}`;
    
    try {
      const isAllowed = await this.checkRateLimit(key, config.maxRequests, config.windowSeconds);
      
      if (!isAllowed) {
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Too many requests. Please try again later.',
            retryAfter: config.windowSeconds,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('[RateLimitInterceptor] Error checking rate limit:', error);
      // On error, allow request to proceed (fail open)
    }

    return next.handle();
  }

  private getRateLimitConfig(path: string, method: string): RateLimitConfig | null {
    // Only rate limit POST requests
    if (method !== 'POST') {
      return null;
    }

    // POST /admin/auth/login → 5/min/IP + 20/h/account (email)
    if (path.includes('/admin/auth/login')) {
      // We'll use IP-based for now, account-based would need to check body for email
      // In a real implementation, you might want separate interceptors or middleware
      return {
        windowSeconds: 60, // 1 minute
        maxRequests: 5,
        identifier: 'email', // Will try to get email from body
      };
    }

    // POST /admin/auth/register, POST /password-reset → 3/min/IP
    if (path.includes('/admin/auth/register') || path.includes('/password-reset')) {
      return {
        windowSeconds: 60, // 1 minute
        maxRequests: 3,
      };
    }

    // Other POST endpoints → 20/min/IP
    return {
      windowSeconds: 60, // 1 minute
      maxRequests: 20,
    };
  }

  private getIpAddress(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (request.headers['x-real-ip'] as string) ||
      request.ip ||
      request.socket?.remoteAddress ||
      'unknown'
    );
  }

  private async getAccountIdentifier(request: Request, type: string): Promise<string | null> {
    if (type === 'email') {
      // Try to get email from body (for login requests)
      const body = request.body;
      if (body && body.email) {
        return `email:${body.email}`;
      }
    }
    return null;
  }

  private async checkRateLimit(
    key: string,
    maxRequests: number,
    windowSeconds: number,
  ): Promise<boolean> {
    try {
      // Use fixed window algorithm with Upstash Redis REST API
      // Format: POST to {url}/pipeline with commands
      const commands = [
        ['GET', key],
        ['INCR', key],
        ['EXPIRE', key, windowSeconds.toString()],
      ];

      const response = await axios.post(
        `${this.redisUrl}/pipeline`,
        commands,
        {
          headers: {
            Authorization: `Bearer ${this.redisToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 2000,
        },
      );

      const results = response.data.result || [];
      const currentCount = parseInt(results[1]?.result || '1', 10);

      if (currentCount > maxRequests) {
        return false;
      }

      return true;
    } catch (error: any) {
      console.error('[RateLimitInterceptor] Upstash API error:', error?.message || error);
      // Fail open - allow request on error
      return true;
    }
  }
}

