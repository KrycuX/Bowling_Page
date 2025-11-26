import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource, ReservedSlot } from '../../database/entities';
import { buildAvailabilityGrid } from '../../domain/availability.domain';
import { getDayRange, getDayStart } from '../../domain/time';

import { GlobalSettingsService } from '../settings/global-settings.service';
import { AdminSettingsService } from '../admin/settings/admin-settings.service';
import { DayOffService } from '../admin/day-off/day-off.service';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
    @InjectRepository(ReservedSlot)
    private reservedSlotRepository: Repository<ReservedSlot>,
    @Inject(GlobalSettingsService)
    private globalSettingsService: GlobalSettingsService,
    @Inject(AdminSettingsService)
    private adminSettingsService: AdminSettingsService,
    @Inject(DayOffService)
    private dayOffService: DayOffService,
  ) {}

  async getAvailability(date: string, resourceType?: string, resourceId?: number) {
    const appSettings = await this.globalSettingsService.getGlobalSettings();
    const settings = {
      TIMEZONE: appSettings.timezone,
      OPEN_HOUR: appSettings.openHour,
      CLOSE_HOUR: appSettings.closeHour,
      SLOT_INTERVAL_MINUTES: appSettings.slotIntervalMinutes,
    };

    // Check if this is a day off
    const isDayOff = await this.dayOffService.isDayOff(date);
    if (isDayOff) {
      // Return empty availability for day off
      return {
        date,
        timezone: settings.TIMEZONE,
        openHour: null,
        closeHour: null,
        slotIntervalMinutes: settings.SLOT_INTERVAL_MINUTES,
        resources: [],
        groupedByType: {
          bowlingLanes: [],
          billiardsTables: [],
          quizRooms: [],
          karaokeRooms: []
        },
        filters: resourceType || resourceId ? { resourceType, resourceId } : undefined,
        closed: true,
        reason: 'Day off'
      };
    }

    // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dateObj = new Date(date + 'T12:00:00'); // Use noon to avoid timezone issues
    const dayOfWeek = dateObj.getDay();

    // Get hours for this specific day
    const dayHours = this.adminSettingsService.getWeeklyHoursForDay(appSettings, dayOfWeek);
    
    let openHour: number;
    let closeHour: number;

    if (dayHours && !dayHours.closed) {
      // Use day-specific hours
      openHour = dayHours.openHour;
      closeHour = dayHours.closeHour;
    } else if (dayHours && dayHours.closed) {
      // Day is closed (configured as closed in weekly hours)
      return {
        date,
        timezone: settings.TIMEZONE,
        openHour: null,
        closeHour: null,
        slotIntervalMinutes: settings.SLOT_INTERVAL_MINUTES,
        resources: [],
        groupedByType: {
          bowlingLanes: [],
          billiardsTables: [],
          quizRooms: [],
          karaokeRooms: []
        },
        filters: resourceType || resourceId ? { resourceType, resourceId } : undefined,
        closed: true,
        reason: 'Closed day'
      };
    } else {
      // Fallback to legacy global hours
      openHour = settings.OPEN_HOUR ?? 10;
      closeHour = settings.CLOSE_HOUR ?? 22;
    }

    const { start, end } = getDayRange(date, settings.TIMEZONE);
    const dayStart = getDayStart(date, settings.TIMEZONE);

    let query = this.resourceRepository.createQueryBuilder('resource')
      .select(['resource.id', 'resource.name', 'resource.type', 'resource.pricePerHour', 'resource.priceFlat']);

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
        timezone: settings.TIMEZONE,
        openHour: openHour,
        closeHour: closeHour,
        slotIntervalMinutes: settings.SLOT_INTERVAL_MINUTES,
        resources: [],
        groupedByType: {
          bowlingLanes: [],
          billiardsTables: [],
          quizRooms: [],
          karaokeRooms: []
        },
        filters: resourceType || resourceId ? { resourceType, resourceId } : undefined
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
      .getMany();

    const resourceMap = new Map(resources.map((resource) => [resource.id, resource]));
    const reservationMap = new Map<number, ReservedSlot[]>();

    for (const reservation of reservations) {
      if (!reservationMap.has(reservation.resourceId)) {
        reservationMap.set(reservation.resourceId, []);
      }
      reservationMap.get(reservation.resourceId)!.push(reservation);
    }

    const availabilityData = resources.map((resource) => {
      const resourceReservations = reservationMap.get(resource.id) ?? [];
      const grid = buildAvailabilityGrid(
        dayStart,
        openHour,
        closeHour,
        settings.TIMEZONE,
        resourceReservations,
        settings.SLOT_INTERVAL_MINUTES
      );

      return {
        id: resource.id,
        name: resource.name,
        type: resource.type,
        pricePerHour: resource.pricePerHour ? Number(resource.pricePerHour) : null,
        priceFlat: resource.priceFlat ? Number(resource.priceFlat) : null,
        slots: grid
      };
    });

    // Group resources by type
    const groupedByType = {
      bowlingLanes: availabilityData.filter(r => r.type === 'BOWLING_LANE'),
      billiardsTables: availabilityData.filter(r => r.type === 'BILLIARDS_TABLE'),
      quizRooms: availabilityData.filter(r => r.type === 'QUIZ_ROOM'),
      karaokeRooms: availabilityData.filter(r => r.type === 'KARAOKE_ROOM')
    };

    return {
      date,
      timezone: settings.TIMEZONE,
      openHour: openHour,
      closeHour: closeHour,
      slotIntervalMinutes: settings.SLOT_INTERVAL_MINUTES,
      resources: availabilityData,
      groupedByType,
      filters: resourceType || resourceId ? { resourceType, resourceId } : undefined
    };
  }
}
