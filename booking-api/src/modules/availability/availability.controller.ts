import { Controller, Get, Query, ValidationPipe ,Inject,} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { IsOptional, IsEnum, IsInt, Min, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ResourceType } from '../../database/entities';

export class AvailabilityQueryDto {
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

@ApiTags('availability')
@Controller('availability')
export class AvailabilityController {
  constructor(@Inject(AvailabilityService) private availabilityService: AvailabilityService) {}

  @Get()
  @ApiOperation({ summary: 'Get resource availability for a specific date' })
  @ApiQuery({ name: 'date', description: 'Date in YYYY-MM-DD format', example: '2024-01-15' })
  @ApiQuery({ name: 'resourceType', enum: ResourceType, required: false, description: 'Filter by resource type' })
  @ApiQuery({ name: 'resourceId', type: 'integer', required: false, description: 'Filter by specific resource ID' })
  @ApiResponse({ status: 200, description: 'Availability data returned successfully' })
  async getAvailability(
    @Query(new ValidationPipe({ transform: true })) query: AvailabilityQueryDto,
  ) {
    return this.availabilityService.getAvailability(
      query.date,
      query.resourceType,
      query.resourceId,
    );
  }
}
