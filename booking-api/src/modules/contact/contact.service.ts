import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactSubmission, MarketingConsent } from '../../database/entities';
import { EmailService } from '../email/email.service';

export type SubmitContactFormInput = {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  rodoConsent: boolean;
  marketingConsent: boolean;
  clientIp: string;
  userAgent?: string | null;
};

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactSubmission)
    private contactSubmissionRepository: Repository<ContactSubmission>,
    @InjectRepository(MarketingConsent)
    private marketingConsentRepository: Repository<MarketingConsent>,
    @Inject(EmailService)
    private emailService: EmailService,
  ) {}

  async submitContactForm(input: SubmitContactFormInput): Promise<ContactSubmission> {
    if (!input.rodoConsent) {
      throw new BadRequestException('RODO consent is required');
    }

    if (!input.email || !input.message || !input.name) {
      throw new BadRequestException('Name, email and message are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      throw new BadRequestException('Invalid email format');
    }

    const submission = this.contactSubmissionRepository.create({
      name: input.name,
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || null,
      message: input.message.trim(),
      rodoConsent: input.rodoConsent,
      marketingConsent: input.marketingConsent || false,
      clientIp: input.clientIp,
      userAgent: input.userAgent || null,
    });

    const savedSubmission = await this.contactSubmissionRepository.save(submission);

    // If marketing consent given, create marketing consent record
    if (input.marketingConsent) {
      const marketingConsent = this.marketingConsentRepository.create({
        id: `contact-${savedSubmission.id}-${Date.now()}`,
        email: input.email.trim().toLowerCase(),
        firstName: input.name.split(' ')[0] || null,
        lastName: input.name.split(' ').slice(1).join(' ') || null,
        phone: input.phone?.trim() || null,
        consentGiven: true,
        consentedAt: new Date(),
        source: 'contact-form',
        clientIp: input.clientIp,
        userAgent: input.userAgent || null,
      });

      await this.marketingConsentRepository.save(marketingConsent);
    }

    // Send emails asynchronously (don't wait for it to complete)
    this.emailService.sendContactFormEmails(savedSubmission.id).catch((error) => {
      console.error('Failed to send contact form emails:', error);
    });

    return savedSubmission;
  }

  async getSubmission(id: number): Promise<ContactSubmission> {
    const submission = await this.contactSubmissionRepository.findOne({
      where: { id },
    });

    if (!submission) {
      throw new NotFoundException('Contact submission not found');
    }

    return submission;
  }
}

