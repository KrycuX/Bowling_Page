import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Inject, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminOrdersService, OrderListQuery, CreateOrderInput, UpdateOrderInput } from './admin-orders.service';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../database/entities';
import { IsString, IsOptional, IsArray, ValidateNested, IsEmail, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { createOrderSchema } from '../../../validators/adminOrders';

class CancelOrderDto {
  @IsString()
  reason: string;
}

@ApiTags('admin-orders')
@Controller('admin/orders')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
export class AdminOrdersController {
  constructor(@Inject(AdminOrdersService) private adminOrdersService: AdminOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List orders with filtering and pagination' })
  async listOrders(@Query() query: OrderListQuery) {
    return this.adminOrdersService.listOrders(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details' })
  async getOrder(@Param('id') id: string) {
    return this.adminOrdersService.getOrder(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new order' })
  async createOrder(@Body() input: CreateOrderInput, @CurrentUser() user: any) {
    // Validate input using Zod schema
    const validationResult = createOrderSchema.safeParse(input);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }));
      throw new BadRequestException({
        message: 'Validation failed',
        errors
      });
    }
    // Type assertion is safe here because Zod validation guarantees the shape matches CreateOrderInput
    return this.adminOrdersService.createOrder(validationResult.data as CreateOrderInput, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order' })
  async updateOrder(
    @Param('id') id: string,
    @Body() input: UpdateOrderInput,
    @CurrentUser() user: any,
  ) {
    return this.adminOrdersService.updateOrder(id, input, user.id);
  }

  @Post(':id/mark-paid')
  @ApiOperation({ summary: 'Mark order as paid' })
  async markOrderPaid(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adminOrdersService.markOrderPaid(id, user.id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel order' })
  async cancelOrder(
    @Param('id') id: string,
    @Body() cancelDto: CancelOrderDto,
    @CurrentUser() user: any,
  ) {
    return this.adminOrdersService.cancelOrder(id, cancelDto.reason, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete order (Admin only)' })
  async deleteOrder(@Param('id') id: string, @CurrentUser() user: any) {
    await this.adminOrdersService.deleteOrder(id, user.id);
    return { success: true };
  }
}
