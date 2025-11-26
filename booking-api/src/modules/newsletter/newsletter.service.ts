import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketingConsent } from '../../database/entities';
import { createId } from '@paralleldrive/cuid2';

export type SubscribeNewsletterInput = {
  email: string;
  clientIp: string;
  userAgent?: string | null;
};

@Injectable()
export class NewsletterService {
  constructor(
    @InjectRepository(MarketingConsent)
    private marketingConsentRepository: Repository<MarketingConsent>,
  ) {}

  async subscribeNewsletter(input: SubscribeNewsletterInput): Promise<MarketingConsent> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      throw new BadRequestException('Invalid email format');
    }

    const email = input.email.trim().toLowerCase();

    // Create marketing consent record
    const marketingConsent = this.marketingConsentRepository.create({
      id: `newsletter-${Date.now()}-${createId()}`,
      email,
      firstName: null,
      lastName: null,
      phone: null,
      consentGiven: true,
      consentedAt: new Date(),
      source: 'newsletter',
      clientIp: input.clientIp,
      userAgent: input.userAgent || null,
    });

    return await this.marketingConsentRepository.save(marketingConsent);
  }
}

