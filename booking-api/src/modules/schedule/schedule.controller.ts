import { Controller, Get, Query, ValidationPipe, Res, Header, Inject, } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { IsOptional, IsEnum, IsInt, Min, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ResourceType } from '../../database/entities';

export class ScheduleQueryDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in YYYY-MM-DD format' })
  date: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // Convert lowercase snake_case to uppercase (e.g., bowling_lane -> BOWLING_LANE)
      return value.toUpperCase() as ResourceType;
    }
    return value;
  })
  @IsEnum(ResourceType)
  resourceType?: ResourceType;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  })
  @IsInt()
  @Min(1)
  resourceId?: number;
}

@Controller('schedule')
export class ScheduleController {
  constructor( @Inject (ScheduleService) private readonly scheduleService: ScheduleService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  async getSchedule(
    @Query(new ValidationPipe({ transform: true })) query: ScheduleQueryDto,
  ) {
    if (!this.scheduleService) {
      throw new Error('ScheduleService is not available');
    }
    
    return this.scheduleService.getScheduleForDate(
      query.date,
      query.resourceType,
      query.resourceId,
      false,
    );
  }
}
