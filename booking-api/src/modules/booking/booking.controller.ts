import { Controller, Post, Body, Inject, Req } from '@nestjs/common';
import { Request } from 'express';
import { BookingService } from './booking.service';
import { CreateHoldDto } from './dto/create-hold.dto';
import { IsString } from 'class-validator';

class CheckoutDto {
  @IsString()
  orderId: string;
}

@Controller()
export class BookingController {
  constructor(@Inject (BookingService) private readonly bookingService: BookingService) {}

  @Post('hold')
  async createHold(@Body() createHoldDto: CreateHoldDto, @Req() request: Request) {
    return this.bookingService.createHold(createHoldDto, request);
  }

  @Post('checkout')
  async initiateCheckout(@Body() checkoutDto: CheckoutDto) {
    return this.bookingService.initiateCheckout(checkoutDto.orderId);
  }
}
