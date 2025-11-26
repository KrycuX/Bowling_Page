import { Controller, Get, Param, Query, UseGuards, Inject, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminContactService, ContactSubmissionListQuery } from './admin-contact.service';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../database/entities';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

@ApiTags('admin-contact')
@Controller('admin/contact')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
export class AdminContactController {
  constructor(@Inject(AdminContactService) private readonly adminContactService: AdminContactService) {}

  @Get('submissions')
  @ApiOperation({ summary: 'List contact form submissions' })
  async listSubmissions(@Query() query: ContactSubmissionListQuery) {
    return this.adminContactService.listSubmissions(query);
  }

  @Get('submissions/:id')
  @ApiOperation({ summary: 'Get contact submission details' })
  async getSubmission(@Param('id', ParseIntPipe) id: number) {
    return this.adminContactService.getSubmission(id);
  }
}

