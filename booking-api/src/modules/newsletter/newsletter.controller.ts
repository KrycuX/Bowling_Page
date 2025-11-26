import { Controller, Post, Body, Inject, Req } from '@nestjs/common';
import { Request } from 'express';
import { IsEmail } from 'class-validator';
import { NewsletterService, SubscribeNewsletterInput } from './newsletter.service';

class SubscribeNewsletterDto {
  @IsEmail()
  email: string;
}

@Controller('newsletter')
export class NewsletterController {
  constructor(@Inject(NewsletterService) private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  async subscribeNewsletter(
    @Body() dto: SubscribeNewsletterDto,
    @Req() req: Request,
  ) {
    // Extract IP address from request
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      'unknown';
    
    const userAgent = req.headers['user-agent'] || null;

    const input: SubscribeNewsletterInput = {
      email: dto.email,
      clientIp,
      userAgent,
    };

    const consent = await this.newsletterService.subscribeNewsletter(input);

    return {
      success: true,
      message: 'Successfully subscribed to newsletter',
      id: consent.id,
    };
  }
}

