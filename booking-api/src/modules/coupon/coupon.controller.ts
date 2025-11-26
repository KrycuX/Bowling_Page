import { Controller, Post, Body, Get, Inject } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { IsString, IsEmail, IsArray, ValidateNested, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ResourceType } from '../../database/entities';

class CartItemDto {
  @IsEnum(ResourceType)
  resourceType: ResourceType;

  @IsNumber()
  @Min(0)
  totalAmount: number;
}

class ValidateCouponDto {
  @IsString()
  code: string;

  @IsEmail()
  email: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];
}

@Controller('coupons')
export class CouponController {
  constructor(@Inject(CouponService) private readonly couponService: CouponService) {}

  @Post('validate')
  async validateCoupon(@Body() validateDto: ValidateCouponDto) {
    return this.couponService.validateCoupon(validateDto);
  }

  @Get('public')
  async getPublicCoupons() {
    return this.couponService.getPublicCoupons();
  }
}
