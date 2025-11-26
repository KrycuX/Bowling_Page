import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MarketingConsent } from '../../../database/entities';
import { formatInTimeZone } from 'date-fns-tz';

export type MarketingConsentListQuery = {
  search?: string;
  page?: number;
  pageSize?: number;
};

@Injectable()
export class AdminMarketingConsentsService {
  private readonly DEFAULT_PAGE_SIZE = 20;
  private readonly MAX_PAGE_SIZE = 100;

  private getUniqueConsents(consents: MarketingConsent[]): MarketingConsent[] {
    const uniqueConsents: MarketingConsent[] = [];
    const seenKeys = new Set<string>();

    for (const consent of consents) {
      const key = `${(consent.email ?? '').toLowerCase()}|${(consent.source ?? '').toLowerCase()}`;
      if (seenKeys.has(key)) {
        continue;
      }

      seenKeys.add(key);
      uniqueConsents.push(consent);
    }

    return uniqueConsents;
  }

  constructor(
    @InjectRepository(MarketingConsent)
    private marketingConsentRepository: Repository<MarketingConsent>,
    @Inject(DataSource)
    private dataSource: DataSource,
  ) {
    console.log('AdminMarketingConsentsService constructor called');
  }

  async listConsents(query: MarketingConsentListQuery): Promise<any> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(this.MAX_PAGE_SIZE, query.pageSize ?? this.DEFAULT_PAGE_SIZE);
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.marketingConsentRepository.createQueryBuilder('consent');

    if (query.search) {
      queryBuilder.where(
        'LOWER(consent.email) LIKE LOWER(:search) OR LOWER(consent.firstName) LIKE LOWER(:search) OR LOWER(consent.lastName) LIKE LOWER(:search) OR LOWER(consent.phone) LIKE LOWER(:search)',
        { search: `%${query.search}%` }
      );
    }

    queryBuilder.orderBy('consent.consentedAt', 'DESC');

    const consents = await queryBuilder.getMany();
    const uniqueConsents = this.getUniqueConsents(consents);
    const total = uniqueConsents.length;
    const paginatedConsents = uniqueConsents.slice(skip, skip + pageSize);

    return {
      data: paginatedConsents,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async exportCsv(): Promise<string> {
    const consents = await this.marketingConsentRepository.find({
      order: { consentedAt: 'DESC' },
    });

    const uniqueConsents = this.getUniqueConsents(consents);

    // CSV headers in Polish
    const headers = ['Email', 'Imię', 'Nazwisko', 'Telefon', 'Data wyrażenia', 'Źródło', 'Status'];
    
    // Format rows
    const rows = uniqueConsents.map(consent => {
      const consentedDate = formatInTimeZone(
        consent.consentedAt,
        'Europe/Warsaw',
        'yyyy-MM-dd HH:mm:ss'
      );
      
      return [
        consent.email,
        consent.firstName || '',
        consent.lastName || '',
        consent.phone || '',
        consentedDate,
        consent.source,
        consent.consentGiven ? 'Aktywna' : 'Cofnięta',
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Add UTF-8 BOM for Excel compatibility
    return '\ufeff' + csvContent;
  }
}

