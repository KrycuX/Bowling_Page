import { Controller, Get, Post, Delete, Param, Body, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DayOffService } from './day-off.service';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../database/entities';
import { IsString, IsOptional, Matches } from 'class-validator';

class CreateDayOffDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format' })
  date: string;

  @IsOptional()
  @IsString()
  reason?: string | null;
}

@ApiTags('admin-day-off')
@Controller('admin/day-off')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class DayOffController {
  constructor(@Inject(DayOffService) private readonly dayOffService: DayOffService) {}

  @Get()
  @ApiOperation({ summary: 'Get all day offs' })
  @ApiResponse({ status: 200, description: 'List of all day offs' })
  async getAll() {
    const dayOffs = await this.dayOffService.getAll();
    return { dayOffs };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new day off' })
  @ApiResponse({ status: 201, description: 'Day off created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request (invalid date or duplicate)' })
  async create(@Body() dto: CreateDayOffDto) {
    const dayOff = await this.dayOffService.create(dto.date, dto.reason);
    return { ok: true, dayOff };
  }

  @Delete(':date')
  @ApiOperation({ summary: 'Delete a day off by date' })
  @ApiResponse({ status: 200, description: 'Day off deleted successfully' })
  @ApiResponse({ status: 404, description: 'Day off not found' })
  async delete(@Param('date') date: string) {
    await this.dayOffService.delete(date);
    return { ok: true };
  }
}
