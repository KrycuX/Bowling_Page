import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource, ReservedSlot } from '../../database/entities';
import { getDayRange, formatTimeInZone } from '../../domain/time';
import { GlobalSettingsService } from '../settings/global-settings.service';

export type ScheduleBooking = {
  from: string;
  to: string;
  status: string;
  orderId: string | null;
};

export type ScheduleResource = {
  resourceId: number;
  resourceName: string;
  bookings: ScheduleBooking[];
};

export type DaySchedule = {
  date: string;
  openHour: number;
  closeHour: number;
  resources: ScheduleResource[];
};

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
    @InjectRepository(ReservedSlot)
    private reservedSlotRepository: Repository<ReservedSlot>,
    @Inject(GlobalSettingsService)
    private globalSettingsService: GlobalSettingsService,
  ) {
    console.log('ScheduleService constructor called');
    console.log('Resource repository:', !!this.resourceRepository);
    console.log('ReservedSlot repository:', !!this.reservedSlotRepository);
    console.log('globalSettingsService :', !!this.globalSettingsService);
  }

  async getScheduleForDate(
    date: string,
    resourceType?: string,
    resourceId?: number,
    isAdmin = false
  ): Promise<DaySchedule> {

  const settings = await this.globalSettingsService.getGlobalSettings();
    
    
    const { start, end } = getDayRange(date, settings.timezone);

    let query = this.resourceRepository.createQueryBuilder('resource');

    if (resourceType) {
      query = query.where('resource.type = :resourceType', { resourceType });
    }
    if (resourceId) {
      query = query.andWhere('resource.id = :resourceId', { resourceId });
    }

    const resources = await query.orderBy('resource.id', 'ASC').getMany();

    if (resources.length === 0) {
      return {
        date,
        openHour: settings.openHour,
        closeHour: settings.closeHour,
        resources: []
      };
    }

    const resourceIds = resources.map((r) => r.id);
    const now = new Date();

    const reservations = await this.reservedSlotRepository
      .createQueryBuilder('slot')
      .where('slot.resourceId IN (:...resourceIds)', { resourceIds })
      .andWhere('slot.startTime < :end', { end })
      .andWhere('slot.endTime > :start', { start })
      .andWhere(
        '(slot.status = :booked OR (slot.status = :hold AND slot.expiresAt > :now))',
        { booked: 'BOOKED', hold: 'HOLD', now }
      )
      .orderBy('slot.resourceId', 'ASC')
      .addOrderBy('slot.startTime', 'ASC')
      .getMany();

    if (reservations.length === 0) {
      return {
        date,
        openHour: settings.openHour,
        closeHour: settings.closeHour,
        resources: resources.map((resource) => ({
          resourceId: resource.id,
          resourceName: resource.name,
          bookings: []
        }))
      };
    }

    // Group bookings by resource
    const resourceMap = new Map<number, ScheduleResource>();
    
    resources.forEach((resource) => {
      resourceMap.set(resource.id, {
        resourceId: resource.id,
        resourceName: resource.name,
        bookings: []
      });
    });

    reservations.forEach((slot) => {
      const resource = resourceMap.get(slot.resourceId);
      if (resource) {
        resource.bookings.push({
          from: formatTimeInZone(slot.startTime, settings.timezone),
          to: formatTimeInZone(slot.endTime, settings.timezone),
          status: slot.status,
          orderId: slot.orderId
        });
      }
    });

    return {
      date,
      openHour: settings.openHour,
      closeHour: settings.closeHour,
      resources: Array.from(resourceMap.values())
    };
  }
}
