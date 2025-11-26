import { Controller, Get, Post, Put, Param, Body, Delete, UseGuards, Inject } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminCouponsService, CreateCouponInput, UpdateCouponInput } from './admin-coupons.service';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../database/entities';
import { IsString, IsArray } from 'class-validator';

class ImportAssignmentsDto {
  @IsString()
  csv: string;
}

@ApiTags('admin-coupons')
@Controller('admin/coupons')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminCouponsController {
  constructor( @Inject(AdminCouponsService) private readonly adminCouponsService: AdminCouponsService) {}

  @Get()
  @ApiOperation({ summary: 'List all coupons' })
  async listCoupons() {
    return this.adminCouponsService.listCoupons();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get coupon details' })
  async getCoupon(@Param('id', ParseIntPipe) id: number) {
    return this.adminCouponsService.getCoupon(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new coupon' })
  async createCoupon(@Body() input: CreateCouponInput) {
    return this.adminCouponsService.createCoupon(input);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update coupon' })
  async updateCoupon(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateCouponInput,
  ) {
    return this.adminCouponsService.updateCoupon(id, input);
  }

  @Post(':id/toggle')
  @ApiOperation({ summary: 'Toggle coupon active status' })
  async toggleCoupon(@Param('id', ParseIntPipe) id: number) {
    return this.adminCouponsService.toggleCoupon(id);
  }

  @Get(':id/assignments')
  @ApiOperation({ summary: 'Get coupon email assignments' })
  async getAssignments(@Param('id', ParseIntPipe) id: number) {
    return this.adminCouponsService.getCouponAssignments(id);
  }

  @Post(':id/assignments/import')
  @ApiOperation({ summary: 'Import email assignments from CSV' })
  async importAssignments(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ImportAssignmentsDto,
  ) {
    const emails = dto.csv.split('\n').map((line) => line.trim()).filter(Boolean);
    return this.adminCouponsService.importAssignments(id, emails);
  }

  @Delete(':id/assignments/:assignmentId')
  @ApiOperation({ summary: 'Delete email assignment' })
  async deleteAssignment(
    @Param('id', ParseIntPipe) id: number,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
  ) {
    await this.adminCouponsService.deleteAssignment(id, assignmentId);
    return { success: true };
  }

  @Get(':id/redemptions')
  @ApiOperation({ summary: 'Get coupon redemption history' })
  async getRedemptions(@Param('id', ParseIntPipe) id: number) {
    return this.adminCouponsService.getCouponRedemptions(id);
  }
}
