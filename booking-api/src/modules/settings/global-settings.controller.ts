import { Controller, Get, Query, ValidationPipe, Res, Header, Inject } from '@nestjs/common';
import { GlobalSettingsService } from './global-settings.service';
import { ApiOperation } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ResourceType } from '../../database/entities';

export class ScheduleQueryDto {
  @IsOptional()
  @IsEnum(ResourceType)
  resourceType?: ResourceType;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  resourceId?: number;
}

@Controller('global-settings')
export class GlobalSettingsController {
  constructor(@Inject(GlobalSettingsService) private readonly globalSettingsService: GlobalSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get global settings' })
  async getGlobalSettings() {
    const settings = await this.globalSettingsService.getGlobalSettings();
    return { settings };
  }
}
