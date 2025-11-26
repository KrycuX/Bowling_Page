import { Controller, Post, Body, Inject, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { BookingService } from './booking.service';
import { CreateHoldDto } from './dto/create-hold.dto';
import { TurnstileGuard } from '../../common/guards/turnstile.guard';
import { IsString } from 'class-validator';

class CheckoutDto {
  @IsString()
  orderId: string;
}

@Controller()
export class BookingController {
  constructor(@Inject (BookingService) private readonly bookingService: BookingService) {}

  @Post('hold')
  @UseGuards(TurnstileGuard)
  async createHold(@Body() createHoldDto: CreateHoldDto, @Req() request: Request) {
    return this.bookingService.createHold(createHoldDto, request);
  }

  @Post('checkout')
  @UseGuards(TurnstileGuard)
  async initiateCheckout(@Body() checkoutDto: CheckoutDto) {
    return this.bookingService.initiateCheckout(checkoutDto.orderId);
  }
}
