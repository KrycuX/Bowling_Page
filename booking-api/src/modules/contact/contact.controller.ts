import { Controller, Post, Body, Inject, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';
import { ContactService, SubmitContactFormInput } from './contact.service';
import { TurnstileGuard } from '../../common/guards/turnstile.guard';

class SubmitContactFormDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string | null;

  @IsString()
  message: string;

  @IsBoolean()
  rodoConsent: boolean;

  @IsBoolean()
  @IsOptional()
  marketingConsent?: boolean;

  @IsString()
  @IsOptional()
  clientIp?: string;

  @IsString()
  @IsOptional()
  userAgent?: string | null;
}

@Controller('contact')
export class ContactController {
  constructor(@Inject(ContactService) private readonly contactService: ContactService) {}

  @Post('submit')
  @UseGuards(TurnstileGuard)
  async submitContactForm(
    @Body() dto: SubmitContactFormDto,
    @Req() req: Request,
  ) {
    // Use clientIp and userAgent from DTO if provided, otherwise extract from request
    const clientIp = dto.clientIp ||
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      'unknown';
    
    const userAgent = (dto.userAgent ?? req.headers['user-agent']) || null;

    const input: SubmitContactFormInput = {
      name: dto.name,
      email: dto.email,
      phone: dto.phone || null,
      message: dto.message,
      rodoConsent: dto.rodoConsent,
      marketingConsent: dto.marketingConsent || false,
      clientIp,
      userAgent,
    };

    return this.contactService.submitContactForm(input);
  }
}

