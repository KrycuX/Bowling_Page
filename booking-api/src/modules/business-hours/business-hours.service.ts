import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DayOff } from '../../database/entities';
import { AdminSettingsService } from '../admin/settings/admin-settings.service';

@Injectable()
export class BusinessHoursService {
  constructor(
    @InjectRepository(DayOff)
    private dayOffRepository: Repository<DayOff>,
    @Inject(AdminSettingsService)
    private adminSettingsService: AdminSettingsService,
  ) {}

  async getBusinessHours() {
    // Get settings
    const settings = await this.adminSettingsService.getSettings();
    
    // Get all day offs
    const dayOffs = await this.dayOffRepository.find({
      order: { date: 'ASC' },
    });

    // Get today's status
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const dayOfWeek = today.getDay();
    
    const todayIsDayOff = dayOffs.some(dayOff => dayOff.date === todayStr);
    const dayHours = this.adminSettingsService.getWeeklyHoursForDay(settings, dayOfWeek);
    
    const todayStatus = {
      isOpen: todayIsDayOff ? false : !dayHours?.closed,
      openHour: dayHours?.openHour ?? null,
      closeHour: dayHours?.closeHour ?? null,
      isDayOff: todayIsDayOff,
    };

    return {
      weekly: settings.weeklyHours,
      dayOffs: dayOffs.map(dayOff => ({ date: dayOff.date, reason: dayOff.reason })),
      todayStatus,
    };
  }
}

