import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { GalleryImage } from '../../database/entities';
import { AdminGalleryModule } from '../admin/gallery/admin-gallery.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GalleryImage]),
  ],
  controllers: [GalleryController],
  providers: [GalleryService],
  exports: [GalleryService],
})
export class GalleryModule {}

