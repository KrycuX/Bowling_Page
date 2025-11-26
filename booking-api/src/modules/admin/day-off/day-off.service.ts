import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DayOff } from '../../../database/entities';

@Injectable()
export class DayOffService {
  constructor(
    @InjectRepository(DayOff)
    private dayOffRepository: Repository<DayOff>,
  ) {}

  async create(date: string, reason?: string | null): Promise<DayOff> {
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('Date must be in YYYY-MM-DD format');
    }

    // Check if date is in the past
    const dateObj = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj < today) {
      throw new BadRequestException('Cannot create day off for past dates');
    }

    // Check if already exists
    const existing = await this.dayOffRepository.findOne({
      where: { date },
    });

    if (existing) {
      throw new BadRequestException('Day off for this date already exists');
    }

    const dayOff = this.dayOffRepository.create({
      date,
      reason: reason || null,
    });

    return this.dayOffRepository.save(dayOff);
  }

  async delete(date: string): Promise<void> {
    const dayOff = await this.dayOffRepository.findOne({
      where: { date },
    });

    if (!dayOff) {
      throw new NotFoundException('Day off not found');
    }

    await this.dayOffRepository.remove(dayOff);
  }

  async getAll(): Promise<DayOff[]> {
    return this.dayOffRepository.find({
      order: { date: 'ASC' },
    });
  }

  async isDayOff(date: string): Promise<boolean> {
    const dayOff = await this.dayOffRepository.findOne({
      where: { date },
    });

    return !!dayOff;
  }

  async getUpcomingDayOffs(limit: number = 10): Promise<DayOff[]> {
    const today = new Date().toISOString().split('T')[0];
    
    return this.dayOffRepository
      .createQueryBuilder('dayOff')
      .where('dayOff.date >= :today', { today })
      .orderBy('dayOff.date', 'ASC')
      .limit(limit)
      .getMany();
  }

  async getDayOff(date: string): Promise<DayOff | null> {
    return this.dayOffRepository.findOne({
      where: { date },
    });
  }
}
