import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { 
  Coupon, 
  CouponAllowedType, 
  CouponEmailAssignment, 
  CouponRedemption 
} from '../../database/entities';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    Coupon, 
    CouponAllowedType, 
    CouponEmailAssignment, 
    CouponRedemption
  ])],
  controllers: [CouponController],
  providers: [CouponService],
})
export class CouponModule {}
