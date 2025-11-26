import { Controller, Get, Post, Patch, Param, Body, UseGuards, Inject } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminUsersService, CreateUserInput, UpdateUserInput } from './admin-users.service';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../database/entities';

@ApiTags('admin-users')
@Controller('admin/users')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminUsersController {
  constructor(@Inject(AdminUsersService) private adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users' })
  async listUsers() {
    const users = await this.adminUsersService.listUsers();
    return { data: users };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user details' })
  async getUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminUsersService.getUser(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  async createUser(@Body() input: CreateUserInput, @CurrentUser() user: any) {
    return this.adminUsersService.createUser(input, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateUserInput,
    @CurrentUser() user: any,
  ) {
    return this.adminUsersService.updateUser(id, input, user.id);
  }
}
