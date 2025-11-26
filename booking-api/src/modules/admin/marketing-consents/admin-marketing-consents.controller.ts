import { Controller, Get, Query, UseGuards, Inject, Res, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { AdminMarketingConsentsService, MarketingConsentListQuery } from './admin-marketing-consents.service';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../database/entities';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

@ApiTags('admin-marketing-consents')
@Controller('admin/marketing-consents')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
export class AdminMarketingConsentsController {
  constructor(@Inject(AdminMarketingConsentsService) private adminMarketingConsentsService: AdminMarketingConsentsService) {}

  @Get()
  @ApiOperation({ summary: 'List marketing consents with filtering and pagination' })
  async listConsents(@Query() query: MarketingConsentListQuery) {
    return this.adminMarketingConsentsService.listConsents(query);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export marketing consents to CSV' })
  async exportCsv(@Res() res: Response) {
    try {
      const csvContent = await this.adminMarketingConsentsService.exportCsv();
      const dateStr = new Date().toISOString().split('T')[0];
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="zgody-marketingowe-${dateStr}.csv"`);
      res.send(csvContent);
    } catch (error) {
      throw new BadRequestException('Failed to export consents');
    }
  }
}

