import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactSubmission } from '../../../database/entities';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ContactSubmissionListQuery {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @IsOptional()
  @Type(() => String)
  email?: string;
}

export type ContactSubmissionListResult = {
  data: ContactSubmission[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

@Injectable()
export class AdminContactService {
  constructor(
    @InjectRepository(ContactSubmission)
    private contactSubmissionRepository: Repository<ContactSubmission>,
  ) {}

  async listSubmissions(query: ContactSubmissionListQuery): Promise<ContactSubmissionListResult> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (query.email) {
      where.email = query.email.toLowerCase().trim();
    }

    const [data, total] = await this.contactSubmissionRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: pageSize,
    });

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
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

