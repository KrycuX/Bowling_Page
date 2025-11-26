import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TurnstileGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const turnstileToken = request.headers['cf-turnstile-response'] || request.body?.turnstileToken;

    if (!turnstileToken) {
      throw new ForbiddenException('Turnstile verification token is required');
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      console.error('[TurnstileGuard] TURNSTILE_SECRET_KEY is not configured');
      throw new ForbiddenException('Turnstile verification is not configured');
    }

    try {
      // Get client IP from request
      const clientIp = request.ip || 
        request.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
        request.connection?.remoteAddress;

      // Verify with Cloudflare Turnstile
      const response = await axios.post(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        new URLSearchParams({
          secret: secretKey,
          response: turnstileToken,
          remoteip: clientIp || '',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 5000,
        }
      );

      const result = response.data;

      if (!result.success) {
        console.warn('[TurnstileGuard] Verification failed:', result['error-codes']);
        throw new ForbiddenException('Turnstile verification failed');
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      console.error('[TurnstileGuard] Error verifying token:', error);
      throw new ForbiddenException('Failed to verify Turnstile token');
    }
  }
}

