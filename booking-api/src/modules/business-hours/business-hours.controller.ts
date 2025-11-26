import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BusinessHoursService } from './business-hours.service';

@ApiTags('business-hours')
@Controller('business-hours')
export class BusinessHoursController {
  constructor(
    @Inject(BusinessHoursService) 
    private readonly businessHoursService: BusinessHoursService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get business hours including weekly schedule, day offs, and today status' })
  async getBusinessHours() {
    return this.businessHoursService.getBusinessHours();
  }
}

