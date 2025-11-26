import { IsArray, ValidateNested, IsString, IsEmail, IsOptional, IsEnum, IsNumber, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../../database/entities';

export class HoldItemDto {
  @IsNumber()
  @Min(1)
  resourceId: number;

  @IsString()
  date: string;

  @IsString()
  start: string;

  @IsNumber()
  duration: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  peopleCount?: number;

  @IsOptional()
  @IsString()
  pricingMode?: string;
}

export class CustomerDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateHoldDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HoldItemDto)
  items: HoldItemDto[];

  @ValidateNested()
  @Type(() => CustomerDto)
  customer: CustomerDto;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;
}
